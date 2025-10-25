import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { renderBaseHTML } from '../models/template.js';
import { requireLogin } from "../middleware/middleware.js";
import { GetCourseById } from '../models/course.js';
import {readToken} from '../models/token.js';
import { addCourseToUser } from '../models/user.js';
import { GetQuizById } from '../models/quiz.js';

// Set __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = express.Router();

// Middleware: check login before accessing routes
main.use(requireLogin);

const renderPage  = (filename, scriptname  = '',  res) => {
    renderBaseHTML(path.join('views','pages', filename), scriptname, res, 'client');
}

// Route handler
main.get('/', (req, res) => {
    renderPage('progress.html', 'progess.js', res);
});

main.get('/myCourses', (req, res) => {
    renderPage('myCourses.html', 'mycourse.js', res);
});

main.get('/quiz', (req, res) => {
    renderPage('quiz.html', 'quiz.js', res);
});


main.get('/courses', (req, res) => {
    renderPage('home.html', 'courses.js', res);
});

main.get('/archive', (req, res) => {
    renderPage('archive.html', 'archive.js', res);
});

main.get('/settings', (req, res) => {
    renderPage('settings.html', '', res);
});

main.get('/course', async (req, res) => {

    const courseId = req.query.id;
    let payload = await readToken(req.cookies.token);
    payload = JSON.parse(JSON.stringify(payload));


    let err = await addCourseToUser(payload.id, courseId);

    if (err) {
        return res.status(500).send('Error adding course to user');
    }

    if (!courseId) {
        return res.status(400).send('Course ID is required');
    }
    const course = await GetCourseById(courseId);

    let coursesrc = `${req.protocol}://${req.get('host')}/stream/${course.src}/index.m3u8`;
    let notessrc = `${req.protocol}://${req.get('host')}/notes/${course.src}.pdf`;

    res.render("courseTemplate", {
    title: course.title,
    discription: course.description ,
    src: coursesrc,
    notes: notessrc
    });

});


main.get('/quizexam/:id', async (req, res) => {

    const quizId = req.params.id;
    console.log("Quiz ID:", quizId);
    let question = await GetQuizById(quizId)
    console.log(question)

     res.render("quizpage", {id: quizId, question: question});
    return
});

export { main };
