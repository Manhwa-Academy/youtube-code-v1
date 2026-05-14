const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');
const regex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

function scanDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic block comment removal (crude but works for most cases)
      let cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '');
      
      const lines = cleanContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Skip line comments
        const commentIdx = line.indexOf('//');
        if (commentIdx !== -1) {
          line = line.substring(0, commentIdx);
        }
        
        // Skip JSX comments {/* */}
        line = line.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
        
        // Exclude console.log or specific non-UI code if needed
        if (line.includes('console.log')) continue;
        
        if (regex.test(line)) {
          console.log(`${fullPath.replace(__dirname, '')}:${i + 1} - ${line.trim()}`);
        }
      }
    }
  }
}

scanDir(dir);
