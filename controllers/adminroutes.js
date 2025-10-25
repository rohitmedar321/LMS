import express from "express";
import { renderBaseHTML } from "../models/template.js";
import path from "path";
import upload from "../models/uploads.js";
import { SetCourses, GetCourseById } from "../models/course.js";
import { makeStream } from "../models/ffmpeg.js";
import { readToken } from "../models/token.js";

const main = express.Router();

const renderPage = (filename, scriptname = "", res) => {
  renderBaseHTML(
    path.join("views", "pages", filename),
    scriptname,
    res,
    "admin"
  );
};

main.get("/", (req, res) => {
  renderPage("manageCourses.html", "uploadpage.js", res);
});

main.get("/quiz", (req, res) => {
  renderPage("manageQuiz.html", "managequiz.js", res);
});

main.get("/course", async (req, res) => {
  const courseId = req.query.id;
  let payload = await readToken(req.cookies.token);
  payload = JSON.parse(JSON.stringify(payload));

  if (!courseId) {
    return res.status(400).send("Course ID is required");
  }
  const course = await GetCourseById(courseId);

  let coursesrc = `${req.protocol}://${req.get("host")}/stream/${
    course.src
  }/index.m3u8`;

  res.render("courseTemplate", {
    title: course.title,
    discription: course.description,
    src: coursesrc,
  });
});

main.get("/integration", (req, res) => {
  renderPage("integration.html", "integration.js", res);
});

main.post(
  "/upload",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("Files uploaded:", req.body);

    let lessonId = req.lessonId;
    console.log("Lesson ID:", lessonId);

    await makeStream(lessonId);

    const course = req.body;

    course.src = `${lessonId}`;

    let stats = await SetCourses(course);

    if (stats) {
      console.log("Course added successfully");
    }

    res.json({
      message: "Files uploaded successfully",
      course: {
        ...course,
        video: req.files.video ? req.files.video[0].path : null,
        pdf: req.files.pdf ? req.files.pdf[0].path : null,
      },
    });
  }
);

export { main };
