import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'

const __dirname = path.resolve();

const makeStream = (lessonId) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(__dirname, 'uploads', lessonId, 'video.mp4');
    const outputPath = path.join(__dirname,'static','stream', lessonId);

    const notesPath = path.join(__dirname, 'uploads', lessonId, 'notes.pdf');
    const finalNotesPath = path.join(__dirname, 'static', 'notes', `${lessonId}.pdf`);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    if (!fs.existsSync(path.join(__dirname, 'static', 'notes'))) {
      fs.mkdirSync(path.join(__dirname, 'static', 'notes'), { recursive: true });
    }

    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-s 640x360',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
      ])
      .output(path.join(outputPath, 'index.m3u8'))
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2) || 0}% done`);
      })
      .on('end', () => {
        // Move notes into static folder
        if (fs.existsSync(notesPath)) {
          fs.renameSync(notesPath, finalNotesPath);
          console.log("📄 Notes moved successfully:", finalNotesPath);
        }

        // Cleanup only the upload folder, not static
        fs.rmSync(path.join(__dirname, 'uploads', lessonId), { recursive: true, force: true });

        resolve({
          video: `/static/stream/${lessonId}/index.m3u8`,
          notes: `/static/notes/${lessonId}.pdf`
        });
      })
      .on('error', (err) => {
        console.error('❌ Error:', err.message);
        reject(err);
      })
      .run();
  });
};

export {makeStream}