import cookieParser from "cookie-parser";
import { securityMiddleware } from "../middleware/securityMiddleware";
import { loginRouter } from "./loginRouter";
import { Express } from "express";
import brandRouter from "./brandRouter";
import { guitarRouter } from "./guitarRouter";
import homeRouter from "./homeRouter";
import { authMiddleware } from "../middleware/authMiddleware";

export function router(app: Express) {
	app.use(cookieParser());

	app.use("/", loginRouter());
	app.use(authMiddleware);
	app.use("/", homeRouter());
	app.use("/brand", authMiddleware, brandRouter());
	app.use("/guitar", authMiddleware, guitarRouter());

	app.use((req, res) => {
		res.status(404).render("error", {
			message: "Page not found",
			title: "Error 404",
		});
	});
}
