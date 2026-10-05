// Verifica links e arquivos referenciados pelo site.
// - Arquivos locais (img, css, js) citados no HTML e no CSS precisam existir
// - Âncoras internas (#secao) precisam apontar para um id existente
// - Links "#" vazios geram aviso (placeholder esquecido), sem falhar o build
// Uso: node scripts/check-links.mjs

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const errors = [];
const warnings = [];

const html = readFileSync('index.html', 'utf8');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

function checkLocalFile(ref, base, origin) {
  const path = join(base, ref.split(/[?#]/)[0]);
  if (!existsSync(path)) errors.push(`${origin}: arquivo não encontrado → ${ref}`);
}

// Ignora o JSON-LD, que só tem URLs absolutas do domínio
const body = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');

for (const [, attr, value] of body.matchAll(/\s(href|src)="([^"]*)"/g)) {
  if (/^(https?:|mailto:|tel:|data:)/.test(value)) continue;
  if (value === '#') {
    warnings.push(`index.html: link vazio (href="#") — falta preencher`);
  } else if (value.startsWith('#')) {
    if (!ids.has(value.slice(1))) errors.push(`index.html: âncora sem destino → ${value}`);
  } else {
    checkLocalFile(value, '.', `index.html (${attr})`);
  }
}

// url(...) e fill="url(#id)" dentro do HTML apontam para ids de SVG, não para arquivos
for (const [, ref] of body.matchAll(/url\(#([^)]+)\)/g)) {
  if (!ids.has(ref)) errors.push(`index.html: gradiente SVG sem destino → #${ref}`);
}

// Arquivos citados pelos CSS
for (const css of ['css/palette.css', 'css/style.css', 'css/responsividade.css']) {
  const content = readFileSync(css, 'utf8');
  for (const [, ref] of content.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^(https?:|data:|#)/.test(ref)) continue;
    checkLocalFile(ref, dirname(css), css);
  }
}

for (const w of [...new Set(warnings)]) console.warn(`⚠️  ${w}`);
for (const e of errors) console.error(`❌ ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log('✅ Links e arquivos ok.');
