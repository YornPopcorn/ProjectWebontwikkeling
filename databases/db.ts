import { MongoClient, Collection } from "mongodb";
import { Guitar, Brand } from "../types";
import fetch from "node-fetch";

// In your db.ts file, add:

export const client = new MongoClient(process.env.CONNECTION_STRING || "");


export const guitarsCollection: Collection<Guitar> = client.db("guitarDB").collection("guitars");
export const brandsCollection: Collection<Brand> = client.db("guitarDB").collection("brands");

async function seed() {
    const guitarCount = await guitarsCollection.countDocuments();
    const brandCount = await brandsCollection.countDocuments();

    if (guitarCount === 0 || brandCount === 0) {
        console.log('\x1b[33m%s\x1b[0m', 'Database is empty, fetching data from JSON files...');
        const [guitarsRes, brandsRes] = await Promise.all([
            fetch('https://raw.githubusercontent.com/YornPopcorn/Json-Gitaren/refs/heads/main/gitaren.json'),
            fetch('https://raw.githubusercontent.com/YornPopcorn/Json-Gitaren/refs/heads/main/brand.json')
        ]);
        const guitars = await guitarsRes.json() as Guitar[];
        const brands = await brandsRes.json() as Brand[];

        await brandsCollection.insertMany(brands);
        await guitarsCollection.insertMany(guitars);
        console.log('\x1b[32m%s\x1b[0m', "Database seeded successfully!");
    } else {
        console.log('\x1b[36m%s\x1b[0m', `Using existing data from MongoDB: ${guitarCount} guitars and ${brandCount} brands found`);
    }
}


async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function connect() {
    try {
        await client.connect();
        console.log("Connected to database");
        await seed();
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}