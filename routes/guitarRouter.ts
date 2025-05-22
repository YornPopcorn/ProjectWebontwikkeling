import express, { Router } from "express";
import {
	getBrandById,
	getBrands,
	getBrandsWithCounts,
	getFilteredAndSortedGuitars,
	getGuitarById,
	getGuitars,
	getGuitarsByBrandId,
	updateGuitar,
} from "../databases/dbService";

export function guitarRouter() {
	const router = Router();

	router.get("/", async (req, res) => {
		try {
			const { sort, direction, filter } = req.query;

			const guitars = await getFilteredAndSortedGuitars(
				filter as string,
				(sort as string) || "name",
				(direction as "asc" | "desc") || "asc",
			);

			const brands = await getBrands();

			res.render("index", {
				guitars,
				brands,
				title: "Guitar Overview",
				activeTab: "home",
				currentSort: sort || "name",
				currentDirection: direction || "asc",
				currentFilter: filter || "",
			});
		} catch (error) {
			console.error("Error fetching guitars:", error);
			res.status(500).render("error", { message: "Failed to load guitars" });
		}
	});

	router.get("/guitarOverView", async (req, res) => {
		try {
			const guitars = await getGuitars();
			const brands = await getBrands(); // Haal de merken op

			res.render("guitarOverView", {
				guitars,
				brands, // Geef de merken door aan de template
				title: "Our Guitar Collection",
				activeTab: "guitars",
			});
		} catch (error) {
			console.error("Error fetching guitars:", error);
			res.status(500).render("error", { message: "Failed to load guitars" });
		}
	});

	router.get("/guitar/:id", async (req, res) => {
		try {
			const guitar = await getGuitarById(req.params.id);
			if (!guitar) {
				return res.status(404).render("error", {
					message: `Guitar with ID ${req.params.id} not found`,
				});
			}
			res.render("guitarDetail", {
				guitar,
				title: guitar.name,
			});
		} catch (error) {
			console.error("Error fetching guitar:", error);
			res.status(500).render("error", { message: "Failed to load guitar details" });
		}
	});

	router.get("/brand/:id", async (req, res) => {
		try {
			const [brand, guitars] = await Promise.all([
				getBrandById(req.params.id),
				getGuitarsByBrandId(req.params.id),
			]);

			if (!brand) {
				return res.status(404).render("error", {
					message: `Brand with ID ${req.params.id} not found`,
				});
			}

			res.render("brandDetail", {
				brand,
				guitars,
				title: `${brand.brandName} Guitars`,
			});
		} catch (error) {
			console.error("Error fetching brand:", error);
			res.status(500).render("error", { message: "Failed to load brand details" });
		}
	});

	// NEW: Route to show all brands with guitar counts
	// In guitarRouter.ts, vervang deze route:
	router.get("/brands", async (req, res) => {
		try {
			// Haal merken op
			const brands = await getBrandsWithCounts();

			// Haal gitaartypes op
			const guitars = await getGuitars();
			const guitarTypes = Array.from(new Set(guitars.map((guitar) => guitar.type)));

			// Render de view met alle benodigde gegevens
			res.render("BrandOverView", {
				brands,
				guitarTypes, // Dit is wat je miste
				title: "All Brands",
				activeTab: "brands",
				currentSort: "brandName",
				currentDirection: "asc",
				currentFilter: "",
			});
		} catch (error) {
			console.error("Error fetching brands:", error);
			res.status(500).render("error", { message: "Failed to load brands" });
		}
	});

	router.get("/guitar/:id/edit", async (req, res) => {
		const guitar = await getGuitarById(req.params.id);
		const brands = await getBrands();
		if (!guitar) {
			return res.status(404).render("error", { message: "Guitar not found" });
		}
		res.render("editGuitar", { guitar, brands, title: "Edit Guitar" });
	});

	router.post("/guitar/:id/edit", async (req, res) => {
		const guitarId = req.params.id;
		const formData = req.body;

		try {
			// Convert brandId to a number
			formData.brandId = parseInt(formData.brandId);

			// Handle the boolean value for active
			formData.active = formData.active === "on";

			// Convert age to a number
			formData.age = parseInt(formData.age);

			// Get the brand information
			const brand = await getBrandById(formData.brandId);

			// Update the guitar with the form data
			const updatedGuitar = {
				name: formData.name,
				description: formData.description,
				age: formData.age,
				active: formData.active,
				type: formData.type,
				brand: brand || undefined,
			};

			// Call a function to update the guitar in the database
			await updateGuitar(parseInt(guitarId), updatedGuitar);

			// Redirect to the guitar detail page
			res.redirect(`/guitar/${guitarId}`);
		} catch (error) {
			console.error("Error updating guitar:", error);
			res.status(500).render("error", { message: "Failed to update guitar" });
		}
	});

	return router;
}
