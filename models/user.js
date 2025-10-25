import db from '../db/db.js';
import { hash, compareHash } from './hash.js';

const checkLogin = async (email, password) => {
    const [rows] = await db.execute(
        'SELECT hash, id, name FROM user WHERE email = ?',
        [email]
    );
    // console.log('user :', rows.length)
    if (rows.length === 0) return [ false, null];

    const user = rows[0];

    const isMatch = await compareHash(password, user.hash);
    if (!isMatch) return [ false, null];

    return [true, user];
};

const createUser = async (data) => {
    // console.log(data, data.email, data.password, data.name)
    if (!data.email || !data.password) {
        throw new Error('Missing email or hash');
    }

    const [result] = await db.execute(
        'INSERT INTO user (hash, email, name) VALUES (?, ?, ?)',
        [data.password, data.email, data.name] 
    );

    return result.insertId;
};

const getUserById = async (id) => {
    const [rows] = await db.execute(
        'SELECT id, name, email, unlockquiz, mycoursesid, completeCourses FROM user WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    return rows[0];
};

const addCourseToUser = async (userId, courseId) => {
    // 1. Get current array from DB
    let [rows] = await db.execute(
        'SELECT mycoursesid FROM user WHERE id = ?',
        [userId]
    );

    if (rows.length === 0) {
        throw new Error('User not found');
    }

    // 2. Parse JSON from DB (default to empty array if null)
    let currentCourses = [];
    try {
        currentCourses = rows[0].mycoursesid
            ? JSON.parse(rows[0].mycoursesid)
            : [];
    } catch (e) {
        console.warn('Invalid JSON in DB, resetting to []');
        currentCourses = [];
    }

    // 3. Ensure it's an array of numbers
    if (!Array.isArray(currentCourses)) {
        currentCourses = [];
    } else {
        currentCourses = currentCourses.map(Number);
    }

    // 4. Push only if not already included
    if (!currentCourses.includes(Number(courseId))) {
        currentCourses.push(Number(courseId));
    }

    // 5. Save updated array back to DB
    await db.execute(
        `UPDATE user
        SET mycoursesid = IF(
            JSON_CONTAINS(mycoursesid, CAST(? AS JSON), '$'),
            mycoursesid,
            JSON_ARRAY_APPEND(mycoursesid, '$', ?)
        )
        WHERE id = ?;`,
        [parseInt(courseId, 10), parseInt(courseId, 10), userId]
    );


    // console.log(`✅ Course ${courseId} added for user ${userId}`);
};

const addCompleteCourseToUser = async (userId, courseId) => {
    // 1. Get current array from DB
    let [rows] = await db.execute(
        'SELECT completeCourses FROM user WHERE id = ?',
        [userId]
    );

    if (rows.length === 0) {
        throw new Error('User not found');
    }

    // 2. Parse JSON from DB (default to empty array if null)
    let currentCourses = [];
    try {
        currentCourses = rows[0].completeCourses
            ? JSON.parse(rows[0].completeCourses)
            : [];
    } catch (e) {
        console.warn('Invalid JSON in DB, resetting to []');
        currentCourses = [];
    }

    // 3. Ensure it's an array of numbers
    if (!Array.isArray(currentCourses)) {
        currentCourses = [];
    } else {
        currentCourses = currentCourses.map(Number);
    }

    // 4. Push only if not already included
    if (!currentCourses.includes(Number(courseId))) {
        currentCourses.push(Number(courseId));
    }

    // 5. Save updated array back to DB
    await db.execute(
        `UPDATE user
        SET completeCourses = IF(
            JSON_CONTAINS(completeCourses, CAST(? AS JSON), '$'),
            completeCourses,
            JSON_ARRAY_APPEND(completeCourses, '$', ?)
        )
        WHERE id = ?;`,
        [parseInt(courseId, 10), parseInt(courseId, 10), userId]
    );


};

export { checkLogin, createUser, getUserById, addCourseToUser, addCompleteCourseToUser};
