import express from "express";
import {
  GetAllQuiz,
  setquiz,
  deleteQuiz,
  updateQuiz,
} from "../../models/quiz.js";
import {
  GetALLCourse,
  deleteCourseById,
  GetCourseSrcById,
} from "../../models/course.js";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

const api = express.Router();

api.get("/allquiz", async (req, res) => {
  let data = await GetAllQuiz();

  if (!data) {
    return res.status(404).json({ message: "No quizzes found" });
  }

  return res.json(data);
});

api.get("/allcourse", async (req, res) => {
  const courses = await GetALLCourse();

  if (!courses) {
    return res.status(404).json({ message: "No courses found" });
  }

  res.json(courses);
  return;
});

api.post("/setquiz", async (req, res) => {
  let quiz = req.body;

  console.log("Received quiz data:", quiz);

  let data = setquiz(quiz);

  return res.json({ message: "Quiz data received", statuscode: 200 });
});

api.post("/quiz/:id", async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const quizData = req.body;

    console.log("🔄 Updating quiz with ID:", quizId);
    console.log("📦 Update data:", quizData);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const result = await updateQuiz(quizId, quizData);
    return res.json(result);
  } catch (error) {
    console.error("❌ Error updating quiz:", error);
    return res.status(500).json({ message: "Error updating quiz" });
  }
});

api.get("/deletequiz/:id", async (req, res) => {
  try {
    let quizId = parseInt(req.params.id); // Convert to number
    console.log("Deleting quiz with ID:", quizId);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    let data = await deleteQuiz(quizId);
    return res.json(data);
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return res.status(500).json({ message: "Error deleting quiz" });
  }
});

api.get("/getallquiz", async (req, res) => {
  const quizzes = await GetAllQuiz();

  if (!quizzes) {
    return res.status(404).json({ message: "No quizzes found" });
  }

  res.json(quizzes);
  return;
});

api.get("/deletecourse/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log("🔄 DELETE COURSE: Starting deletion for ID:", courseId);
    console.log("📝 Full URL:", req.originalUrl);

    // Get course source info
    let courseSrc = await GetCourseSrcById(courseId);
    console.log("📁 Course source from DB:", courseSrc);

    if (!courseSrc) {
      console.log("❌ Course not found in database");
      return res.status(404).json({ message: "Course not found" });
    }

    courseSrc = courseSrc.src;
    console.log("📁 Course source path:", courseSrc);

    // Build paths from courseSrc
    const inputPath = path.join(__dirname, "uploads", courseSrc);
    const outputPath = path.join(__dirname, "static", "stream", courseSrc);

    console.log("🗑️ Paths to delete:", { inputPath, outputPath });

    // Delete folders if they exist
    try {
      if (fs.existsSync(inputPath)) {
        fs.rmSync(inputPath, { recursive: true, force: true });
        console.log("✅ Deleted input folder:", inputPath);
      } else {
        console.log("ℹ️ Input folder not found:", inputPath);
      }

      if (fs.existsSync(outputPath)) {
        fs.rmSync(outputPath, { recursive: true, force: true });
        console.log("✅ Deleted output folder:", outputPath);
      } else {
        console.log("ℹ️ Output folder not found:", outputPath);
      }
    } catch (fsErr) {
      console.error("❌ File deletion error:", fsErr);
    }

    // Delete course from DB
    console.log("🗃️ Deleting from database...");
    const result = await deleteCourseById(courseId);

    if (result) {
      console.log("✅ Course deleted successfully from database");
      return res.json({ message: "Course deleted successfully" });
    } else {
      console.log("❌ Error deleting course from database");
      return res.status(500).json({ message: "Error deleting course from DB" });
    }
  } catch (err) {
    console.error("❌ Delete course error:", err);
    return res
      .status(500)
      .json({ message: "Server error while deleting course" });
  }
});

export default api;
