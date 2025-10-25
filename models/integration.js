import db from '../db/db.js';



const getbundles = async (user_id) => {
  try {
    const [rows] = await db.query(
      "SELECT bundle.id, bundle.name, completeCourses, course_id, bundle.status \
       FROM user INNER JOIN bundle ON user.id = bundle.user_id \
       WHERE user.id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return { data: null, success: false, message: "No bundles found for this user" };
    }

    for (const obj of rows) {
      try {
        let ComCourse = JSON.parse(obj.completeCourses || "[]");
        let bundlecourse = JSON.parse(obj.course_id || "[]");

        console.log("User courses:", ComCourse, "Bundle courses:", bundlecourse);

        // Check if all bundle courses are included in user's completed courses
        const allCoursesDone = bundlecourse.every(c => ComCourse.includes(c));

        if (allCoursesDone && obj.status !== "complete") {
          await db.query('UPDATE bundle SET status = "complete" WHERE id = ?', [obj.id]);
          obj.status = "complete"; // keep it updated in response too
        }
      } catch (err) {
        console.error("Error processing bundle:", err);
      }
    }

    return { data: rows, success: true, message: "Bundles fetched successfully" };

  } catch (error) {
    console.error("Error fetching bundles:", error);
    return { data: null, success: false, message: "Database fetching error" };
  }
};



export {getbundles}