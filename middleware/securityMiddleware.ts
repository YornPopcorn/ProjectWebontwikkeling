import jwt from "jsonwebtoken";
import { User } from "../types";

export function securityMiddleware(req: any, res: any, next: any) {
	// Skip authenticatie voor login en register routes
	if (req.path.startsWith("/auth")) {
		return next();
	}

	const token = req.cookies.jwt;

	if (!token) {
		return res.redirect("/login");
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as User;
		req.user = decoded;
		next();
	} catch (error) {
		res.clearCookie("jwt");
		res.redirect("/login");
	}
}
