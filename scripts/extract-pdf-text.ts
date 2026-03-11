/**
 * Extract raw text from the Vedic Maths PDF
 * Usage: npx tsx scripts/extract-pdf-text.ts
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require2("pdf-parse").default ?? require2("pdf-parse");

const PDF_PATH = path.join(process.cwd(), "vedic maths book.pdf");
const OUTPUT_PATH = path.join(process.cwd(), "scripts", "output", "raw-text.txt");

async function main() {
  const buffer = fs.readFileSync(PDF_PATH);
  const data = await pdfParse(buffer);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, data.text, "utf-8");

  console.log(`✅ Extracted ${data.numpages} pages`);
  console.log(`📄 Saved to: ${OUTPUT_PATH}`);
  console.log(`   Total characters: ${data.text.length}`);
}

main().catch(console.error);
