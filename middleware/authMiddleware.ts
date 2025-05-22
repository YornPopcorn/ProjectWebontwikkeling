// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../types";

const secret = process.env.JWT_SECRET ?? "";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
	// Skip authentication for public routes
	const publicPaths = ["/login", "/register", "/logout"];
	if (publicPaths.includes(req.path)) {
		return next();
	}

	const token = req.cookies.jwt;

	// If no token and trying to access protected route
	if (!token) {
		return res.redirect("/login");
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, secret) as User;
		(req as any).user = decoded;
		next();
	} catch (err) {
		// Invalid token - clear cookie and redirect
		res.clearCookie("jwt");
		res.redirect("/login");
	}
}
