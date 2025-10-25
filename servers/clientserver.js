import express from "express";
import cookieParser from "cookie-parser";
import path, { format } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { auth } from "../middleware/auth.js";
import { main } from "../controllers/routes.js";
import api from "../controllers/api/APIroutes.js";
import { envGet } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientServer = express();

clientServer.use(cookieParser());
clientServer.use(express.static(path.resolve(__dirname, "../static")));
clientServer.use(express.urlencoded({ extended: true }));
clientServer.use(
  session({
    secret: envGet("SESSION_SECRET"),
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 },
  })
);
clientServer.use(express.json());
clientServer.use(auth);

clientServer.set("view engine", "ejs");
clientServer.set("views", path.resolve(__dirname, "../views"));

clientServer.use("/", main);
clientServer.use("/api", api);

export { clientServer };
