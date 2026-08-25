const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(projectRoot, 'src/assets/books/catalog.json');
const coverRegistryPath = path.join(projectRoot, 'src/assets/books/coverRegistry.ts');
const zipDirectory = path.join(projectRoot, 'books-zip');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const coverRegistry = fs.readFileSync(coverRegistryPath, 'utf8');
const registeredCovers = new Set(
  [...coverRegistry.matchAll(/^\s{2}([A-Za-z0-9_]+): require\(/gm)].map((match) => match[1])
);
const failures = [];
const folderNames = new Set();

for (const book of catalog.books) {
  if (!book.folderName || folderNames.has(book.folderName)) {
    failures.push(`folderName ausente o duplicado: ${book.folderName || '<vacío>'}`);
    continue;
  }
  folderNames.add(book.folderName);

  if (!registeredCovers.has(book.folderName)) {
    failures.push(`falta portada registrada: ${book.folderName}`);
  }

  const zipPath = path.join(zipDirectory, `${book.folderName}.zip`);
  if (!fs.existsSync(zipPath)) {
    failures.push(`falta ZIP: books-zip/${book.folderName}.zip`);
  }
}

for (const registeredCover of registeredCovers) {
  if (!folderNames.has(registeredCover)) {
    failures.push(`portada sin entrada en catálogo: ${registeredCover}`);
  }
}

if (failures.length > 0) {
  console.error(`Catálogo inválido (${failures.length} problema(s)):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  const embeddedCount = catalog.books.filter((book) => book.embedded).length;
  console.log(
    `Catálogo válido: ${catalog.books.length} cuentos, ${registeredCovers.size} portadas, ` +
      `${catalog.books.length} ZIPs, ${embeddedCount} embebido(s).`
  );
}
