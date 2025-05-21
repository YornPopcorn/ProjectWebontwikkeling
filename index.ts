import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
dotenv.config();
import { connect } from "./services/db";
import {getGuitars, getBrands} from "./services/dbService";
import guitarRouter from "./routes/guitarRouter";
import brandRouter from './routes/brandRouter';



const app: Express = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
}));


app.use(express.json());

// Routers registreren
app.use('/api/brands', brandRouter);



app.use(async (req, res, next) => {
    try {
        res.locals.guitars = await getGuitars();
        res.locals.brands = await getBrands();
        res.locals.title = "Guitar Shop";
        next();
    } catch (err) {
        next(err);
    }
});

app.use("/", guitarRouter);
app.use('/', brandRouter);

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
});
