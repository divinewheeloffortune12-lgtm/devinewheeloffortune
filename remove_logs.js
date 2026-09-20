const fs = require('fs');
const path = require('path');

const dirsToScan = ['client/src', 'server/src'];
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const removeConsoleLogs = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeConsoleLogs(fullPath);
    } else if (extensions.includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic regex to remove single-line console.log statements
      // Doesn't handle complex multi-line safely, but covers 90% of floating logs.
      const originalLength = content.length;
      content = content.replace(/^[ \t]*console\.log\s*\([^;]*\);?[ \t]*\r?\n/gm, '');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned logs in ${fullPath}`);
      }
    }
  }
};

console.log('Starting console.log cleanup...');
dirsToScan.forEach(dir => removeConsoleLogs(path.join(__dirname, dir)));
console.log('Cleanup complete!');
