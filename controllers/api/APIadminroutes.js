import express from 'express'
import { GetAllQuiz, setquiz, deleteQuiz} from '../../models/quiz.js';
import  {GetALLCourse, deleteCourseById, GetCourseSrcById} from '../../models/course.js';
import path from 'path';
import fs from 'fs';


const __dirname = path.resolve()


const api = express.Router();


api.get('/allquiz', async (req, res) => {

    let data = await GetAllQuiz();

    if (!data) {
        return res.status(404).json({ message: 'No quizzes found' });
    }

    return res.json(data)
})

api.get('/allcourse', async (req, res) => {
    
    const courses = await GetALLCourse();

    if (!courses) {
        return res.status(404).json({ message: 'No courses found' });
    }

    res.json(courses);
    return
})

api.post('/setquiz', async (req, res) => {

    let quiz = req.body;

    console.log("Received quiz data:", quiz);

    let data = setquiz(quiz);

    return res.json({ message: 'Quiz data received', statuscode: 200 });
})

api.get('/deletequiz/:id', async (req, res) => {
    
    let quizId = req.params.id
    console.log("Deleting quiz with ID:", quizId);

    let data = await deleteQuiz(quizId);
    
    return res.json(data);
})

api.get('/getallquiz', async (req, res) => {

    const quizzes = await GetAllQuiz();

    if (!quizzes) {
        return res.status(404).json({ message: 'No quizzes found' });
    }

    res.json(quizzes);
    return
})

api.get('/deletecourse/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        console.log("Deleting course with ID:", courseId);

        // Get course source info
        let courseSrc = await GetCourseSrcById(courseId);
        courseSrc = courseSrc.src
        console.log("Course source:", courseSrc);

        if (!courseSrc) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Build paths from courseSrc (adjust fields to match your DB)
        const inputPath = path.join(__dirname, 'uploads', courseSrc);
        const outputPath = path.join(__dirname,'static','stream', courseSrc);
        // Delete folders if they exist
        try {
            if (fs.existsSync(inputPath)) {
                fs.rmSync(inputPath, { recursive: true, force: true });
                console.log("Deleted input folder:", inputPath);
            }
            if (fs.existsSync(outputPath)) {
                fs.rmSync(outputPath, { recursive: true, force: true });
                console.log("Deleted output folder:", outputPath);
            }
        } catch (fsErr) {
            console.error("File deletion error:", fsErr);
        }

        // Delete course from DB
        const result = await deleteCourseById(courseId);

        if (result) {
            return res.json({ message: "Course deleted successfully" });
        } else {
            return res.status(500).json({ message: "Error deleting course from DB" });
        }

    } catch (err) {
        console.error("Delete course error:", err);
        return res.status(500).json({ message: "Server error while deleting course" });
    }
});


export default api;