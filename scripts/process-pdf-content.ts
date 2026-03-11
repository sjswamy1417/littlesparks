/**
 * LittleSparks — PDF Content Processor
 *
 * Reads a Vedic Maths PDF and uses Claude AI to convert each chapter
 * into structured lesson JSON blocks matching the LittleSparks content format.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/process-pdf-content.ts
 *
 * Output: scripts/output/lesson-content.json
 *   Review the output, then paste lessons into prisma/seed.ts
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// ─── Config ─────────────────────────────────────────────────────────────────

const PDF_PATH = path.join(process.cwd(), "vedic maths book.pdf");
const OUTPUT_DIR = path.join(process.cwd(), "scripts", "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "lesson-content.json");

const TARGET_AUDIENCE = "school kids aged 6-14";
const COURSE_STRUCTURE = `
4 modules:
1. "What is Vedic Maths?" - intro, history, how it differs from regular maths
2. "Multiplication Superpowers" - multiply by 11, base method near 100, squaring ending in 5, multiply by 5/25/50
3. "Addition & Subtraction Shortcuts" - complement subtraction, left-to-right addition, digit sum verification
4. "Division Demystified" - divide by 9, recurring decimals
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type SparkyMood = "excited" | "proud" | "thinking" | "celebrating";

interface IntroBlock {
  type: "intro";
  text: string;
  sparkyMood: SparkyMood;
}

interface ConceptBlock {
  type: "concept";
  title: string;
  text: string;
}

interface WorkedExampleBlock {
  type: "worked_example";
  problem: string;
  steps: Array<{ label: string; value: string }>;
  answer: string;
  animation: string;
}

interface TryItBlock {
  type: "try_it";
  problem: string;
  answer: string;
  hint: string;
}

interface TipBlock {
  type: "tip";
  text: string;
  example?: string;
}

type ContentBlock =
  | IntroBlock
  | ConceptBlock
  | WorkedExampleBlock
  | TryItBlock
  | TipBlock;

interface LessonContent {
  blocks: ContentBlock[];
}

interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

interface ProcessedLesson {
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedModule: number;
  duration: number;
  starsReward: number;
  content: LessonContent;
}

interface ProcessedModule {
  moduleNumber: number;
  moduleTitle: string;
  lessons: ProcessedLesson[];
  quiz: {
    title: string;
    questions: QuizQuestion[];
  };
}

interface ProcessedOutput {
  processedAt: string;
  sourceFile: string;
  modules: ProcessedModule[];
  rawChapters: Array<{ title: string; text: string }>;
}

// ─── PDF Extraction ──────────────────────────────────────────────────────────

async function extractPdfText(): Promise<string> {
  console.log(`📖 Reading PDF: ${PDF_PATH}`);
  const dataBuffer = fs.readFileSync(PDF_PATH);
  const data = await pdfParse(dataBuffer);
  console.log(`✅ Extracted ${data.numpages} pages, ${data.text.length} characters`);
  return data.text;
}

/**
 * Split raw PDF text into chapters/sections using common heading patterns.
 * Returns array of { title, text } chunks.
 */
function splitIntoChapters(
  rawText: string
): Array<{ title: string; text: string }> {
  // Split on lines that look like chapter/section headings:
  // - ALL CAPS lines
  // - Lines starting with "Chapter", "Sutra", roman numerals, or numbers
  const lines = rawText.split("\n");
  const chapters: Array<{ title: string; text: string }> = [];
  let currentTitle = "Introduction";
  let currentLines: string[] = [];

  const isHeading = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return false;
    // ALL CAPS heading (allow spaces and punctuation)
    if (/^[A-Z][A-Z\s\-:&']{4,}$/.test(trimmed)) return true;
    // Chapter / Sutra / Section prefix
    if (/^(chapter|sutra|section|part|lesson)\s+\d+/i.test(trimmed)) return true;
    // Roman numeral heading
    if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.?\s+\w/i.test(trimmed)) return true;
    return false;
  };

  for (const line of lines) {
    if (isHeading(line)) {
      if (currentLines.length > 50) {
        // Only save if has meaningful content
        chapters.push({
          title: currentTitle,
          text: currentLines.join("\n").trim(),
        });
      }
      currentTitle = line.trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Don't forget the last chapter
  if (currentLines.length > 50) {
    chapters.push({
      title: currentTitle,
      text: currentLines.join("\n").trim(),
    });
  }

  // If no chapters were detected, treat the whole text as one chunk
  if (chapters.length === 0) {
    console.log("⚠️  No chapter headings detected — treating entire PDF as one chunk");
    // Split into ~3000 char chunks instead
    const chunkSize = 3000;
    for (let i = 0; i < rawText.length; i += chunkSize) {
      chapters.push({
        title: `Section ${Math.floor(i / chunkSize) + 1}`,
        text: rawText.slice(i, i + chunkSize),
      });
    }
  }

  console.log(`📚 Split into ${chapters.length} chapters/sections`);
  return chapters;
}

// ─── Claude API Processing ───────────────────────────────────────────────────

async function processChapterWithClaude(
  client: Anthropic,
  chapter: { title: string; text: string },
  chapterIndex: number,
  totalChapters: number
): Promise<ProcessedLesson | null> {
  console.log(
    `\n🤖 Processing chapter ${chapterIndex + 1}/${totalChapters}: "${chapter.title}"`
  );

  // Truncate very long chapters to fit context
  const truncatedText =
    chapter.text.length > 4000
      ? chapter.text.slice(0, 4000) + "\n...[truncated]"
      : chapter.text;

  const prompt = `You are helping build a children's educational app called LittleSparks for ${TARGET_AUDIENCE}.

The course structure is:
${COURSE_STRUCTURE}

I have extracted the following chapter/section from a Vedic Maths book by Shankaracharya:

CHAPTER TITLE: "${chapter.title}"

CHAPTER TEXT:
${truncatedText}

---

Your task: Convert this chapter into a structured lesson for LittleSparks.

Rules:
1. Language must be simple, fun, and encouraging for kids aged 6-14
2. Use "you" and "let's" — speak directly to the child
3. Add Sparky mascot mood hints (excited, proud, thinking, celebrating)
4. Include worked examples with step-by-step breakdowns
5. Include 2 "try_it" practice problems with answers and hints
6. Include at least 1 tip block with a real-world application
7. Keep each concept block focused — one idea at a time
8. Animation type must be one of: sandwich, base, square, standard, complement, left-to-right, cascade, division, cyclic, check, vedic

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):

{
  "suggestedTitle": "Lesson title (kid-friendly, max 50 chars)",
  "suggestedSlug": "url-slug-format",
  "suggestedModule": 1,
  "duration": 8,
  "starsReward": 8,
  "content": {
    "blocks": [
      {
        "type": "intro",
        "text": "Engaging opening line for kids",
        "sparkyMood": "excited"
      },
      {
        "type": "concept",
        "title": "Concept name",
        "text": "Simple explanation"
      },
      {
        "type": "worked_example",
        "problem": "e.g. 23 × 11",
        "steps": [
          { "label": "Step description", "value": "Value or calculation" }
        ],
        "answer": "Final answer",
        "animation": "sandwich"
      },
      {
        "type": "try_it",
        "problem": "Practice problem?",
        "answer": "Answer",
        "hint": "Helpful hint"
      },
      {
        "type": "tip",
        "text": "Pro tip text",
        "example": "Optional example"
      }
    ]
  }
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (handle if model adds markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`  ❌ No JSON found in response for chapter: ${chapter.title}`);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ProcessedLesson;
    console.log(
      `  ✅ Generated lesson: "${parsed.suggestedTitle}" → Module ${parsed.suggestedModule}`
    );
    return parsed;
  } catch (err) {
    console.error(
      `  ❌ Failed to process chapter "${chapter.title}":`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

async function generateModuleQuiz(
  client: Anthropic,
  moduleNumber: number,
  moduleTitle: string,
  lessons: ProcessedLesson[]
): Promise<{ title: string; questions: QuizQuestion[] }> {
  console.log(`\n📝 Generating quiz for Module ${moduleNumber}: "${moduleTitle}"`);

  const lessonSummary = lessons
    .map(
      (l) =>
        `- ${l.suggestedTitle}: ${l.content.blocks
          .filter((b) => b.type === "concept")
          .map((b) => (b as ConceptBlock).title)
          .join(", ")}`
    )
    .join("\n");

  const prompt = `Create a 10-question multiple choice quiz for a Vedic Maths module.

Module: "${moduleTitle}"
Lessons covered:
${lessonSummary}

Rules:
- Questions should test understanding, not just memorization
- Use concrete numbers kids can calculate
- 4 options per question, one correct
- Write clear explanations of the correct answer
- Mix difficulty: 3 easy, 5 medium, 2 challenging
- Language suitable for ages 6-14

Respond ONLY with valid JSON (no markdown):

{
  "title": "Quiz title",
  "questions": [
    {
      "text": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct",
      "order": 1
    }
  ]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error(`  ❌ No JSON in quiz response for module ${moduleNumber}`);
    return { title: `Module ${moduleNumber} Quiz`, questions: [] };
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title: string;
    questions: QuizQuestion[];
  };
  console.log(`  ✅ Generated quiz with ${parsed.questions.length} questions`);
  return parsed;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY environment variable is required");
    console.error("   Usage: ANTHROPIC_API_KEY=sk-... npx tsx scripts/process-pdf-content.ts");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  // 1. Extract PDF text
  const rawText = await extractPdfText();

  // 2. Split into chapters
  const chapters = splitIntoChapters(rawText);

  // 3. Process each chapter with Claude
  const processedLessons: ProcessedLesson[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const lesson = await processChapterWithClaude(client, chapters[i], i, chapters.length);
    if (lesson) {
      processedLessons.push(lesson);
    }
    // Brief pause to avoid rate limiting
    if (i < chapters.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // 4. Group lessons by module
  const moduleMap = new Map<number, ProcessedLesson[]>();
  for (const lesson of processedLessons) {
    const mod = lesson.suggestedModule;
    if (!moduleMap.has(mod)) moduleMap.set(mod, []);
    moduleMap.get(mod)!.push(lesson);
  }

  const moduleTitles: Record<number, string> = {
    1: "What is Vedic Maths?",
    2: "Multiplication Superpowers",
    3: "Addition & Subtraction Shortcuts",
    4: "Division Demystified",
  };

  // 5. Generate quizzes per module
  const processedModules: ProcessedModule[] = [];

  for (const [moduleNumber, lessons] of Array.from(moduleMap.entries()).sort(
    ([a], [b]) => a - b
  )) {
    const moduleTitle = moduleTitles[moduleNumber] ?? `Module ${moduleNumber}`;
    const quiz = await generateModuleQuiz(client, moduleNumber, moduleTitle, lessons);

    processedModules.push({
      moduleNumber,
      moduleTitle,
      lessons,
      quiz,
    });
  }

  // 6. Write output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const output: ProcessedOutput = {
    processedAt: new Date().toISOString(),
    sourceFile: "vedic maths book.pdf",
    modules: processedModules,
    rawChapters: chapters.map((c) => ({
      title: c.title,
      text: c.text.slice(0, 200) + "...",
    })),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log("\n" + "═".repeat(60));
  console.log("✅ Processing complete!");
  console.log(`📄 Output saved to: ${OUTPUT_FILE}`);
  console.log(`📚 ${processedLessons.length} lessons processed`);
  console.log(`📦 ${processedModules.length} modules with quizzes`);
  console.log("═".repeat(60));
  console.log("\nNext steps:");
  console.log("  1. Review scripts/output/lesson-content.json");
  console.log("  2. Run: npx tsx scripts/import-pdf-content.ts");
  console.log("     to import reviewed content into the seed file");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
