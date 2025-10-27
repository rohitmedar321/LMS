import db from "../db/db.js";

const SetCourses = async (course) => {
  try {
    db.query(
      "INSERT INTO courses (title, description,  src , image, notes) VALUES (?, ?, ?, ?, ?)",
      [
        course.title,
        course.description,
        course.src,
        course.thumnail,
        course.notes,
      ]
    );

    return true;
  } catch (error) {
    console.error("Error setting course:", error);
    return false;
  }
};

async function GetCourseById(id) {
  try {
    const [rows] = await db.query("SELECT * FROM courses WHERE id = ?", [id]);

    if (!rows || rows.length === 0) {
      console.warn(`Course with ID ${id} not found.`);
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

async function GetCourseSrcById(id) {
  try {
    const [rows] = await db.query("SELECT src FROM courses WHERE id = ?", [id]);

    if (!rows || rows.length === 0) {
      console.warn(`Course with ID ${id} not found.`);
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

async function GetALLCourse() {
  try {
    const [rows] = await db.query("SELECT * FROM courses");

    if (!rows || rows.length === 0) {
      console.warn(`Course  not found.`);
      return null;
    }

    return rows;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

const getEnrolledCourses = async (userId) => {
  try {
    const [rows] = await db.execute(
      "SELECT mycoursesid FROM user WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      // console.log("User not found");
      return [];
    }

    const courseIds = rows[0].mycoursesid || [];

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      // console.log("No enrolled courses");
      return [];
    }

    // Create ?,?,? placeholders
    const placeholders = courseIds.map(() => "?").join(",");

    const [courses] = await db.execute(
      `SELECT * FROM courses WHERE id IN (${placeholders})`,
      courseIds
    );

    return courses;
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
};

const getNCoursesById = async (ids) => {
  try {
    const placeholders = ids.map(() => "?").join(",");
    const sql = `SELECT * FROM courses WHERE id IN (${placeholders})`;

    const [courses] = await db.execute(sql, ids);
    return courses;
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
};
//////////////////////
const updateCourseById = async (courseId, updatedData) => {
  try {
    const { title, description, src, thumnail } = updatedData;

    const [result] = await db.query(
      `UPDATE courses 
             SET title = ?, description = ?, src = ?, image = ? 
             WHERE id = ?`,
      [title, description, src, thumnail, courseId]
    );

    if (result.affectedRows === 0) {
      console.warn(`Course with ID ${courseId} not found or no changes made.`);
      return { success: false, message: "Course not found or not updated" };
    }

    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

const deleteCourseById = async (courseId) => {
  try {
    const [result] = await db.query("DELETE FROM courses WHERE id = ?", [
      courseId,
    ]);

    if (result.affectedRows === 0) {
      console.warn(`No course found with ID ${courseId}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export {
  GetCourseById,
  GetALLCourse,
  SetCourses,
  getEnrolledCourses,
  deleteCourseById,
  GetCourseSrcById,
  getNCoursesById,
  updateCourseById,
};
