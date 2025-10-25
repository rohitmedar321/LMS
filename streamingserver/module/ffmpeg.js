import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

// manually set FFmpeg paths on Windows
ffmpeg.setFfmpegPath("C:/ffmeg/ffmpeg-8.0-essentials_build/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmeg/ffmpeg-8.0-essentials_build/bin/ffprobe.exe");

const makeStream = (lessonId) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(__dirname, "uploads", lessonId, "course.mp4");
    const outputPath = path.join(__dirname, "stream", lessonId);
    const uploadFolder = path.join(__dirname, "uploads", lessonId);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    ffmpeg(inputPath)
      .outputOptions([
        "-profile:v baseline",
        "-level 3.0",
        "-s 640x360",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
      ])
      .output(path.join(outputPath, "index.m3u8"))
      .on("start", (cmd) => {
        console.log("FFmpeg command:", cmd);
      })
      .on("progress", (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2) || 0}% done`);
      })

      .on("end", () => {
        console.log("✅ HLS conversion finished!");
        if (fs.existsSync(uploadFolder)) {
          fs.rmSync(uploadFolder, { recursive: true, force: true });
          console.log("🗑️ Removed upload folder");
        }
        resolve();
      })

      .on("error", (err) => {
        console.error("❌ Error:", err.message);
        reject(err);
      })
      .run();
  });
};

export { makeStream };
