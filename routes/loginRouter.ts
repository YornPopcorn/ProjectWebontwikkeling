import { Router } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../types";
import { login } from "../services/login";
import { userCollection } from "../databases/db";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

const secret = process.env.JWT_SECRET ?? "";

export function loginRouter() {
	const router = Router();
	router.get("/login", (req, res) => {
		res.render("login");
	});

	router.post("/login", async (req, res) => {
		try {
			const password: string = req.body.password;
			const username: string = req.body.username;
			const user: User = await login(username, password);

			delete user.password;
			const token = jwt.sign(user, secret, { expiresIn: "7d" });

			res.cookie("jwt", token, { httpOnly: true, sameSite: "lax", secure: true });
			// Redirect to dashboard instead of root
			res.redirect("/dashboard");
		} catch (e: any) {
			res.redirect("/login");
		}
	});

	router.get("/register", (req, res) => {
		res.render("register", { error: null });
	});

	router.post("/register", async (req, res) => {
		try {
			const { username, password } = req.body;
			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser: User = {
				_id: new ObjectId(),
				username: username,
				password: hashedPassword,
				role: "USER",
			};

			await userCollection.insertOne(newUser);
			res.redirect("/login");
		} catch (error) {
			res.status(500).send("Registration failed");
		}
	});

	router.get("/logout", (req, res) => {
		res.clearCookie("jwt");
		res.redirect("/login");
	});

	return router; // BELANGRIJKE TOEVOEGING: de router returnen
}
