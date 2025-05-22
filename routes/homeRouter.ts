import { getFilteredAndSortedGuitars, getBrands } from "../databases/dbService";
// Dashboard route
import { Router } from "express";

export default function homeRouter() {
	const router = Router();

	router.get("/dashboard", (req, res) => {
		res.redirect("guitarOverView");
	});

	router.get("/", async (req, res) => {
		try {
			const guitars = await getFilteredAndSortedGuitars();
			const brands = await getBrands();

			res.render("index", {
				guitars,
				brands,
				title: "Dashboard",
				activeTab: "home",
				currentSort: "name",
				currentDirection: "asc",
				currentFilter: "",
			});
		} catch (error) {
			console.error("Error fetching data for dashboard:", error);
			res.status(500).render("error", {
				message: "Fout bij het laden van dashboard",
				title: "Error",
			});
		}
	});
	return router;
}
