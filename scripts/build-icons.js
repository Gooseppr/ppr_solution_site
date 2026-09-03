#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Icônes Lucide effectivement utilisées sur le site (voir assets/icons/ICONS.md).
// N'ajouter une icône ici que si elle est réellement câblée dans une page.
const ICONS = ["download", "search", "sliders-horizontal", "shield-check"];

const LUCIDE_ICONS_DIR = path.join(__dirname, "..", "node_modules", "lucide-static", "icons");
const OUTPUT_FILE = path.join(__dirname, "..", "assets", "icons", "lucide-sprite.svg");

function extractInnerMarkup(svgSource) {
  const match = svgSource.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) throw new Error("Structure SVG inattendue.");
  return match[1].trim();
}

function main() {
  const symbols = ICONS.map((name) => {
    const filePath = path.join(LUCIDE_ICONS_DIR, `${name}.svg`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Icône Lucide introuvable : ${name} (${filePath})`);
    }
    const source = fs.readFileSync(filePath, "utf8");
    const inner = extractInnerMarkup(source);
    return `  <symbol id="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n    ${inner}\n  </symbol>`;
  });

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n")}\n</svg>\n`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, sprite, "utf8");
  console.log(`Sprite généré (${ICONS.length} icônes) : ${path.relative(path.join(__dirname, ".."), OUTPUT_FILE)}`);
}

main();
