//TODO: brand view maken
//TODO: mongodb fixen
//TODO: styles

import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";


// Routers
import cardsRouter from "./routes/guitarRouter";
import {fetchBrands, fetchGuitars} from "./services/data";
import guitarRouter from "./routes/guitarRouter";
import {Brand, Guitar} from "./types";


dotenv.config();

const app: Express = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
}));
// Middleware example to add data to res.locals
app.use(async (req, res, next) => {
    try {
        // Example of fetching data (replace with your actual data fetching)
        const guitarData:Guitar[] = await fetchGuitars();
        const brandData:Brand[] = await fetchBrands();
        // Add the data to res.locals
        res.locals.guitars = guitarData;
        res.locals.brands = brandData;

res.locals.title = "Guitar Shop";
        next();
    } catch (error) {
        next(error);
    }
});
// Routes
app.use("/", guitarRouter);

app.get("/", (req, res) => {
    res.redirect("/guitars");
});

// Start server
app.set("port", process.env.PORT ?? 3000);
async function start() {
    try {
        app.listen(app.get("port"), () => {
            console.log("Server started on http://localhost:" + app.get("port"));
        });
    } catch (err) {
        console.error(err);
    }

}
start();

