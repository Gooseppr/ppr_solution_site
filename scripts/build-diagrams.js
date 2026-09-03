#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DIAGRAMS_ROOT = path.join(__dirname, "..", "assets", "diagrams");
const SOURCES_DIR = path.join(DIAGRAMS_ROOT, "sources");
const GENERATED_DIR = path.join(DIAGRAMS_ROOT, "generated");
const CONFIG_FILE = path.join(DIAGRAMS_ROOT, "mermaid.config.json");
const THEME_CSS = path.join(DIAGRAMS_ROOT, "mermaid.theme.css");
const MMDC_BIN = path.join(__dirname, "..", "node_modules", ".bin", process.platform === "win32" ? "mmdc.cmd" : "mmdc");

function main() {
  if (!fs.existsSync(SOURCES_DIR)) {
    throw new Error(`Dossier introuvable : ${SOURCES_DIR}`);
  }
  const sources = fs.readdirSync(SOURCES_DIR).filter((file) => file.endsWith(".mmd")).sort();
  if (!sources.length) {
    throw new Error(`Aucune source .mmd trouvée dans ${SOURCES_DIR}`);
  }
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const results = [];
  for (const file of sources) {
    const name = file.replace(/\.mmd$/, "");
    const input = path.join(SOURCES_DIR, file);
    const output = path.join(GENERATED_DIR, `${name}.svg`);
    const args = [
      "-i", input,
      "-o", output,
      "-c", CONFIG_FILE,
      "-C", THEME_CSS,
      "-b", "transparent",
      "--quiet"
    ];
    try {
      execFileSync(MMDC_BIN, args, { stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
    } catch (error) {
      const detail = error.stderr ? error.stderr.toString() : error.message;
      throw new Error(`Échec de génération pour ${file} :\n${detail}`);
    }
    if (!fs.existsSync(output)) {
      throw new Error(`SVG non produit pour ${file} (${output})`);
    }
    const svg = fs.readFileSync(output, "utf8");
    const viewBoxMatch = svg.match(/viewBox="[-\d.]+\s[-\d.]+\s([\d.]+)\s([\d.]+)"/);
    results.push({
      name,
      output: path.relative(path.join(__dirname, ".."), output),
      width: viewBoxMatch ? Math.round(Number(viewBoxMatch[1])) : null,
      height: viewBoxMatch ? Math.round(Number(viewBoxMatch[2])) : null
    });
    console.log(`Généré : ${path.relative(path.join(__dirname, ".."), output)}`);
  }

  fs.writeFileSync(
    path.join(GENERATED_DIR, "manifest.json"),
    JSON.stringify(results, null, 2) + "\n",
    "utf8"
  );
  console.log(`${results.length} diagramme(s) généré(s). Dimensions écrites dans generated/manifest.json.`);
}

main();
