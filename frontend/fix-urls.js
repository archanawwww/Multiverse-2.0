const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('/Users/archana/Documents/MusicVerse/frontend/src');
files.forEach(file => {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('127.0.0.1:5001')) {
      
      // Replace JSX string attributes first: src="http://127.0.0.1:5001/..."
      content = content.replace(/(\w+)="http:\/\/127\.0\.0\.1:5001([^"]*)"/g, '$1={`http://${window.location.hostname}:5001$2`}');
      
      // Replace all other strings
      content = content.replace(/['"`]http:\/\/127\.0\.0\.1:5001([^'"`]*)['"`]/g, '`http://${window.location.hostname}:5001$1`');
      
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
    }
  }
});
