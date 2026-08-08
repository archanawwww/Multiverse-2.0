const fs = require('fs');
const path = require('path');

const configCode = "export const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;\n";
fs.writeFileSync(path.join(__dirname, 'frontend/src/config.js'), configCode);

const searchStr = 'http://${window.location.hostname}:5001';
const replaceStr = '${API_URL}';

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(searchStr)) {
                // Calculate relative path to config.js
                const relPath = path.relative(path.dirname(fullPath), path.join(__dirname, 'frontend/src/config.js')).replace(/\\/g, '/');
                const importPath = relPath.startsWith('.') ? relPath.replace(/\.js$/, '') : './' + relPath.replace(/\.js$/, '');
                
                const importStmt = `import { API_URL } from '${importPath}';\n`;
                
                // Add import after the first import or at top
                if (!content.includes('import { API_URL }')) {
                    const lines = content.split('\n');
                    let lastImportIndex = -1;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].startsWith('import ')) {
                            lastImportIndex = i;
                        }
                    }
                    if (lastImportIndex !== -1) {
                        lines.splice(lastImportIndex + 1, 0, importStmt);
                    } else {
                        lines.unshift(importStmt);
                    }
                    content = lines.join('\n');
                }

                // Replace the string
                content = content.split(searchStr).join(replaceStr);
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'frontend/src'));
