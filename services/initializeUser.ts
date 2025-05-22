import { userCollection } from "../databases/db";
import { User } from "../types";
import bcrypt from "bcrypt";

const userPass = process.env.USER_PASSWORD ?? "";
const adminPass = process.env.ADMIN_PASSWORD ?? "";
const SALTROUNDS = parseInt(process.env.SALTROUNDS || "10", 0);

export async function createInitialUser() {
	if ((await userCollection.countDocuments()) > 0) {
		return;
	}
	const user: User = {
		username: process.env.USER_NAME ?? "",
		password: await bcrypt.hash(userPass, SALTROUNDS),
		role: "USER",
	};
	let resultUser = await userCollection.insertOne(user);
	console.log(resultUser + "Loaded user in db");

	const adminUser: User = {
		username: process.env.ADMIN_NAME ?? "",
		password: await bcrypt.hash(adminPass, SALTROUNDS),
		role: "ADMIN",
	};
	let resultAdmin = await userCollection.insertOne(adminUser);
	console.log(resultAdmin + "Loaded admin in db");
}
