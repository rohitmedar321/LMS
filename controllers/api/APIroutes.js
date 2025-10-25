import express from "express";
import { GetALLCourse } from "../../models/course.js";
import {
  getAllQuizSummary,
  GetQuizById,
  GetAllQuiz,
} from "../../models/quiz.js";
import { getToken } from "../../models/token.js";
import { getUserById, addCompleteCourseToUser } from "../../models/user.js";
import { getEnrolledCourses, getNCoursesById } from "../../models/course.js";
import { getbundles } from "../../models/integration.js";

const api = express.Router();

api.get("/allcourse", async (req, res) => {
  try {
    let courses;

    // Expecting query like ?ids=1,2,3
    if (req.query.ids) {
      const ids = req.query.ids.split(",").map(Number); // Convert to array of numbers
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
  const quizzes = await getAllQuizSummary();

  if (!quizzes) {
    return res.status(404).json({ message: "No quizzes found" });
  }

  res.json(quizzes);
  return;
});

api.get("/quiz/:id", async (req, res) => {
  const quizId = req.params.id;
  ``;
  if (!quizId) {
    return res.status(400).json({ message: "Quiz ID is required" });
  }

  const quiz = await GetQuizById(quizId);

  res.json(quiz);
  return;
});

api.get("/getallquiz", async (req, res) => {
  const quizzes = await GetAllQuiz();

  if (!quizzes) {
    return res.status(404).json({ message: "No quizzes found" });
  }

  res.json(quizzes);
  return;
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

  // console.log("url:", req.url);
  // console.log("Course ID:", q, "user id :", payload.id);

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
