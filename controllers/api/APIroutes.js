import express from "express";
import { GetALLCourse } from "../../models/course.js";
import {
  getAllQuizSummary,
  GetQuizById,
  GetAllQuiz,
  setquiz,
  deleteQuiz,
  updateQuiz,
} from "../../models/quiz.js";
import { getToken } from "../../models/token.js";
import { getUserById, addCompleteCourseToUser } from "../../models/user.js";
import { getEnrolledCourses, getNCoursesById } from "../../models/course.js";
import { getbundles } from "../../models/integration.js";

const api = express.Router();

// PUT update quiz
api.put("/quiz/:id", async (req, res) => {
  try {
    const quizId = req.params.id;
    const quizData = req.body;

    console.log("🔄 API: Updating quiz ID:", quizId);
    console.log("📝 API: Update data received:", {
      title: quizData.title,
      category: quizData.category,
      difficulty: quizData.difficulty,
      questionsCount: quizData.questions?.length,
    });

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    if (!quizData) {
      return res.status(400).json({
        success: false,
        message: "Quiz data is required",
      });
    }

    const result = await updateQuiz(quizId, quizData);

    console.log("✅ API: Quiz updated successfully");
    res.json({
      success: true,
      message: "Quiz updated successfully",
      updatedId: quizId,
    });
  } catch (error) {
    console.error("❌ API Error in /api/quiz/:id:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// POST create quiz
api.post("/setquiz", async (req, res) => {
  try {
    const quizData = req.body;

    console.log("🔄 API: Creating new quiz");
    console.log("📝 API: Quiz data received:", {
      title: quizData.title,
      category: quizData.category,
      difficulty: quizData.difficulty,
      questionsCount: quizData.questions?.length,
    });

    const result = await setquiz(quizData);

    console.log("✅ API: Quiz created successfully with ID:", result);
    res.json({
      success: true,
      message: "Quiz created successfully",
      insertId: result,
    });
  } catch (error) {
    console.error("❌ API Error in /api/setquiz:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// DELETE quiz
api.delete("/deletequiz/:id", async (req, res) => {
  try {
    const quizId = req.params.id;

    console.log("🔄 API: Deleting quiz ID:", quizId);

    const result = await deleteQuiz(quizId);

    console.log("✅ API: Quiz deleted successfully");
    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("❌ API Error in /api/deletequiz:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// GET quiz by ID
api.get("/quiz/:id", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const quizId = req.params.id;

    if (!quizId) {
      return res.status(400).json({ message: "Quiz ID is required" });
    }

    console.log("🔄 API: Fetching quiz by ID:", quizId);
    const quiz = await GetQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    console.log("✅ API: Quiz found:", quiz.title);
    res.json(quiz);
  } catch (error) {
    console.error("❌ API Error in /api/quiz/:id:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

api.get("/allcourse", async (req, res) => {
  try {
    let courses;

    if (req.query.ids) {
      const ids = req.query.ids.split(",").map(Number);
      courses = await getNCoursesById(ids);
    } else {
      courses = await GetALLCourse();
    }

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

api.get("/allquiz", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    console.log("🔄 API: Fetching all quizzes from database...");
    const quizzes = await getAllQuizSummary();

    if (!quizzes) {
      console.log("❌ API: No quizzes found in database");
      return res.status(404).json({ message: "No quizzes found" });
    }

    console.log(`✅ API: Found ${quizzes.length} quizzes`);
    res.json(quizzes);
  } catch (error) {
    console.error("❌ API Error in /api/allquiz:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

api.get("/getallquiz", async (req, res) => {
  try {
    const quizzes = await GetAllQuiz();

    if (!quizzes) {
      return res.status(404).json({ message: "No quizzes found" });
    }

    res.json(quizzes);
  } catch (error) {
    console.error("❌ API Error in /api/getallquiz:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

api.get("/user", async (req, res) => {
  const token = req.cookies.token;
  let payload = await getToken(token);
  let data = await getUserById(payload.id);
  res.json(data);
  return;
});

api.get("/usercourse", async (req, res) => {
  const token = req.cookies.token;
  let payload = await getToken(token);
  let data = await getEnrolledCourses(payload.id);

  res.json(data);
  return;
});

api.get("/courseComplition/:id", async (req, res) => {
  const token = req.cookies.token;
  let payload = await getToken(token);

  const q = req.params.id;

  let data = await addCompleteCourseToUser(payload.id, q);

  return res.json({
    message: "Course completion updated successfully",
    data: data,
  });
});

api.get("/getbundle", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = await getToken(token);

    const result = await getbundles(payload.id);

    return res.json(result);
  } catch (error) {
    console.error("API error:", error);
    return res
      .status(500)
      .json({ data: null, success: false, message: "Internal server error" });
  }
});

export default api;
