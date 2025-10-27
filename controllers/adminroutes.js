import express from "express";
import { renderBaseHTML } from "../models/template.js";
import path from "path";
import upload from "../models/uploads.js";
import { SetCourses, GetCourseById } from "../models/course.js";
import { makeStream } from "../models/ffmpeg.js";
import { readToken } from "../models/token.js";
import db from "../db/db.js"; // Add this import

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
    description: course.description,
    src: coursesrc,
    notes: null,
  });
});

///////
main.get("/edit-course", async (req, res) => {
  const courseId = req.query.id;

  if (!courseId) {
    return res.status(400).send("Course ID is required");
  }

  const course = await GetCourseById(courseId);

  res.render("editCourseTemplate", {
    // Create this new template
    course: course,
    title: `Edit ${course.title}`,
    description: course.description,
    notes: null,
  });
});
///

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

    // Add notes path if PDF was uploaded //////////
    if (req.files.pdf && req.files.pdf[0]) {
      course.notes = `/uploads/${req.files.pdf[0].filename}`; // or the actual path you want to store
    }
    //////////////

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

// Update this route to handle file uploads
main.post(
  "/update-course",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("Update course request body:", req.body);
    console.log("Update course files:", req.files);

    const { courseId, title, description } = req.body;

    if (!courseId) {
      return res.status(400).send("Course ID is required");
    }

    try {
      // Build update data
      const updateData = { title, description };

      // Handle file updates if new files are uploaded
      if (req.files.image) {
        updateData.image = req.files.image[0].filename;
      }
      if (req.files.video) {
        // Handle video processing if needed
        console.log("New video uploaded:", req.files.video[0].filename);
      }
      if (req.files.pdf) {
        updateData.notes = `/uploads/${req.files.pdf[0].filename}`;
      }

      const [result] = await db.query(
        "UPDATE courses SET title = ?, description = ? WHERE id = ?",
        [title, description, courseId]
      );

      if (result.affectedRows === 0) {
        return res.redirect("/?error=Course not found or no changes made");
      }

      res.redirect("/?message=Course updated successfully");
    } catch (error) {
      console.error("Error updating course:", error);
      res.redirect("/?error=Error updating course");
    }
  }
);


export { main };
