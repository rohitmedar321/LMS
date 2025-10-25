import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If lessonId not already set, generate it once per request
    if (!req.lessonId) {
      req.lessonId = uuidv4();
    }

    // Create folder based on lessonId
    const uploadPath = path.join(__dirname, "../uploads", req.lessonId);
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    let filename = "";

    if (file.fieldname === "video") {
      filename = "video" + path.extname(file.originalname);
    } else if (file.fieldname === "pdf") {
      filename = "notes.pdf";
    } else {
      filename = file.originalname;
    }

    cb(null, filename);
  },
});

// Added limits to prevent "Field value too long"
const upload = multer({
  storage,
  limits: {
    fieldSize: 10 * 1024 * 1024, // 10 MB for text fields
    fileSize: 500 * 1024 * 1024, // 500 MB for files
  },
});

export default upload;
