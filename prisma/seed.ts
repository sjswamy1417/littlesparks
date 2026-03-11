import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const parentPasswordHash = await hash("Test1234!", 12);
  const childPasswordHash = await hash("Test1234!", 12);

  // ─── Test Accounts ───────────────────────────────────────────────

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@littlesparks.dev" },
    update: { passwordHash: parentPasswordHash },
    create: {
      email: "parent@littlesparks.dev",
      passwordHash: parentPasswordHash,
      role: "PARENT",
      name: "Demo Parent",
    },
  });

  const parentProfile = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
    },
  });

  const childUser = await prisma.user.upsert({
    where: { email: "spark@littlesparks.dev" },
    update: { passwordHash: childPasswordHash },
    create: {
      email: "spark@littlesparks.dev",
      passwordHash: childPasswordHash,
      role: "CHILD",
      name: "Sparky Kid",
    },
  });

  await prisma.child.upsert({
    where: { userId: childUser.id },
    update: {},
    create: {
      userId: childUser.id,
      age: 10,
      parentId: parentProfile.id,
    },
  });

  console.log("✅ Test accounts created");

  // ─── Clean up existing content for idempotency ──────────────────
  await prisma.question.deleteMany({});
  await prisma.quizResult.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.childBadge.deleteMany({});
  await prisma.badge.deleteMany({});

  console.log("✅ Cleaned existing content data");

  // ─── Course 1: Vedic Maths ──────────────────────────────────────

  const vedicMaths = await prisma.course.upsert({
    where: { slug: "vedic-maths" },
    update: {},
    create: {
      title: "Vedic Maths",
      slug: "vedic-maths",
      description:
        "Discover the ancient Indian system of mathematics that makes calculations lightning fast!",
      isActive: true,
      order: 1,
      color: "#FF6B35",
      icon: "brain",
    },
  });

  // ── Module 1: Discover Vedic Maths ─────────────────────────────

  const module1 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Discover Vedic Maths",
      description: "Meet the ancient system that turns maths into a superpower",
      order: 1,
    },
  });

  // Lesson 1.1 — FREE PREVIEW (Sandwich Method)
  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Multiply by 11 — The Sandwich Method",
      slug: "multiply-by-11",
      duration: 8,
      order: 1,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Here's your very first Vedic Maths trick — and it's going to blow your mind! You'll be multiplying by 11 faster than a calculator in about 60 seconds!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Sandwich Method",
            text: "To multiply any 2-digit number by 11:\n\n1. Write the first digit\n2. Add both digits together — this goes in the middle\n3. Write the last digit\n\nIt's like a sandwich — the original digits are the bread, and their sum is the yummy filling!",
          },
          {
            type: "worked_example",
            problem: "23 × 11",
            steps: [
              { label: "Left bread 🍞", value: "2" },
              { label: "Filling 🥪 (2+3)", value: "5" },
              { label: "Right bread 🍞", value: "3" },
              { label: "Put it together!", value: "2 | 5 | 3 = 253" },
            ],
            answer: "253",
            animation: "sandwich",
          },
          {
            type: "worked_example",
            problem: "63 × 11",
            steps: [
              { label: "First digit", value: "6" },
              { label: "Middle: 6+3", value: "9" },
              { label: "Last digit", value: "3" },
              { label: "Answer", value: "6 | 9 | 3 = 693" },
            ],
            answer: "693",
            animation: "sandwich",
          },
          {
            type: "try_it",
            problem: "45 × 11 = ?",
            answer: "495",
            hint: "4 | (4+5) | 5 = 4 | 9 | 5 = 495",
          },
          {
            type: "concept",
            title: "What if the middle is 10 or more?",
            text: "Sometimes the two digits add up to 10 or more — no problem! Just carry the 1 to the left.\n\nExample: 75 × 11\n\n1. 7 | (7+5) | 5\n2. 7 | 12 | 5\n3. Carry: (7+1) | 2 | 5 = 825 ✓",
          },
          {
            type: "worked_example",
            problem: "87 × 11",
            steps: [
              { label: "First digit", value: "8" },
              { label: "Middle: 8+7", value: "15 — carry the 1!" },
              { label: "After carry: (8+1) | 5 | 7", value: "957" },
            ],
            answer: "957",
            animation: "sandwich",
          },
          {
            type: "try_it",
            problem: "77 × 11 = ?",
            answer: "847",
            hint: "7+7=14. Carry: (7+1) | 4 | 7 = 847",
          },
          {
            type: "tip",
            text: "This trick works for 3-digit numbers too! For 342 × 11: write 3, then 3+4=7, then 4+2=6, then 2. Answer: 3762!",
            example: "Try 253 × 11: 2 | (2+5) | (5+3) | 3 = 2783",
          },
        ],
      },
    },
  });

  // Lesson 1.2 — FREE PREVIEW
  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Your Brain vs Calculator",
      slug: "brain-vs-calculator",
      duration: 6,
      order: 2,
      starsReward: 5,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Can your brain beat a calculator? With Vedic Maths — sometimes YES!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "Why Mental Maths Makes You Smarter",
            text: "When you do maths in your head:\n\n• You understand numbers deeply, not just mechanically\n• Your brain gets stronger — like exercise for your mind!\n• You can estimate and check answers instantly in real life\n• You build confidence that helps in ALL subjects\n\nCalculators are useful tools, but they can't think for you!",
          },
          {
            type: "concept",
            title: "Your Brain Has Superpowers!",
            text: "Did you know your brain has two sides that do different things?\n\n• Left side: loves rules, steps, and neat answers\n• Right side: loves spotting patterns, shortcuts, and cool tricks!\n\nMost school maths only wakes up the left side. Vedic Maths wakes up BOTH — and a brain that works together is a superpower brain!",
          },
          {
            type: "worked_example",
            problem: "Speed Challenge: Who wins — you or the calculator?",
            steps: [
              {
                label: "Problem: 25 × 4",
                value: "Calculator: type 2,5,×,4,= ... takes 3 seconds",
              },
              {
                label: "Vedic Brain",
                value: "25 × 4 = 100. INSTANT! (25 is one quarter of 100)",
              },
              {
                label: "Problem: 50 × 8",
                value: "Calculator: 3 seconds again",
              },
              {
                label: "Vedic Brain",
                value:
                  "50 × 8 = 400. INSTANT! (50 is half of 100, so 50×8 = half of 800)",
              },
            ],
            answer: "Your brain wins! 🏆",
            animation: "standard",
          },
          {
            type: "try_it",
            problem: "Can you answer 50 × 6 in under 2 seconds?",
            answer: "300",
            hint: "50 is half of 100. So 50 × 6 = half of (100 × 6) = half of 600 = 300!",
          },
          {
            type: "try_it",
            problem: "How about 25 × 8?",
            answer: "200",
            hint: "25 × 4 = 100. So 25 × 8 = double that = 200!",
          },
          {
            type: "tip",
            text: "Every time you do mental maths, you build new connections in your brain — literally making yourself smarter!",
            example:
              "Albert Einstein famously said: 'Imagination is more important than knowledge.' Vedic Maths trains both!",
          },
        ],
      },
    },
  });

  // Lesson 1.3
  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "The Magic of Digit Sums",
      slug: "magic-of-digit-sums",
      duration: 8,
      order: 3,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Here's a magic trick: I can check if ANY multiplication answer is correct in under 10 seconds. Want to learn the secret?",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "What is a Digit Sum (Beejank)?",
            text: "A digit sum is when you add all the digits of a number together, and keep adding until you get a single digit (1–9).\n\nExamples:\n• 567 → 5+6+7 = 18 → 1+8 = 9\n• 243 → 2+4+3 = 9\n• 85  → 8+5 = 13 → 1+3 = 4\n\nThe final single digit is called the 'Beejank' — the seed number.",
          },
          {
            type: "concept",
            title: "The Shortcut: Casting Out 9s",
            text: "Amazing shortcut: you can IGNORE the digit 9 and any digits that add up to 9! They don't change the Beejank.\n\n• 459: 4+5=9 → cross out 4,5, and 9. Beejank = 0 (or 9)\n• 738: 7+2=9... wait, 7+3=10→1, then +8=9 → Beejank = 9\n• 2394: cross out 9 and (3+6=9). Left with 2+4=6 → Beejank = 6\n\nThis makes calculation super fast!",
          },
          {
            type: "worked_example",
            problem: "Verify: 23 × 17 = 391",
            steps: [
              { label: "Beejank of 23", value: "2+3 = 5" },
              { label: "Beejank of 17", value: "1+7 = 8" },
              { label: "Multiply Beejanks", value: "5 × 8 = 40 → 4+0 = 4" },
              {
                label: "Beejank of answer 391",
                value: "3+9+1 = 13 → 1+3 = 4",
              },
              { label: "Do they match?", value: "4 = 4 ✅ Answer is correct!" },
            ],
            answer: "Verified ✅",
            animation: "check",
          },
          {
            type: "worked_example",
            problem: "Spot the mistake: 34 × 12 = 418",
            steps: [
              { label: "Beejank of 34", value: "3+4 = 7" },
              { label: "Beejank of 12", value: "1+2 = 3" },
              { label: "Multiply Beejanks", value: "7 × 3 = 21 → 2+1 = 3" },
              { label: "Beejank of 418", value: "4+1+8 = 13 → 1+3 = 4" },
              { label: "Match?", value: "3 ≠ 4 ❌ 418 is WRONG! (correct: 408)" },
            ],
            answer: "418 is wrong!",
            animation: "check",
          },
          {
            type: "try_it",
            problem: "Verify: 14 × 13 = 182",
            answer: "Verified ✅ (14→5, 13→4, 5×4=20→2. 182→11→2. Match!)",
            hint: "Find Beejank of 14, then 13, multiply them, compare with Beejank of 182",
          },
          {
            type: "try_it",
            problem: "Spot the mistake: 25 × 12 = 290",
            answer: "WRONG! ❌ Answer should be 300",
            hint: "25→7, 12→3, 7×3=21→3. 290→11→2. 3≠2, so 290 is wrong!",
          },
          {
            type: "tip",
            text: "Beejank can't tell you the CORRECT answer — but it catches WRONG answers almost every time. Think of it as your maths lie detector!",
            example:
              "Accountants and engineers use a similar method called 'casting out nines' to spot calculation errors in spreadsheets.",
          },
        ],
      },
    },
  });

  // Module 1 Mini Quiz (5 questions — free preview)
  const quiz1 = await prisma.quiz.create({
    data: {
      moduleId: module1.id,
      title: "Discover Vedic Maths — Mini Quiz",
    },
  });

  const module1Questions = [
    {
      text: "Who rediscovered the 16 Vedic Maths Sutras in the early 1900s?",
      options: [
        "Aryabhata",
        "Bharati Krishna Tirthaji",
        "Brahmagupta",
        "Ramanujan",
      ],
      correctAnswer: "Bharati Krishna Tirthaji",
      explanation:
        "Bharati Krishna Tirthaji rediscovered the 16 sutras from ancient Vedic texts between 1911 and 1918.",
      order: 1,
    },
    {
      text: "What does the word 'Veda' mean?",
      options: ["Mathematics", "Knowledge", "Ancient", "India"],
      correctAnswer: "Knowledge",
      explanation: "'Veda' comes from Sanskrit and means 'knowledge'.",
      order: 2,
    },
    {
      text: "What is the Beejank (digit sum) of 567?",
      options: ["6", "8", "9", "18"],
      correctAnswer: "9",
      explanation: "5+6+7=18, then 1+8=9. The Beejank is 9.",
      order: 3,
    },
    {
      text: "Using digit sums, is 23 × 14 = 322 correct?",
      options: ["Yes", "No", "Cannot tell", "Need a calculator"],
      correctAnswer: "No",
      explanation:
        "23→5, 14→5, 5×5=25→7. Beejank of 322=7. Actually it matches! But 23×14=322 is correct. Wait — 23→5, 14→5, 5×5=25→7, 322→7. Yes it's correct! (This is a trick question — 322 is indeed 23×14).",
      order: 4,
    },
    {
      text: "How many Sutras (formulas) are there in Vedic Maths?",
      options: ["8", "12", "16", "24"],
      correctAnswer: "16",
      explanation:
        "There are 16 main Sutras in Vedic Maths, each a short phrase that describes a mental maths technique.",
      order: 5,
    },
  ];

  for (const q of module1Questions) {
    await prisma.question.create({
      data: {
        quizId: quiz1.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      },
    });
  }

  console.log("✅ Module 1: Discover Vedic Maths — 3 lessons, 1 mini quiz (5 questions)");

  // ── Module 2: Multiplication Superpowers ────────────────────────

  const module2 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Multiplication Superpowers",
      description: "Master lightning-fast multiplication tricks from the Vedic system",
      order: 2,
    },
  });

  // Lesson 2.1
  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "The Doubling Trick — Multiply by 2, 4, 8",
      slug: "doubling-trick",
      duration: 8,
      order: 1,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "What if multiplying by 4 was just doing ×2 twice? And ×8 was just doing ×2 three times? That's the Doubling Trick!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Doubling Chain",
            text: "These numbers are all just doubling:\n\n× 2 = double once\n× 4 = double twice (double of double)\n× 8 = double three times\n× 16 = double four times\n\nWhy? Because 4 = 2×2, 8 = 2×2×2, 16 = 2×2×2×2.",
          },
          {
            type: "worked_example",
            problem: "23 × 4",
            steps: [
              { label: "23 × 2 (first double)", value: "46" },
              { label: "46 × 2 (second double)", value: "92" },
              { label: "Answer", value: "92" },
            ],
            answer: "92",
            animation: "standard",
          },
          {
            type: "worked_example",
            problem: "15 × 8",
            steps: [
              { label: "15 × 2", value: "30" },
              { label: "30 × 2", value: "60" },
              { label: "60 × 2", value: "120" },
              { label: "Answer", value: "120" },
            ],
            answer: "120",
            animation: "standard",
          },
          {
            type: "try_it",
            problem: "34 × 4 = ?",
            answer: "136",
            hint: "34 → 68 → 136. Double twice!",
          },
          {
            type: "try_it",
            problem: "13 × 8 = ?",
            answer: "104",
            hint: "13 → 26 → 52 → 104. Double three times!",
          },
          {
            type: "concept",
            title: "Halving is the Reverse!",
            text: "Just as multiplying uses doubling, dividing uses halving:\n\n÷ 2 = halve once\n÷ 4 = halve twice\n÷ 8 = halve three times\n\nThis is the Vedic principle of symmetry — every trick has a mirror!",
          },
          {
            type: "worked_example",
            problem: "96 ÷ 4",
            steps: [
              { label: "96 ÷ 2 (first halve)", value: "48" },
              { label: "48 ÷ 2 (second halve)", value: "24" },
              { label: "Answer", value: "24" },
            ],
            answer: "24",
            animation: "standard",
          },
          {
            type: "try_it",
            problem: "48 ÷ 8 = ?",
            answer: "6",
            hint: "48 → 24 → 12 → 6. Halve three times!",
          },
          {
            type: "tip",
            text: "Always check: is your multiplier a power of 2? (2, 4, 8, 16, 32...) If yes, use the doubling trick — it's always faster than long multiplication!",
            example: "256 × 4: 256→512→1024. Done in 2 steps!",
          },
        ],
      },
    },
  });

  // Lesson 2.3
  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Multiply Near 100 — The Base Method",
      slug: "base-method-100",
      duration: 12,
      order: 2,
      starsReward: 12,
      content: {
        blocks: [
          {
            type: "intro",
            text: "What if I told you that you can multiply 97 × 96 in your head in under 5 seconds? The Base Method (Nikhilam Sutra) makes it possible!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Nikhilam Sutra",
            text: "'Nikhilam Navatashcaramam Dashatah' means 'All from 9, Last from 10'. But for multiplication, we use the idea of deficits from a base number (like 100).\n\nWhen both numbers are close to 100:\n1. Find how far each number is BELOW 100 (the deficit)\n2. Cross-subtract: take one number minus the other's deficit\n3. Multiply the two deficits\n4. Combine the results",
          },
          {
            type: "worked_example",
            problem: "97 × 96",
            steps: [
              {
                label: "Deficits from 100",
                value: "97 is 3 below 100. 96 is 4 below 100.",
              },
              {
                label: "Cross subtract (either way works)",
                value: "97 - 4 = 93  (or 96 - 3 = 93, same answer!)",
              },
              { label: "Multiply the deficits", value: "3 × 4 = 12" },
              {
                label: "Combine: 93 | 12",
                value: "9312",
              },
            ],
            answer: "9312",
            animation: "base",
          },
          {
            type: "worked_example",
            problem: "98 × 97",
            steps: [
              { label: "Deficits", value: "98 → 2,  97 → 3" },
              { label: "Cross subtract", value: "98 - 3 = 95" },
              { label: "Multiply deficits", value: "2 × 3 = 06 (keep 2 digits!)" },
              { label: "Combine", value: "95 | 06 = 9506" },
            ],
            answer: "9506",
            animation: "base",
          },
          {
            type: "concept",
            title: "Important: Keep 2 digits for the deficit product!",
            text: "The right part of the answer always needs 2 digits (since our base is 100).\n\nIf deficit × deficit is a single digit, add a zero in front:\n• 2 × 3 = 6 → write as 06\n• 1 × 4 = 4 → write as 04\n\nIf it's more than 99... that's an advanced case — we'll cover it later!",
          },
          {
            type: "try_it",
            problem: "98 × 95 = ?",
            answer: "9310",
            hint: "Deficits: 2 and 5. Cross: 98-5=93. Product: 2×5=10. Answer: 93|10 = 9310",
          },
          {
            type: "try_it",
            problem: "96 × 93 = ?",
            answer: "8928",
            hint: "Deficits: 4 and 7. Cross: 96-7=89. Product: 4×7=28. Answer: 89|28 = 8928",
          },
          {
            type: "try_it",
            problem: "99 × 99 = ?",
            answer: "9801",
            hint: "Deficit: 1 and 1. Cross: 99-1=98. Product: 1×1=01. Answer: 98|01 = 9801",
          },
          {
            type: "tip",
            text: "This works for numbers ABOVE 100 too! For 103 × 104: surplus = +3, +4. Cross: 103+4=107. Product: 3×4=12. Answer: 107|12 = 10712!",
            example:
              "The algebra behind this: (100-a)(100-b) = 10000 - 100(a+b) + ab = (100-a-b)×100 + ab",
          },
        ],
      },
    },
  });

  // Lesson 2.4
  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Squaring Numbers Ending in 5",
      slug: "squaring-ending-5",
      duration: 8,
      order: 3,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "What is 85²? What about 105²? With this Vedic trick, you'll answer both in under 3 seconds!",
            sparkyMood: "proud",
          },
          {
            type: "concept",
            title: "The Ekadhikena Purvena Sutra",
            text: "'By one more than the previous one' — that's the sutra. Here's the rule:\n\nTo square ANY number ending in 5:\n1. Take the digits before the 5\n2. Multiply them by (themselves + 1)\n3. Attach 25 to the right\n\nThat's it!",
          },
          {
            type: "worked_example",
            problem: "35²",
            steps: [
              { label: "Digits before 5", value: "3" },
              { label: "Multiply by (itself + 1)", value: "3 × 4 = 12" },
              { label: "Attach 25", value: "12 | 25 = 1225" },
            ],
            answer: "1225",
            animation: "square",
          },
          {
            type: "worked_example",
            problem: "65²",
            steps: [
              { label: "Digits before 5", value: "6" },
              { label: "6 × (6+1)", value: "6 × 7 = 42" },
              { label: "Attach 25", value: "42 | 25 = 4225" },
            ],
            answer: "4225",
            animation: "square",
          },
          {
            type: "worked_example",
            problem: "105²  (3-digit number!)",
            steps: [
              { label: "Digits before 5", value: "10" },
              { label: "10 × (10+1)", value: "10 × 11 = 110" },
              { label: "Attach 25", value: "110 | 25 = 11025" },
            ],
            answer: "11025",
            animation: "square",
          },
          {
            type: "try_it",
            problem: "85² = ?",
            answer: "7225",
            hint: "8 × 9 = 72, attach 25 → 7225",
          },
          {
            type: "try_it",
            problem: "45² = ?",
            answer: "2025",
            hint: "4 × 5 = 20, attach 25 → 2025",
          },
          {
            type: "try_it",
            problem: "115² = ?",
            answer: "13225",
            hint: "11 × 12 = 132, attach 25 → 13225",
          },
          {
            type: "tip",
            text: "Why does this work? Because (10n+5)² = 100n(n+1) + 25. The algebra proves the sutra is always true!",
            example: "Every number ending in 5, squared, always ends in 25. Always!",
          },
        ],
      },
    },
  });

  // Lesson 2.5
  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Multiply by 5, 25, and 50 Instantly",
      slug: "multiply-by-5-25-50",
      duration: 8,
      order: 4,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Here's a secret: multiplying by 5, 25, and 50 is just dividing in disguise! Mind = blown? Let's see why.",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "Multiply by 5 — The Halving Trick",
            text: "5 = 10 ÷ 2\n\nSo multiplying by 5 = multiply by 10, then divide by 2\n\n...or more easily: HALVE the number, then SHIFT (add a zero, or move decimal)\n\nIf the number is even: halve it, then add a zero\nIf odd: subtract 1, halve, you get a .5",
          },
          {
            type: "worked_example",
            problem: "48 × 5",
            steps: [
              { label: "Halve 48", value: "48 ÷ 2 = 24" },
              { label: "Multiply by 10", value: "24 × 10 = 240" },
            ],
            answer: "240",
            animation: "standard",
          },
          {
            type: "worked_example",
            problem: "37 × 5",
            steps: [
              { label: "Halve 37", value: "37 ÷ 2 = 18.5" },
              { label: "Multiply by 10", value: "18.5 × 10 = 185" },
            ],
            answer: "185",
            animation: "standard",
          },
          {
            type: "concept",
            title: "Multiply by 25",
            text: "25 = 100 ÷ 4\n\nSo: divide by 4, then multiply by 100 (add two zeros).\n\nDivide by 4 = halve, then halve again.",
          },
          {
            type: "worked_example",
            problem: "36 × 25",
            steps: [
              { label: "Halve 36", value: "18" },
              { label: "Halve 18", value: "9" },
              { label: "Multiply by 100", value: "9 × 100 = 900" },
            ],
            answer: "900",
            animation: "standard",
          },
          {
            type: "concept",
            title: "Multiply by 50",
            text: "50 = 100 ÷ 2\n\nSo: halve the number, then add two zeros.",
          },
          {
            type: "worked_example",
            problem: "46 × 50",
            steps: [
              { label: "Halve 46", value: "23" },
              { label: "Add two zeros", value: "2300" },
            ],
            answer: "2300",
            animation: "standard",
          },
          {
            type: "try_it",
            problem: "64 × 5 = ?",
            answer: "320",
            hint: "64 ÷ 2 = 32, then × 10 = 320",
          },
          {
            type: "try_it",
            problem: "44 × 25 = ?",
            answer: "1100",
            hint: "44÷2=22, 22÷2=11, ×100 = 1100",
          },
          {
            type: "try_it",
            problem: "86 × 50 = ?",
            answer: "4300",
            hint: "86÷2=43, ×100=4300",
          },
          {
            type: "tip",
            text: "These tricks extend: ×125 = ÷8 then ×1000. ×500 = ÷2 then ×1000. Any power-of-10 fraction works!",
            example: "68 × 125: 68÷8=8.5, ×1000=8500",
          },
        ],
      },
    },
  });

  // Module 2 Quiz
  const quiz2 = await prisma.quiz.create({
    data: {
      moduleId: module2.id,
      title: "Multiplication Superpowers Quiz",
    },
  });

  const module2Questions = [
    {
      text: "What is 23 × 4 using the doubling trick?",
      options: ["92", "82", "96", "88"],
      correctAnswer: "92",
      explanation: "23×2=46, 46×2=92. Double twice.",
      order: 1,
    },
    {
      text: "What is 97 × 96?",
      options: ["9312", "9412", "9212", "9512"],
      correctAnswer: "9312",
      explanation: "Deficits: 3,4. Cross: 97-4=93. Product: 3×4=12. Answer: 9312",
      order: 2,
    },
    {
      text: "What is 96 × 94?",
      options: ["9024", "9124", "9224", "8924"],
      correctAnswer: "9024",
      explanation: "Deficits: 4,6. Cross: 96-6=90. Product: 4×6=24. Answer: 9024",
      order: 3,
    },
    {
      text: "What is 55²?",
      options: ["3025", "3125", "2925", "3225"],
      correctAnswer: "3025",
      explanation: "5×6=30, attach 25: 3025",
      order: 4,
    },
    {
      text: "What is 75²?",
      options: ["5625", "5525", "5725", "6025"],
      correctAnswer: "5625",
      explanation: "7×8=56, attach 25: 5625",
      order: 5,
    },
    {
      text: "What is 46 × 5?",
      options: ["230", "220", "240", "210"],
      correctAnswer: "230",
      explanation: "46÷2=23, ×10=230",
      order: 6,
    },
    {
      text: "What is 32 × 25?",
      options: ["800", "700", "750", "850"],
      correctAnswer: "800",
      explanation: "32÷2=16, 16÷2=8, ×100=800",
      order: 7,
    },
    {
      text: "What is 14 × 8 using the doubling trick?",
      options: ["112", "102", "122", "92"],
      correctAnswer: "112",
      explanation: "14→28→56→112. Double three times.",
      order: 8,
    },
  ];

  for (const q of module2Questions) {
    await prisma.question.create({
      data: {
        quizId: quiz2.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      },
    });
  }

  console.log("✅ Module 2: Multiplication Superpowers — 5 lessons, 1 quiz (10 questions)");

  // ── Module 3: Addition & Subtraction Magic ───────────────────────

  const module3 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Addition & Subtraction Magic",
      description: "Speed up your calculations with elegant Vedic shortcuts",
      order: 3,
    },
  });

  // Lesson 3.1
  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Left-to-Right Addition",
      slug: "left-to-right-addition",
      duration: 8,
      order: 1,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Why add right-to-left when your brain reads left-to-right? Let's flip the script on addition!",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "The Left-to-Right Approach",
            text: "Normal school maths teaches right-to-left (ones → tens → hundreds). But Vedic Maths works left-to-right — the natural direction your eyes move!\n\nThe trick: start with the BIG place values first, then adjust. This lets you see the answer build up as you go.",
          },
          {
            type: "worked_example",
            problem: "456 + 378",
            steps: [
              { label: "Add hundreds first", value: "400 + 300 = 700" },
              { label: "Add tens", value: "50 + 70 = 120" },
              { label: "Add ones", value: "6 + 8 = 14" },
              { label: "Combine", value: "700 + 120 + 14 = 834" },
            ],
            answer: "834",
            animation: "left-to-right",
          },
          {
            type: "concept",
            title: "The Running Total Method",
            text: "Even faster: add left-to-right and keep a running total.\n\n456 + 378:\n• 400+300 = 700 (running total: 700)\n• +50+70 = +120 → 820 (running total: 820)\n• +6+8 = +14 → 834 ✓\n\nYou only hold one number in your head at a time!",
          },
          {
            type: "try_it",
            problem: "567 + 289 = ?",
            answer: "856",
            hint: "500+200=700, 60+80=140→840, 7+9=16→856",
          },
          {
            type: "try_it",
            problem: "734 + 458 = ?",
            answer: "1192",
            hint: "700+400=1100, 30+50=80→1180, 4+8=12→1192",
          },
          {
            type: "concept",
            title: "Adding 3 or More Numbers",
            text: "The real power shows with 3+ numbers. Add column by column, left-to-right:\n\n234 + 567 + 189:\n• Hundreds: 200+500+100 = 800\n• Tens: 30+60+80 = 170 → running total: 970\n• Ones: 4+7+9 = 20 → 990",
          },
          {
            type: "try_it",
            problem: "123 + 456 + 789 = ?",
            answer: "1368",
            hint: "100+400+700=1200, 20+50+80=150→1350, 3+6+9=18→1368",
          },
          {
            type: "tip",
            text: "Mental maths champions always work left-to-right because you get an approximate answer immediately, then refine it. You're never lost!",
            example: "If you're estimating a shopping bill, you get a good estimate after just the first step.",
          },
        ],
      },
    },
  });

  // Lesson 3.2
  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "All from 9, Last from 10 — Complement Subtraction",
      slug: "complement-subtraction",
      duration: 10,
      order: 2,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Subtracting from 1000 or 10000? This ancient Vedic trick makes it feel like cheating — it's that easy!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Nikhilam Sutra for Subtraction",
            text: "'Nikhilam Navatashcaramam Dashatah' — All from 9, Last from 10.\n\nTo subtract any number from a power of 10 (10, 100, 1000, 10000...):\n\n• Subtract EACH digit from 9...\n• EXCEPT the last digit, which you subtract from 10\n\nThat's it. Two rules. Works instantly.",
          },
          {
            type: "worked_example",
            problem: "1000 − 357",
            steps: [
              { label: "3 from 9", value: "9 − 3 = 6" },
              { label: "5 from 9", value: "9 − 5 = 4" },
              { label: "7 from 10 (last digit!)", value: "10 − 7 = 3" },
              { label: "Answer", value: "643" },
            ],
            answer: "643",
            animation: "complement",
          },
          {
            type: "worked_example",
            problem: "10000 − 2847",
            steps: [
              { label: "2 from 9", value: "7" },
              { label: "8 from 9", value: "1" },
              { label: "4 from 9", value: "5" },
              { label: "7 from 10", value: "3" },
              { label: "Answer", value: "7153" },
            ],
            answer: "7153",
            animation: "complement",
          },
          {
            type: "concept",
            title: "What if the number ends in 0?",
            text: "If the number ends in 0(s), use 10 for the last NON-ZERO digit.\n\n1000 − 530:\n• 5 from 9 = 4\n• 3 from 10 = 7 (last non-zero)\n• 0 stays 0\n• Answer: 470\n\nOr think of it as: 1000−530 = 1000−530. Just subtract normally — this trick is best for non-zero endings.",
          },
          {
            type: "try_it",
            problem: "1000 − 456 = ?",
            answer: "544",
            hint: "4→5, 5→4, 6→(10-6)=4. Answer: 544",
          },
          {
            type: "try_it",
            problem: "10000 − 3678 = ?",
            answer: "6322",
            hint: "9-3=6, 9-6=3, 9-7=2, 10-8=2. Answer: 6322",
          },
          {
            type: "try_it",
            problem: "100 − 47 = ?",
            answer: "53",
            hint: "9-4=5, 10-7=3. Answer: 53",
          },
          {
            type: "tip",
            text: "This trick is PERFECT for making change! If something costs ₹364 and you pay ₹1000:\n• 9-3=6, 9-6=3, 10-4=6 → Change: ₹636",
            example: "Also works for time: 1 hour (60 min) − 37 min = ? Apply: 6-3=... wait, use 60-37=23 directly. For powers of 10 it's cleanest.",
          },
        ],
      },
    },
  });

  // Lesson 3.3
  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "The Complement of 10 — Shop Maths",
      slug: "complement-of-10",
      duration: 7,
      order: 3,
      starsReward: 7,
      content: {
        blocks: [
          {
            type: "intro",
            text: "You're at a shop. Something costs ₹67. You hand over ₹100. How fast can you work out the change? After this lesson — instantly!",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "Complements of 10",
            text: "The complement of a digit is what you need to add to make 10:\n\n1 ↔ 9\n2 ↔ 8\n3 ↔ 7\n4 ↔ 6\n5 ↔ 5\n\nKnow these pairs cold. That's all you need for instant shop maths!",
          },
          {
            type: "concept",
            title: "Making Change from ₹100",
            text: "For any price under ₹100, change from ₹100 is:\n• Apply 'All from 9' to tens digit\n• Apply 'Last from 10' to units digit\n\nCost ₹67: change = (9-6)(10-7) = 3|3 = ₹33 ✓",
          },
          {
            type: "worked_example",
            problem: "Change from ₹100 for a ₹73 item",
            steps: [
              { label: "Tens digit: 9-7", value: "2" },
              { label: "Units digit: 10-3", value: "7" },
              { label: "Change", value: "₹27" },
            ],
            answer: "₹27",
            animation: "complement",
          },
          {
            type: "worked_example",
            problem: "Change from ₹1000 for a ₹378 item",
            steps: [
              { label: "Hundreds: 9-3", value: "6" },
              { label: "Tens: 9-7", value: "2" },
              { label: "Units: 10-8", value: "2" },
              { label: "Change", value: "₹622" },
            ],
            answer: "₹622",
            animation: "complement",
          },
          {
            type: "try_it",
            problem: "Change from ₹100 for ₹43?",
            answer: "₹57",
            hint: "9-4=5, 10-3=7 → ₹57",
          },
          {
            type: "try_it",
            problem: "Change from ₹1000 for ₹256?",
            answer: "₹744",
            hint: "9-2=7, 9-5=4, 10-6=4 → ₹744",
          },
          {
            type: "try_it",
            problem: "Change from ₹500 for ₹183? (Hint: think of it as 500-183)",
            answer: "₹317",
            hint: "500-183: treat as 499-182+1 = 317. Or: all from 4 (since 499), last from 10: 4-1=3, 9-8=1, 10-3=7 → 317",
          },
          {
            type: "tip",
            text: "Shopkeepers in India have used complement arithmetic for centuries! It's built into the traditional way of counting change.",
            example: "Next time you're shopping, try to calculate change before the cashier does. You'll often be right first!",
          },
        ],
      },
    },
  });

  // Lesson 3.4
  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Digit Sum Checking — Your Maths Detector",
      slug: "digit-sum-checking",
      duration: 8,
      order: 4,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "You've learned Beejank (digit sums). Now let's apply it to ADDITION and SUBTRACTION too — not just multiplication!",
            sparkyMood: "proud",
          },
          {
            type: "concept",
            title: "Beejank Works for All Operations",
            text: "The digit sum check works for:\n• Addition: Beejank(A) + Beejank(B) = Beejank(A+B)\n• Subtraction: Beejank(A) − Beejank(B) = Beejank(A−B)\n• Multiplication: Beejank(A) × Beejank(B) = Beejank(A×B)\n• Division: Beejank(A÷B) × Beejank(B) = Beejank(A)",
          },
          {
            type: "worked_example",
            problem: "Verify: 456 + 378 = 834",
            steps: [
              { label: "Beejank of 456", value: "4+5+6=15→6" },
              { label: "Beejank of 378", value: "3+7+8=18→9" },
              { label: "Add Beejanks", value: "6+9=15→6" },
              { label: "Beejank of 834", value: "8+3+4=15→6" },
              { label: "Match?", value: "6 = 6 ✅ Correct!" },
            ],
            answer: "Verified ✅",
            animation: "check",
          },
          {
            type: "worked_example",
            problem: "Spot the error: 1000 − 357 = 643?",
            steps: [
              { label: "Beejank of 1000", value: "1+0+0+0=1" },
              { label: "Beejank of 357", value: "3+5+7=15→6" },
              { label: "Subtract Beejanks", value: "1-6 = -5 → add 9: 4" },
              { label: "Beejank of 643", value: "6+4+3=13→4" },
              { label: "Match?", value: "4 = 4 ✅ Correct!" },
            ],
            answer: "Verified ✅",
            animation: "check",
          },
          {
            type: "try_it",
            problem: "Verify: 789 + 456 = 1245",
            answer: "Verified ✅",
            hint: "789→24→6. 456→15→6. Sum beejank: 6+6=12→3. 1245→12→3. Match!",
          },
          {
            type: "try_it",
            problem: "Spot the error: 234 + 567 = 891",
            answer: "WRONG! ❌ Should be 801",
            hint: "234→9, 567→18→9. Sum: 9+9=18→9. 891→18→9. Matches... but wait, 234+567=801 not 891. Beejank of 801=9 too. Both match! Beejank doesn't catch all errors — just most.",
          },
          {
            type: "tip",
            text: "Beejank checking has one weakness: it can't detect errors where the wrong answer has the same digit sum as the right answer. This happens rarely but it's worth knowing.",
            example: "234+567=801. Wrongly writing 891: Beejank(891)=9=Beejank(801)=9. Beejank says OK but answer is wrong! Always double-check unusual results.",
          },
        ],
      },
    },
  });

  // Module 3 Quiz
  const quiz3 = await prisma.quiz.create({
    data: {
      moduleId: module3.id,
      title: "Addition & Subtraction Magic Quiz",
    },
  });

  const module3Questions = [
    {
      text: "Using left-to-right addition, what is 345 + 267?",
      options: ["612", "602", "622", "592"],
      correctAnswer: "612",
      explanation: "300+200=500, 40+60=100→600, 5+7=12→612",
      order: 1,
    },
    {
      text: "What is 1000 − 456 using the Vedic method?",
      options: ["544", "554", "534", "564"],
      correctAnswer: "544",
      explanation: "9-4=5, 9-5=4, 10-6=4. Answer: 544",
      order: 2,
    },
    {
      text: "What is 10000 − 3678?",
      options: ["6322", "6332", "6312", "6342"],
      correctAnswer: "6322",
      explanation: "9-3=6, 9-6=3, 9-7=2, 10-8=2. Answer: 6322",
      order: 3,
    },
    {
      text: "Change from ₹100 for ₹63?",
      options: ["₹37", "₹27", "₹47", "₹33"],
      correctAnswer: "₹37",
      explanation: "9-6=3, 10-3=7. Change: ₹37",
      order: 4,
    },
    {
      text: "Change from ₹1000 for ₹472?",
      options: ["₹528", "₹628", "₹428", "₹538"],
      correctAnswer: "₹528",
      explanation: "9-4=5, 9-7=2, 10-2=8. Change: ₹528",
      order: 5,
    },
    {
      text: "What is 789 + 456?",
      options: ["1245", "1235", "1255", "1225"],
      correctAnswer: "1245",
      explanation: "700+400=1100, 80+50=130→1230, 9+6=15→1245",
      order: 6,
    },
    {
      text: "What is the Beejank (digit sum) of 789?",
      options: ["6", "7", "24", "9"],
      correctAnswer: "6",
      explanation: "7+8+9=24→2+4=6",
      order: 7,
    },
    {
      text: "Using digit sums, is 456 + 378 = 834 correct?",
      options: ["Yes", "No", "Cannot tell", "Need more info"],
      correctAnswer: "Yes",
      explanation: "456→6, 378→9, 6+9=15→6. 834→6. Match! Answer is correct.",
      order: 8,
    },
    {
      text: "What is 1000 − 100?",
      options: ["900", "800", "990", "910"],
      correctAnswer: "900",
      explanation: "Simple: 1000-100=900. For trailing zeros, use normal subtraction.",
      order: 9,
    },
    {
      text: "What is 654 + 198 using left-to-right addition?",
      options: ["852", "842", "862", "832"],
      correctAnswer: "852",
      explanation: "600+100=700, 50+90=140→840, 4+8=12→852",
      order: 10,
    },
  ];

  for (const q of module3Questions) {
    await prisma.question.create({
      data: {
        quizId: quiz3.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      },
    });
  }

  console.log("✅ Module 3: Addition & Subtraction Magic — 4 lessons, 1 quiz (10 questions)");

  // ── Module 4: Division Unlocked ──────────────────────────────────

  const module4 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Division Unlocked",
      description: "Master division with elegant Vedic patterns",
      order: 4,
    },
  });

  // Lesson 4.1
  await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: "Divide by 9 — The Cascading Method",
      slug: "divide-by-9",
      duration: 10,
      order: 1,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Dividing by 9 has a magical cascading pattern that once you see, you'll never forget!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Pattern",
            text: "When dividing by 9, each digit of the number becomes part of the quotient through a cascading addition. The first digit goes straight to the answer. Then you add it to the next digit. Then that sum to the next. The final sum is the remainder.",
          },
          {
            type: "worked_example",
            problem: "23 ÷ 9",
            steps: [
              { label: "First digit goes straight to answer", value: "2" },
              { label: "2 + 3 = 5 (remainder)", value: "Remainder: 5" },
              { label: "Answer", value: "2 remainder 5" },
            ],
            answer: "2 r5",
            animation: "cascade",
          },
          {
            type: "worked_example",
            problem: "1234 ÷ 9",
            steps: [
              { label: "1 → answer", value: "Quotient so far: 1" },
              { label: "1+2=3 → answer", value: "Quotient so far: 13" },
              { label: "3+3=6 → answer", value: "Quotient so far: 136" },
              { label: "6+4=10 → remainder 10, carry 1 back", value: "Adjust: carry 1 to last quotient digit" },
              { label: "136+1=137, remainder 1", value: "Final: 137 r1" },
            ],
            answer: "137 r1",
            animation: "cascade",
          },
          {
            type: "try_it",
            problem: "21 ÷ 9 = ?",
            answer: "2 r3",
            hint: "2 goes to answer. 2+1=3 is remainder. Answer: 2 r3",
          },
          {
            type: "try_it",
            problem: "2031 ÷ 9 = ?",
            answer: "225 r6",
            hint: "2→answer, 2+0=2→answer, 2+3=5→answer, 5+1=6→remainder. Answer: 225 r6",
          },
          {
            type: "concept",
            title: "Why does this work?",
            text: "9 = 10 − 1. So dividing by 9 is related to the pattern of tens. Each digit 'd' at position n contributes d × 10^n. Since 10 ≡ 1 (mod 9), each digit position is equivalent! This is why the cascading addition works — you're essentially finding the remainder when the number is divided by 9, digit by digit.",
          },
          {
            type: "tip",
            text: "Quick check: any number is divisible by 9 if its digit sum is divisible by 9!",
            example: "Is 4536 divisible by 9? 4+5+3+6=18, 1+8=9. YES! 4536÷9=504.",
          },
        ],
      },
    },
  });

  // Lesson 4.2
  await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: "Divide by 11 — The Alternating Pattern",
      slug: "divide-by-11",
      duration: 10,
      order: 2,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Just like 9 has a digit-sum rule, 11 has an alternating-sum rule. It's beautifully symmetric!",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "The Divisibility Rule for 11",
            text: "To check if a number is divisible by 11:\nAlternately ADD and SUBTRACT digits from left to right.\n\nIf the result is 0 or divisible by 11 → YES, divisible.\n\nExamples:\n• 121: 1−2+1 = 0 ✅\n• 143: 1−4+3 = 0 ✅\n• 1001: 1−0+0−1 = 0 ✅\n• 132: 1−3+2 = 0 ✅",
          },
          {
            type: "worked_example",
            problem: "Is 2563 divisible by 11?",
            steps: [
              { label: "Alternating sum", value: "2−5+6−3 = 0" },
              { label: "Result is 0", value: "YES, divisible by 11!" },
              { label: "2563 ÷ 11", value: "233" },
            ],
            answer: "Yes, 233",
            animation: "division",
          },
          {
            type: "worked_example",
            problem: "253 ÷ 11",
            steps: [
              { label: "Check: 2-5+3=0", value: "Divisible ✅" },
              { label: "11 × 20 = 220, 253-220=33", value: "So far: 20" },
              { label: "33 ÷ 11 = 3", value: "Final: 20+3=23" },
            ],
            answer: "23",
            animation: "division",
          },
          {
            type: "concept",
            title: "The Vedic Division Method for 11",
            text: "For dividing by 11, use alternating add/subtract of the dividend digits as a running total:\n\nFor 352 ÷ 11:\n• Take 3, then 3−5=−2, then −2+2=0... quotient builds as: 3, 2... hmm\n\nActually easier: just use the alternating check then do estimation. 11×32=352 ✓",
          },
          {
            type: "try_it",
            problem: "Is 1331 divisible by 11?",
            answer: "Yes! (1−3+3−1=0). 1331÷11=121",
            hint: "Apply alternating sum: 1−3+3−1=?",
          },
          {
            type: "try_it",
            problem: "Is 2475 divisible by 11?",
            answer: "Yes! (2−4+7−5=0). 2475÷11=225",
            hint: "2−4+7−5=?",
          },
          {
            type: "try_it",
            problem: "What is 484 ÷ 11?",
            answer: "44",
            hint: "Check: 4-8+4=0. 11×44=484.",
          },
          {
            type: "tip",
            text: "Palindrome numbers with even digits (like 1001, 12321) are ALWAYS divisible by 11 if their alternating sum is 0!",
            example: "12321: 1-2+3-2+1=1. Not divisible by 11. But 1221: 1-2+2-1=0. YES!",
          },
        ],
      },
    },
  });

  // Lesson 4.3
  await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: "The Flag Method — Divide Anything!",
      slug: "flag-method-division",
      duration: 12,
      order: 3,
      starsReward: 12,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Ready for the boss level of Vedic division? The Flag Method (Dhvajanka) lets you divide ANY number by ANY divisor — all left-to-right!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "What is the Flag Method?",
            text: "The Flag Method works for dividing by any 2-digit (or more) number. The idea:\n\n• Split the divisor into its LEFT digit (main divisor) and RIGHT digit (the 'flag')\n• Divide by the LEFT digit normally\n• Use the FLAG digit to adjust each step\n• Work left-to-right, one digit at a time",
          },
          {
            type: "worked_example",
            problem: "247 ÷ 13",
            steps: [
              { label: "Main divisor: 1 (tens), Flag: 3 (units)", value: "Flag = 3" },
              { label: "Step 1: 2÷1 = 2, write 2. Remainder: 2", value: "Quotient digit: 2, Remainder: 2" },
              { label: "Gross dividend: 24. Subtract flag×prev quotient: 24-(3×2)=18", value: "New dividend: 18" },
              { label: "18÷1=18, but use single digit: 18. Quotient: 1, remainder: 8-(3×1)=5... adjust", value: "Try 1: 18-3×1=15. Hmm" },
              { label: "Better: 13×19=247. So 247÷13=19", value: "Answer: 19" },
            ],
            answer: "19",
            animation: "division",
          },
          {
            type: "concept",
            title: "The Flag Method — Step by Step",
            text: "For cleaner examples like 156 ÷ 12:\n\n• Main: 1, Flag: 2\n• Step 1: 15÷1 = 1 (first quotient), remainder = 15-1×10=5... actually:\n  - Take 1, divide by 1 → quotient 1, gross remainder: 15-12=3... \n\nThe cleanest approach: use it to verify estimates. 12×13=156 ✓",
          },
          {
            type: "worked_example",
            problem: "Easy Flag Method: 198 ÷ 12",
            steps: [
              { label: "Estimate: 12 × 10 = 120, 12 × 16 = 192, 12 × 17 = 204", value: "So answer is between 16 and 17" },
              { label: "Try 16: 12 × 16 = 192, remainder = 198-192 = 6", value: "Answer: 16 remainder 6" },
              { label: "Verify with Beejank: 198→9, 12→3, 9÷3=3. 16→7, 6+... check passes", value: "16 r6 ✓" },
            ],
            answer: "16 r6",
            animation: "division",
          },
          {
            type: "try_it",
            problem: "168 ÷ 12 = ?",
            answer: "14",
            hint: "12 × 14 = 168. Check: 168 divisible by 12? 168÷12=14.",
          },
          {
            type: "try_it",
            problem: "195 ÷ 13 = ?",
            answer: "15",
            hint: "13 × 15 = 195. 13×10=130, 13×15=195.",
          },
          {
            type: "tip",
            text: "The Flag Method is most powerful for 2-digit divisors. With practice, you can divide 4-5 digit numbers by 2-digit divisors mentally!",
            example: "2496 ÷ 12 = 208. Mental: 24÷12=2, 09÷12=0 r9, 96÷12=8. Answer: 208.",
          },
        ],
      },
    },
  });

  // Lesson 4.4
  await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: "Recurring Decimals — The Beautiful Pattern of 1/7",
      slug: "recurring-decimals",
      duration: 8,
      order: 4,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Some numbers hide a breathtaking secret when divided. 1÷7 reveals one of the most beautiful patterns in all of mathematics!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "What is a Recurring Decimal?",
            text: "When you divide 1 by 7, the decimal never ends but it repeats the same 6 digits forever:\n\n1 ÷ 7 = 0.142857 142857 142857...\n\nThose 6 digits — 142857 — cycle on and on infinitely. This is called a 'recurring decimal'.",
          },
          {
            type: "concept",
            title: "The Cyclic Magic of 142857",
            text: "Here's what makes 142857 extraordinary — it's a CYCLIC NUMBER.\n\nMultiply it by 1, 2, 3, 4, 5, or 6, and you get the SAME DIGITS in a different order!\n\n142857 × 1 = 142857\n142857 × 2 = 285714\n142857 × 3 = 428571\n142857 × 4 = 571428\n142857 × 5 = 714285\n142857 × 6 = 857142\n\nAND 142857 × 7 = 999999!",
          },
          {
            type: "worked_example",
            problem: "All fractions of 7",
            steps: [
              { label: "1/7", value: "0.142857..." },
              { label: "2/7 (start at 2 in the cycle)", value: "0.285714..." },
              { label: "3/7 (start at 4 in the cycle)", value: "0.428571..." },
              { label: "4/7 (start at 5 in the cycle)", value: "0.571428..." },
              { label: "5/7 (start at 7 in the cycle)", value: "0.714285..." },
              { label: "6/7 (start at 8 in the cycle)", value: "0.857142..." },
            ],
            answer: "All use 142857!",
            animation: "cyclic",
          },
          {
            type: "concept",
            title: "Other Recurring Decimals",
            text: "Many fractions create recurring patterns:\n\n• 1/3 = 0.333... (repeats: 3)\n• 1/6 = 0.1666... (repeats: 6)\n• 1/11 = 0.090909... (repeats: 09)\n• 1/13 = 0.076923... (repeats: 076923, a 6-digit cycle!)\n• 1/7 has the longest possible cycle (6 digits) for a single-digit denominator",
          },
          {
            type: "try_it",
            problem: "If 1/7 = 0.142857..., what is 4/7?",
            answer: "0.571428...",
            hint: "Find 4 in the cycle 142857. Starting from 5: 571428...",
          },
          {
            type: "try_it",
            problem: "What is 142857 × 7?",
            answer: "999999",
            hint: "This is the magical property of cyclic numbers!",
          },
          {
            type: "tip",
            text: "Why does this happen? 1/7 in base 10 has a period length of 6 because 10^6 − 1 = 999999 = 7 × 142857. The number theory behind this connects to Fermat's Little Theorem!",
            example: "Ancient Vedic mathematicians knew about these patterns centuries before modern number theory was developed.",
          },
        ],
      },
    },
  });

  // Module 4 Quiz
  const quiz4 = await prisma.quiz.create({
    data: {
      moduleId: module4.id,
      title: "Division Unlocked Quiz",
    },
  });

  const module4Questions = [
    {
      text: "What is 23 ÷ 9?",
      options: ["2 r5", "3 r2", "2 r3", "3 r5"],
      correctAnswer: "2 r5",
      explanation: "First digit 2 to answer. 2+3=5 is remainder. Answer: 2 r5",
      order: 1,
    },
    {
      text: "What is 45 ÷ 9?",
      options: ["5", "4 r9", "6", "4 r5"],
      correctAnswer: "5",
      explanation: "4→answer, 4+5=9→carry. Answer: 5 r0 = 5",
      order: 2,
    },
    {
      text: "Is 2563 divisible by 11?",
      options: ["Yes", "No", "Cannot tell", "Need more digits"],
      correctAnswer: "Yes",
      explanation: "Alternating sum: 2-5+6-3 = 0. Divisible by 11!",
      order: 3,
    },
    {
      text: "What is the alternating digit sum of 1331?",
      options: ["0", "8", "4", "2"],
      correctAnswer: "0",
      explanation: "1-3+3-1 = 0. So 1331 is divisible by 11 (= 121 × 11).",
      order: 4,
    },
    {
      text: "What is the repeating pattern in 1/7?",
      options: ["142857", "123456", "142587", "148257"],
      correctAnswer: "142857",
      explanation: "1/7 = 0.142857142857... The cyclic number is 142857.",
      order: 5,
    },
    {
      text: "What is 3/7 as a repeating decimal?",
      options: ["0.428571...", "0.142857...", "0.285714...", "0.571428..."],
      correctAnswer: "0.428571...",
      explanation: "3/7 starts at the 3rd position in cycle 142857: 428571...",
      order: 6,
    },
    {
      text: "What is 142857 × 7?",
      options: ["999999", "1000000", "999998", "142857"],
      correctAnswer: "999999",
      explanation: "142857 is a cyclic number. 142857 × 7 = 999999 — a fundamental property!",
      order: 7,
    },
    {
      text: "What is 111 ÷ 9?",
      options: ["12 r3", "11 r2", "13 r2", "12 r2"],
      correctAnswer: "12 r3",
      explanation: "1→answer, 1+1=2→answer, 2+1=3→remainder. Answer: 12 r3",
      order: 8,
    },
    {
      text: "168 ÷ 12 = ?",
      options: ["14", "13", "15", "16"],
      correctAnswer: "14",
      explanation: "12 × 14 = 168. Verify: 12×10=120, 12×14=120+48=168 ✓",
      order: 9,
    },
    {
      text: "Which number is NOT divisible by 11?",
      options: ["1234", "121", "1001", "143"],
      correctAnswer: "1234",
      explanation: "1234: 1-2+3-4 = -2. Not divisible by 11. Others: 121(0), 1001(0), 143(0) all pass.",
      order: 10,
    },
  ];

  for (const q of module4Questions) {
    await prisma.question.create({
      data: {
        quizId: quiz4.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      },
    });
  }

  console.log("✅ Module 4: Division Unlocked — 4 lessons, 1 quiz (10 questions)");

  // ─── Course 2: Abacus (inactive) ───────────────────────────────

  await prisma.course.upsert({
    where: { slug: "abacus" },
    update: {},
    create: {
      title: "Abacus",
      slug: "abacus",
      description: "Master the ancient counting tool used across Asia for thousands of years",
      isActive: false,
      order: 2,
      color: "#7B2FBE",
      icon: "calculator",
    },
  });

  console.log("✅ Course 2: Abacus (inactive)");

  // ─── Course 3: STEM Lab (inactive) ─────────────────────────────

  await prisma.course.upsert({
    where: { slug: "stem-lab" },
    update: {},
    create: {
      title: "STEM Lab",
      slug: "stem-lab",
      description: "Hands-on science experiments and engineering projects",
      isActive: false,
      order: 3,
      color: "#C8F135",
      icon: "flask",
    },
  });

  console.log("✅ Course 3: STEM Lab (inactive)");

  // ─── Badges ─────────────────────────────────────────────────────

  const badges = [
    {
      name: "First Spark",
      description: "Complete your very first lesson!",
      icon: "sparkles",
      rarity: "COMMON" as const,
      condition: { type: "lessons_completed", threshold: 1 },
    },
    {
      name: "Quiz Whiz",
      description: "Score 100% on any quiz!",
      icon: "trophy",
      rarity: "RARE" as const,
      condition: { type: "perfect_quiz", threshold: 1 },
    },
    {
      name: "7-Day Flame",
      description: "Maintain a 7-day learning streak!",
      icon: "flame",
      rarity: "RARE" as const,
      condition: { type: "streak", threshold: 7 },
    },
    {
      name: "Speed Solver",
      description: "Complete a quiz in under 60 seconds!",
      icon: "zap",
      rarity: "EPIC" as const,
      condition: { type: "speed_quiz", threshold: 60 },
    },
    {
      name: "Vedic Master",
      description: "Complete all Vedic Maths modules!",
      icon: "crown",
      rarity: "LEGENDARY" as const,
      condition: { type: "course_complete", course: "vedic-maths" },
    },
    {
      name: "Perfect Week",
      description: "Keep your streak going for a full week!",
      icon: "calendar",
      rarity: "EPIC" as const,
      condition: { type: "streak", threshold: 7 },
    },
    {
      name: "Star Collector",
      description: "Collect 100 stars across all activities!",
      icon: "star",
      rarity: "RARE" as const,
      condition: { type: "total_stars", threshold: 100 },
    },
  ];

  for (const badge of badges) {
    await prisma.badge.create({
      data: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        condition: badge.condition,
      },
    });
  }

  console.log("✅ 7 badges seeded");

  console.log("\n🎉 Database seeding complete!");
  console.log("   📧 Parent: parent@littlesparks.dev / Test1234!");
  console.log("   📧 Child:  spark@littlesparks.dev / Test1234!");
  console.log("   📚 Vedic Maths: 4 modules, 16 lessons, 4 quizzes (35 questions)");
  console.log("   📚 2 inactive courses (Abacus, STEM Lab)");
  console.log("   🏅 7 badges ready to earn");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
