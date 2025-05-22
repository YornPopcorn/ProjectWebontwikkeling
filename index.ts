import express from "express";
import path from "path";
import dotenv from "dotenv";
import { router } from "./routes/router";
import { connect } from "./databases/db";
import { createInitialUser } from "./services/initializeUser";
import { loginRouter } from "./routes/loginRouter";
import { authMiddleware } from "./middleware/authMiddleware";
import cookieParser from "cookie-parser";
import { guitarRouter } from "./routes/guitarRouter";
import brandRouter from "./routes/brandRouter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basis Express configuratie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser()); // Cookie parser toevoegen voor JWT cookies
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 1. Eerst de niet-beveiligde routes (login/register) toevoegen
app.use("/", loginRouter());

// 2. Dan de auth middleware toepassen voor alle volgende routes
app.use(authMiddleware);

// 3. Alle beveiligde routes hieronder toevoegen
app.use("/", guitarRouter()); // Dashboard en guitar routes
app.use("/", brandRouter()); // Brand routes

// 4. Optioneel: generieke router toevoegen (als deze andere routes bevat)
router(app);

// 5. Fallback route voor 404
app.use((req, res) => {
	res.status(404).render("error", {
		message: "Page not found",
		title: "Error 404",
	});
});

// Server starten als laatste stap
app.listen(PORT, async () => {
	await connect();
	await createInitialUser();
	console.log(`Server draait op poort http://localhost:${PORT}`);
});
