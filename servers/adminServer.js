import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import { main } from "../controllers/adminroutes.js";
import api from "../controllers/api/APIadminroutes.js";

const adminServer = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

adminServer.use(cookieParser());
adminServer.use(express.static(path.resolve(__dirname, "../static")));
adminServer.use(express.urlencoded({ extended: true }));
adminServer.use(express.json());

adminServer.set("view engine", "ejs");
adminServer.set("views", path.resolve(__dirname, "../views"));

adminServer.use("/", main);
adminServer.use("/api", api);

// adminServer.get("/", (req, res) => {
//     res.render("main");
// });

// // Multiple file fields
// adminServer.post(
//     "/upload",
//     upload.fields([
//         { name: "video", maxCount: 1 },
//         { name: "pdf", maxCount: 1 }
//     ]),
//     async (req, res) => {

//         // console.log("Files uploaded:", req.body);

//         let lessonId = req.lessonId

//         await makeStream(lessonId)

//         const course = req.body;

//         course.src = `${lessonId}/index.m3u8`;

//         let stats = await SetCourses(course)

//         if (stats) {
//             console.log("Course added successfully");
//         }

//         console.log("path:",path.join(__dirname, "../uploads"))
//         res.json({
//             message: "Files uploaded successfully",
//             course: {
//                 ...course,
//                 video: req.files.video ? req.files.video[0].path : null,
//                 pdf: req.files.pdf ? req.files.pdf[0].path : null
//             }
//         });
//     }
// );

export { adminServer };
