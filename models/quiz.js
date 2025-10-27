import db from "../db/db.js";

const GetAllQuiz = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM quiz ");
    return rows;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
};

const getAllQuizSummary = async () => {
  try {
    const [rows] = await db.query(
      "SELECT id, title, difficulty, category FROM quiz"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    throw new Error("Failed to fetch quizzes");
  }
};

const GetQuizById = async (quizId) => {
  try {
    const [rows] = await db.query("SELECT * FROM quiz WHERE id = ?", [quizId]);
    return rows[0];
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    throw error;
  }
};

const setquiz = async (data) => {
  try {
    // console.log("Setting quiz data:", data);

    const { title, difficulty, category, questions } = data;

    // Convert to JSON string for MySQL
    const questionsJSON = JSON.stringify(questions);

    const [result] = await db.query(
      "INSERT INTO quiz (title, difficulty, category, questions) VALUES (?, ?, ?, CAST(? AS JSON))",
      [title, difficulty, category, questionsJSON]
    );

    // console.log("Quiz inserted with ID:", result.insertId);
    return result.insertId;
  } catch (error) {
    console.error("Error inserting quiz:", error);
    return error;
  }
};

const deleteQuiz = async (quizId) => {
  try {
    const [result] = await db.query("DELETE FROM quiz WHERE id = ?", [quizId]);
    if (result.affectedRows === 0) {
      return new Error("Quiz not found");
    }
    return { message: "Quiz deleted successfully" };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return error;
  }
};
////////
const updateQuiz = async (quizId, data) => {
  try {
    console.log("🔄 MODEL: Updating quiz ID:", quizId);
    console.log("📝 MODEL: Update data received:", data);

    const { title, difficulty, category, questions } = data;

    // FIXED: Better data transformation
    const transformedQuestions = questions.map((q, index) => {
      // Ensure answers array is properly formatted
      const answers = Array.isArray(q.answers)
        ? q.answers.map((ans, ansIndex) => ({
            id: ans.id || `ans${index}_${ansIndex}`,
            text: ans.text || ans, // Handle both object and string formats
          }))
        : [];

      return {
        id: q.id || `q${index + 1}`,
        question: q.question || "",
        category: q.category || "",
        answer: q.answer || "",
        answers: answers,
      };
    });

    console.log("🔄 MODEL: Transformed questions:", transformedQuestions);

    // Convert to JSON string for MySQL
    const questionsJSON = JSON.stringify(transformedQuestions);

    const [result] = await db.query(
      "UPDATE quiz SET title = ?, difficulty = ?, category = ?, questions = CAST(? AS JSON) WHERE id = ?",
      [title, difficulty, category, questionsJSON, quizId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Quiz not found or no changes made");
    }

    console.log(
      "✅ MODEL: Quiz updated successfully, affected rows:",
      result.affectedRows
    );
    return {
      message: "Quiz updated successfully",
      id: quizId,
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error("❌ MODEL: Error updating quiz:", error);
    throw error;
  }
};

export {
  GetAllQuiz,
  GetQuizById,
  getAllQuizSummary,
  setquiz,
  deleteQuiz,
  updateQuiz,
};
