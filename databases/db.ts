import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import { Guitar, Brand, User } from "../types";

dotenv.config();

// Validate and use connection string
const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
	throw new Error("MongoDB connection string not configured");
}

export const client = new MongoClient(connectionString);

// Collections with proper typing
export const guitarsCollection: Collection<Guitar> = client.db().collection("guitars");
export const brandsCollection: Collection<Brand> = client.db().collection("brands");
export const userCollection: Collection<User> = client.db().collection("users");

// Connection management
export async function connect() {
	try {
		await client.connect();
		console.log("Connected to database");

		// Verify connection
		await client.db().admin().ping();
		console.log("Database ping successful");

		// Seed data if needed
		await seed();
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
}

async function seed() {
	// Your existing seed function
}

// Cleanup on exit
process.on("SIGINT", async () => {
	await client.close();
	process.exit(0);
});
