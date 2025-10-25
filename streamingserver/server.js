import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { makeStream } from './module/ffmpeg.js'; // make sure .js extension if using ES modules

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const lessonId = uuidv4();
    req.lessonId = lessonId;
    const uploadPath = path.join('uploads', lessonId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, 'course' + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and mp4 videos are allowed'));
    }
  }
});

app.get("/", (req, res) => {
  return res.send('hello world');
});


app.post("/upload", upload.single('file'), async (req, res) => {
  try {
    console.log(`File uploaded for lessonId: ${req.lessonId}`);

    // Check file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.mp4') {
      return res.status(400).json({ error: 'Only MP4 videos are allowed' });
    }

    await makeStream(req.lessonId);

    return res.json({
      message: 'Upload and streaming conversion complete',
      lessonId: req.lessonId,
      streamUrl: `/stream/${req.lessonId}/index.m3u8`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Video processing failed' });
  }
});


app.listen(3000, () => console.log("Server running on port 3000"));
