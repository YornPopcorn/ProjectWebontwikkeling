import { MongoClient, Db } from "mongodb";

const uri = process.env.CONNECTION_STRING || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let dbConnection: Db;

export const connectToServer = async () => {
    try {
        await client.connect();
        dbConnection = client.db("guitarShop");
        console.log("Successfully connected to MongoDB.");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
};

export const getDb = (): Db => {
    if (!dbConnection) {
        throw new Error("Database not connected. Call connectToServer() first.");
    }
    return dbConnection;
};
