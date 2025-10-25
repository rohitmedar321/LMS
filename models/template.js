import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

function renderBaseHTML(pageRelativePath, scriptPath = '', res, who) {
  const fullPagePath = path.join(__dirname, pageRelativePath);
  
  const pageContent = fs.readFileSync(fullPagePath, 'utf-8');

//   console.log("Rendering page:", pageContent);
  let file = (who === 'admin') ? 'adminbase' : 'base';

  res.render( file, {
    page: pageContent,
    script: scriptPath
  });
}



export { renderBaseHTML };
