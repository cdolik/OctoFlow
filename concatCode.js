const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname); // Adjust as needed
const outputFile = path.join(__dirname, 'all_code.txt');
const fileExtensions = ['.js', '.ts', '.tsx', '.jsx'];

function readFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && !file.startsWith('.')) {
      results = results.concat(readFiles(filePath));
    } else if (fileExtensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  return results;
}

const files = readFiles(sourceDir);
let allContent = '';

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  allContent += `\n\n// ---- ${file} ----\n\n${content}`;
});

fs.writeFileSync(outputFile, allContent, 'utf8');
console.log(`All code has been concatenated into ${outputFile}`);
