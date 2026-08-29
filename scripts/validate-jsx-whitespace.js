const fs = require('fs');
const path = require('path');

const sourceRoots = ['app', 'src'];
const invalidBoundary = /(?:\/>|<\/[A-Za-z][^>]*>)\}\s+\{/g;
const violations = [];

function checkDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      checkDirectory(filePath);
    } else if (entry.isFile() && filePath.endsWith('.tsx')) {
      const source = fs.readFileSync(filePath, 'utf8');
      let match;
      while ((match = invalidBoundary.exec(source))) {
        const line = source.slice(0, match.index).split('\n').length;
        violations.push(`${filePath}:${line}`);
      }
    }
  }
}

for (const sourceRoot of sourceRoots) {
  checkDirectory(path.resolve(sourceRoot));
}

if (violations.length > 0) {
  console.error('Literal JSX whitespace between conditional siblings is invalid in React Native:');
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log('JSX whitespace validation passed.');
