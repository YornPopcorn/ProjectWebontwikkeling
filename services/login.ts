import bcrypt from "bcrypt";
import { userCollection } from "../databases/db";
import { User } from "../types";

const SALTROUNDS = parseInt(process.env.SALTROUNDS || "10", 0);

export async function register(username: string, password: string) {
	if (username === "" || password === "") {
		throw new Error("username and password are required");
	}

	let user: User | null = await userCollection.findOne({
		username: username,
	});

	if (user) {
		throw new Error("User already exists");
	}
	user = {
		username: username,
		password: await bcrypt.hash(password, SALTROUNDS),
		role: "USER",
	};

	let resultUser = await userCollection.insertOne(user);
	console.log(resultUser + "Loaded user in db");
}

export async function login(username: string, password: string) {
	if (username === "" || password === "") {
		throw new Error("username and password are required");
	}

	let user: User | null = await userCollection.findOne({
		username: username,
	});

	if (!user) {
		throw new Error("username and password are required");
	}

	if (await bcrypt.compare(password, user.password!)) {
		delete user.password;
		return user;
	} else {
		throw new Error("Password incorrect");
	}
}
