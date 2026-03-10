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
    update: {},
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
    update: {},
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
  // Delete in order respecting foreign key constraints
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

  // ── Module 1: What is Vedic Maths? ─────────────────────────────

  const module1 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "What is Vedic Maths?",
      description: "Discover the ancient Indian system of mathematics",
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "History & Fun Facts",
      slug: "history-fun-facts",
      duration: 5,
      order: 1,
      starsReward: 5,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Did you know there's a super-ancient way of doing maths that's over 3,000 years old?",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "What is Vedic Maths?",
            text: "Vedic Maths comes from ancient Indian texts called the Vedas. It was rediscovered by Bharati Krishna Tirthaji in the early 1900s. He found 16 simple formulas (called Sutras) that make maths incredibly fast and fun!",
          },
          {
            type: "concept",
            title: "Fun Facts",
            text: "1. Vedic Maths has just 16 main sutras (formulas)\n2. Ancient Indian mathematicians invented the number zero!\n3. The word 'Veda' means 'knowledge' in Sanskrit\n4. These techniques can help you solve problems 10-15 times faster than regular methods",
          },
          {
            type: "tip",
            text: "Vedic Maths isn't about replacing what you learn in school — it's about having extra superpowers to solve problems faster!",
            example:
              "Imagine multiplying 998 × 997 in your head in 3 seconds!",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "How is it different from regular maths?",
      slug: "vedic-vs-regular",
      duration: 5,
      order: 2,
      starsReward: 5,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Let's see why Vedic Maths feels like a superpower compared to regular methods!",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "Regular vs Vedic",
            text: "Regular maths usually works right-to-left (ones, tens, hundreds...). Vedic Maths often works left-to-right — the way we naturally read numbers! This makes mental maths much easier.",
          },
          {
            type: "worked_example",
            problem: "Regular way: 45 + 38",
            steps: [
              { label: "Add ones", value: "5 + 8 = 13, carry 1" },
              { label: "Add tens", value: "4 + 3 + 1 = 8" },
              { label: "Answer", value: "83" },
            ],
            answer: "83",
            animation: "standard",
          },
          {
            type: "worked_example",
            problem: "Vedic way: 45 + 38",
            steps: [
              { label: "Add tens first", value: "40 + 30 = 70" },
              { label: "Add ones", value: "5 + 8 = 13" },
              { label: "Combine", value: "70 + 13 = 83" },
            ],
            answer: "83",
            animation: "vedic",
          },
          {
            type: "tip",
            text: "Both methods give the same answer, but the Vedic way is easier to do in your head because you work with bigger chunks first!",
          },
        ],
      },
    },
  });

  console.log("✅ Module 1: What is Vedic Maths? — 2 lessons");

  // ── Module 2: Multiplication Superpowers ────────────────────────

  const module2 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Multiplication Superpowers",
      description: "Master lightning-fast multiplication tricks",
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Multiply by 11 — The Sandwich Method",
      slug: "multiply-by-11",
      duration: 10,
      order: 1,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Welcome to the magic of multiplying by 11! This is one of the coolest Vedic tricks ever!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Sandwich Method",
            text: "To multiply any 2-digit number by 11, just add the two digits and place the sum in the middle! It's like making a sandwich — the original digits are the bread, and their sum is the filling!",
          },
          {
            type: "worked_example",
            problem: "23 × 11",
            steps: [
              { label: "Take the digits", value: "2 and 3" },
              { label: "Add them", value: "2 + 3 = 5" },
              { label: "Place 5 in the middle", value: "2_3 → 253" },
            ],
            answer: "253",
            animation: "sandwich",
          },
          {
            type: "worked_example",
            problem: "35 × 11",
            steps: [
              { label: "Take the digits", value: "3 and 5" },
              { label: "Add them", value: "3 + 5 = 8" },
              { label: "Place 8 in the middle", value: "3_5 → 385" },
            ],
            answer: "385",
            animation: "sandwich",
          },
          {
            type: "try_it",
            problem: "45 × 11 = ?",
            answer: "495",
            hint: "Add 4 + 5 = 9, place it in the middle",
          },
          {
            type: "tip",
            text: "What if the middle sum is 10 or more? Carry the 1!",
            example:
              "75 × 11 → 7+5=12 → 7(12)5 → carry the 1 → 825",
          },
          {
            type: "try_it",
            problem: "77 × 11 = ?",
            answer: "847",
            hint: "7+7=14, place 4 in middle and carry 1 to the left digit",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Multiply close to 100 — The Base Method",
      slug: "base-method-100",
      duration: 10,
      order: 2,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "What if I told you that you can multiply numbers like 97 × 96 in your head? Let's learn the Base Method!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Base Method",
            text: "When both numbers are close to 100, find how far each is from 100 (the deficit). Cross-subtract, then multiply the deficits!",
          },
          {
            type: "worked_example",
            problem: "97 × 96",
            steps: [
              {
                label: "Deficits from 100",
                value: "97 is 3 below, 96 is 4 below",
              },
              {
                label: "Cross subtract",
                value: "97 - 4 = 93 (or 96 - 3 = 93)",
              },
              { label: "Multiply deficits", value: "3 × 4 = 12" },
              { label: "Combine", value: "93 | 12 = 9312" },
            ],
            answer: "9312",
            animation: "base",
          },
          {
            type: "try_it",
            problem: "98 × 95 = ?",
            answer: "9310",
            hint: "Deficits: 2 and 5. Cross subtract: 98-5=93. Deficits product: 2×5=10. Answer: 9310",
          },
          {
            type: "tip",
            text: "This works because (100-a)(100-b) = (100-a-b)×100 + a×b. The algebra is beautiful!",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Squaring numbers ending in 5",
      slug: "squaring-ending-5",
      duration: 8,
      order: 3,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Squaring numbers ending in 5 is SO easy with Vedic Maths. Watch this!",
            sparkyMood: "proud",
          },
          {
            type: "concept",
            title: "The Rule",
            text: "To square any number ending in 5: Take the tens digit, multiply it by (itself + 1), then append 25 at the end!",
          },
          {
            type: "worked_example",
            problem: "35²",
            steps: [
              { label: "Tens digit", value: "3" },
              { label: "Multiply by next", value: "3 × 4 = 12" },
              { label: "Append 25", value: "12 | 25 = 1225" },
            ],
            answer: "1225",
            animation: "square",
          },
          {
            type: "worked_example",
            problem: "65²",
            steps: [
              { label: "Tens digit", value: "6" },
              { label: "Multiply by next", value: "6 × 7 = 42" },
              { label: "Append 25", value: "42 | 25 = 4225" },
            ],
            answer: "4225",
            animation: "square",
          },
          {
            type: "try_it",
            problem: "85² = ?",
            answer: "7225",
            hint: "8 × 9 = 72, append 25",
          },
          {
            type: "try_it",
            problem: "45² = ?",
            answer: "2025",
            hint: "4 × 5 = 20, append 25",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Multiply by 5, 25, 50 instantly",
      slug: "multiply-by-5-25-50",
      duration: 8,
      order: 4,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Here's a secret: multiplying by 5, 25, and 50 is just dividing in disguise!",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "Multiply by 5",
            text: "To multiply any number by 5: divide by 2, then multiply by 10. Why? Because 5 = 10/2!",
          },
          {
            type: "worked_example",
            problem: "48 × 5",
            steps: [
              { label: "Divide by 2", value: "48 ÷ 2 = 24" },
              { label: "Multiply by 10", value: "24 × 10 = 240" },
            ],
            answer: "240",
            animation: "standard",
          },
          {
            type: "concept",
            title: "Multiply by 25",
            text: "Multiply by 25: divide by 4, then multiply by 100. Because 25 = 100/4!",
          },
          {
            type: "worked_example",
            problem: "36 × 25",
            steps: [
              { label: "Divide by 4", value: "36 ÷ 4 = 9" },
              { label: "Multiply by 100", value: "9 × 100 = 900" },
            ],
            answer: "900",
            animation: "standard",
          },
          {
            type: "concept",
            title: "Multiply by 50",
            text: "Multiply by 50: divide by 2, then multiply by 100. Because 50 = 100/2!",
          },
          {
            type: "try_it",
            problem: "64 × 5 = ?",
            answer: "320",
            hint: "64 ÷ 2 = 32, then × 10",
          },
          {
            type: "try_it",
            problem: "48 × 25 = ?",
            answer: "1200",
            hint: "48 ÷ 4 = 12, then × 100",
          },
        ],
      },
    },
  });

  // Quiz for Module 2
  const quiz2 = await prisma.quiz.create({
    data: {
      moduleId: module2.id,
      title: "Multiplication Superpowers Quiz",
    },
  });

  const module2Questions = [
    {
      text: "What is 34 × 11?",
      options: ["374", "344", "354", "364"],
      correctAnswer: "374",
      explanation: "3+4=7, place in middle: 374",
      order: 1,
    },
    {
      text: "What is 56 × 11?",
      options: ["616", "506", "566", "626"],
      correctAnswer: "616",
      explanation: "5+6=11, place 1 in middle carry 1: 616",
      order: 2,
    },
    {
      text: "What is 97 × 98?",
      options: ["9506", "9406", "9306", "9606"],
      correctAnswer: "9506",
      explanation:
        "Deficits: 3,2. Cross: 97-2=95. Product: 3×2=06. Answer: 9506",
      order: 3,
    },
    {
      text: "What is 96 × 93?",
      options: ["8828", "8928", "8728", "9028"],
      correctAnswer: "8928",
      explanation:
        "Deficits: 4,7. Cross: 96-7=89. Product: 4×7=28. Answer: 8928",
      order: 4,
    },
    {
      text: "What is 25²?",
      options: ["525", "625", "725", "425"],
      correctAnswer: "625",
      explanation: "2×3=6, append 25: 625",
      order: 5,
    },
    {
      text: "What is 75²?",
      options: ["5525", "5625", "5225", "5725"],
      correctAnswer: "5625",
      explanation: "7×8=56, append 25: 5625",
      order: 6,
    },
    {
      text: "What is 46 × 5?",
      options: ["220", "230", "240", "210"],
      correctAnswer: "230",
      explanation: "46÷2=23, ×10=230",
      order: 7,
    },
    {
      text: "What is 32 × 25?",
      options: ["700", "750", "800", "850"],
      correctAnswer: "800",
      explanation: "32÷4=8, ×100=800",
      order: 8,
    },
    {
      text: "What is 88 × 11?",
      options: ["968", "958", "978", "948"],
      correctAnswer: "968",
      explanation: "8+8=16, place 6 carry 1: 968",
      order: 9,
    },
    {
      text: "What is 55²?",
      options: ["3025", "3125", "2925", "3225"],
      correctAnswer: "3025",
      explanation: "5×6=30, append 25: 3025",
      order: 10,
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

  console.log(
    "✅ Module 2: Multiplication Superpowers — 4 lessons, 1 quiz (10 questions)"
  );

  // ── Module 3: Addition & Subtraction Shortcuts ──────────────────

  const module3 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Addition & Subtraction Shortcuts",
      description: "Speed up your addition and subtraction",
      order: 3,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Complement Subtraction — All from 9, Last from 10",
      slug: "complement-subtraction",
      duration: 10,
      order: 1,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Subtracting from big round numbers like 1000 or 10000 is a breeze with this Vedic trick!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "All from 9, Last from 10",
            text: "To subtract any number from a power of 10 (like 1000, 10000), subtract each digit from 9, except the last digit which you subtract from 10. That's it!",
          },
          {
            type: "worked_example",
            problem: "1000 - 357",
            steps: [
              { label: "First digit from 9", value: "9 - 3 = 6" },
              { label: "Second digit from 9", value: "9 - 5 = 4" },
              { label: "Last digit from 10", value: "10 - 7 = 3" },
              { label: "Answer", value: "643" },
            ],
            answer: "643",
            animation: "complement",
          },
          {
            type: "try_it",
            problem: "10000 - 2847 = ?",
            answer: "7153",
            hint: "9-2=7, 9-8=1, 9-4=5, 10-7=3",
          },
          {
            type: "tip",
            text: "This trick is perfect for making change! If something costs £6.43 and you pay with £10, the change is: All from 9, Last from 10 on 643 = 357. So £3.57!",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Left-to-Right Addition",
      slug: "left-to-right-addition",
      duration: 8,
      order: 2,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Why add right-to-left when your brain reads left-to-right? Let's flip it!",
            sparkyMood: "thinking",
          },
          {
            type: "concept",
            title: "Left-to-Right Addition",
            text: "Instead of starting with the ones column, start with the hundreds. Add the biggest place values first, then adjust. This is how mental maths champions work!",
          },
          {
            type: "worked_example",
            problem: "456 + 378",
            steps: [
              { label: "Add hundreds", value: "400 + 300 = 700" },
              { label: "Add tens", value: "50 + 70 = 120" },
              { label: "Add ones", value: "6 + 8 = 14" },
              { label: "Combine all", value: "700 + 120 + 14 = 834" },
            ],
            answer: "834",
            animation: "left-to-right",
          },
          {
            type: "try_it",
            problem: "567 + 289 = ?",
            answer: "856",
            hint: "500+200=700, 60+80=140, 7+9=16. Total: 700+140+16=856",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Digit Sum Check — Vedic Verification",
      slug: "digit-sum-check",
      duration: 8,
      order: 3,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Made a calculation? Here's how to CHECK your answer in seconds using digit sums!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "Casting Out 9s",
            text: "Add up all the digits of a number until you get a single digit (ignore 9s). Do this for both sides of a multiplication. If the digit sums match, your answer is very likely correct!",
          },
          {
            type: "worked_example",
            problem: "Verify: 23 × 17 = 391",
            steps: [
              { label: "Digit sum of 23", value: "2 + 3 = 5" },
              { label: "Digit sum of 17", value: "1 + 7 = 8" },
              {
                label: "Multiply digit sums",
                value: "5 × 8 = 40 → 4 + 0 = 4",
              },
              {
                label: "Digit sum of 391",
                value: "3 + 9 + 1 = 13 → 1 + 3 = 4",
              },
              { label: "Compare", value: "4 = 4 ✓ Correct!" },
            ],
            answer: "Verified!",
            animation: "check",
          },
          {
            type: "try_it",
            problem: "Verify: 34 × 12 = 408",
            answer: "Verified",
            hint: "34→7, 12→3, 7×3=21→3. 408→12→3. Match!",
          },
        ],
      },
    },
  });

  // Quiz for Module 3
  const quiz3 = await prisma.quiz.create({
    data: {
      moduleId: module3.id,
      title: "Addition & Subtraction Shortcuts Quiz",
    },
  });

  const module3Questions = [
    {
      text: "What is 1000 - 456?",
      options: ["544", "554", "534", "564"],
      correctAnswer: "544",
      explanation:
        "All from 9, last from 10: 9-4=5, 9-5=4, 10-6=4. Answer: 544",
      order: 1,
    },
    {
      text: "What is 10000 - 3678?",
      options: ["6322", "6332", "6312", "6342"],
      correctAnswer: "6322",
      explanation: "9-3=6, 9-6=3, 9-7=2, 10-8=2. Answer: 6322",
      order: 2,
    },
    {
      text: "What is 1000 - 123?",
      options: ["877", "887", "867", "897"],
      correctAnswer: "877",
      explanation: "9-1=8, 9-2=7, 10-3=7. Answer: 877",
      order: 3,
    },
    {
      text: "Using left-to-right addition, what is 345 + 267?",
      options: ["612", "602", "622", "592"],
      correctAnswer: "612",
      explanation: "300+200=500, 40+60=100, 5+7=12. Total: 612",
      order: 4,
    },
    {
      text: "What is 789 + 456?",
      options: ["1245", "1235", "1255", "1225"],
      correctAnswer: "1245",
      explanation: "700+400=1100, 80+50=130, 9+6=15. Total: 1245",
      order: 5,
    },
    {
      text: "Using left-to-right addition, what is 654 + 198?",
      options: ["852", "842", "862", "832"],
      correctAnswer: "852",
      explanation: "600+100=700, 50+90=140, 4+8=12. Total: 852",
      order: 6,
    },
    {
      text: "What is the digit sum of 567?",
      options: ["9", "18", "0", "6"],
      correctAnswer: "9",
      explanation: "5+6+7=18, 1+8=9",
      order: 7,
    },
    {
      text: "Using digit sums, is 24 × 13 = 312 correct?",
      options: ["Yes", "No", "Cannot determine", "Need more info"],
      correctAnswer: "Yes",
      explanation:
        "24→6, 13→4, 6×4=24→6. 312→6. Match! The answer is correct.",
      order: 8,
    },
    {
      text: "What is 10000 - 5555?",
      options: ["4445", "4455", "4545", "4544"],
      correctAnswer: "4445",
      explanation: "9-5=4, 9-5=4, 9-5=4, 10-5=5. Answer: 4445",
      order: 9,
    },
    {
      text: "What is 234 + 567 + 189?",
      options: ["990", "980", "1000", "970"],
      correctAnswer: "990",
      explanation:
        "Left-to-right: 200+500+100=800, 30+60+80=170, 4+7+9=20. Total: 990",
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

  console.log(
    "✅ Module 3: Addition & Subtraction Shortcuts — 3 lessons, 1 quiz (10 questions)"
  );

  // ── Module 4: Division Demystified ──────────────────────────────

  const module4 = await prisma.module.create({
    data: {
      courseId: vedicMaths.id,
      title: "Division Demystified",
      description: "Divide with confidence using Vedic shortcuts",
      order: 4,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: "Divide by 9",
      slug: "divide-by-9",
      duration: 10,
      order: 1,
      starsReward: 10,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Dividing by 9 has a magical pattern that makes it almost effortless!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Cascading Remainder Method",
            text: "When dividing by 9, each digit becomes part of the answer, and the remainder cascades to the next step. The first digit of the dividend goes straight into the answer!",
          },
          {
            type: "worked_example",
            problem: "12 ÷ 9",
            steps: [
              { label: "First digit", value: "1 goes to answer" },
              {
                label: "Add remainder to next",
                value: "1 + 2 = 3 (remainder)",
              },
              { label: "Answer", value: "1 remainder 3 (or 1.333...)" },
            ],
            answer: "1 r3",
            animation: "division",
          },
          {
            type: "worked_example",
            problem: "1234 ÷ 9",
            steps: [
              { label: "First digit", value: "1 → answer starts with 1" },
              {
                label: "1 + 2 = 3",
                value: "Next answer digit is 3",
              },
              {
                label: "3 + 3 = 6",
                value: "Next answer digit is 6",
              },
              {
                label: "6 + 4 = 10",
                value: "Remainder is 10 → carry 1 back",
              },
              { label: "Final answer", value: "137 remainder 1" },
            ],
            answer: "137 r1",
            animation: "cascade",
          },
          {
            type: "try_it",
            problem: "2031 ÷ 9 = ?",
            answer: "225 r6",
            hint: "2, 2+0=2, 2+3=5, 5+1=6(remainder). Answer: 225 r6",
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: "Recurring Decimals Pattern",
      slug: "recurring-decimals",
      duration: 8,
      order: 2,
      starsReward: 8,
      content: {
        blocks: [
          {
            type: "intro",
            text: "Some divisions create beautiful repeating patterns. Let's discover the magic of 1/7!",
            sparkyMood: "excited",
          },
          {
            type: "concept",
            title: "The Cyclic Pattern of 1/7",
            text: "1/7 = 0.142857142857... The digits 142857 repeat forever! What's magical is that ALL fractions with 7 as the denominator use the SAME six digits, just starting at different points in the cycle.",
          },
          {
            type: "worked_example",
            problem: "Fractions of 7",
            steps: [
              { label: "1/7", value: "0.142857..." },
              { label: "2/7", value: "0.285714..." },
              { label: "3/7", value: "0.428571..." },
              { label: "4/7", value: "0.571428..." },
              { label: "5/7", value: "0.714285..." },
              { label: "6/7", value: "0.857142..." },
            ],
            answer: "All use 142857!",
            animation: "cyclic",
          },
          {
            type: "try_it",
            problem:
              "If 1/7 = 0.142857..., what is 3/7? (Start from the 3rd position in the cycle)",
            answer: "0.428571...",
            hint: "The cycle is 142857. Starting from the 3rd digit (4): 428571",
          },
          {
            type: "tip",
            text: "142857 is called a 'cyclic number'. Multiply it by 1 through 6 and you get the same digits rearranged: 142857 × 2 = 285714!",
          },
        ],
      },
    },
  });

  // Quiz for Module 4
  const quiz4 = await prisma.quiz.create({
    data: {
      moduleId: module4.id,
      title: "Division Demystified Quiz",
    },
  });

  const module4Questions = [
    {
      text: "What is 18 ÷ 9?",
      options: ["2", "1 r9", "3", "1 r8"],
      correctAnswer: "2",
      explanation: "18 ÷ 9 = 2 exactly. First digit 1, then 1+8=9, carry 1. Answer: 2 r0 = 2",
      order: 1,
    },
    {
      text: "What is 23 ÷ 9?",
      options: ["2 r5", "3 r2", "2 r3", "3 r5"],
      correctAnswer: "2 r5",
      explanation: "First digit 2 goes to answer. 2+3=5 is the remainder. Answer: 2 r5",
      order: 2,
    },
    {
      text: "What is the repeating pattern in 1/7?",
      options: ["142857", "123456", "142587", "148257"],
      correctAnswer: "142857",
      explanation: "1/7 = 0.142857142857... The cyclic number is 142857",
      order: 3,
    },
    {
      text: "What is 2/7 as a repeating decimal?",
      options: ["0.285714...", "0.142857...", "0.428571...", "0.571428..."],
      correctAnswer: "0.285714...",
      explanation: "2/7 starts at 2 in the cycle 142857, giving 285714...",
      order: 4,
    },
    {
      text: "Using the cascading method, what is 111 ÷ 9?",
      options: ["12 r3", "11 r2", "13 r2", "12 r2"],
      correctAnswer: "12 r3",
      explanation: "1→answer, 1+1=2→answer, 2+1=3→remainder. Answer: 12 r3",
      order: 5,
    },
    {
      text: "What is 142857 × 2?",
      options: ["285714", "284714", "295714", "285724"],
      correctAnswer: "285714",
      explanation: "142857 is a cyclic number; multiplying by 2 gives the same digits rotated: 285714",
      order: 6,
    },
    {
      text: "What is 45 ÷ 9?",
      options: ["5", "4 r9", "6", "4 r5"],
      correctAnswer: "5",
      explanation: "45 ÷ 9 = 5. First digit 4, then 4+5=9, carry 1. Answer: 5 r0 = 5",
      order: 7,
    },
    {
      text: "What is 5/7 as a repeating decimal?",
      options: ["0.714285...", "0.571428...", "0.857142...", "0.428571..."],
      correctAnswer: "0.714285...",
      explanation: "5/7 starts at 5 in the cycle 142857, giving 714285...",
      order: 8,
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

  console.log(
    "✅ Module 4: Division Demystified — 2 lessons, 1 quiz (8 questions)"
  );

  // ─── Course 2: Abacus (inactive) ───────────────────────────────

  await prisma.course.upsert({
    where: { slug: "abacus" },
    update: {},
    create: {
      title: "Abacus",
      slug: "abacus",
      description: "Master the ancient counting tool",
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
      description: "Hands-on science experiments and projects",
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
      description: "Complete all Vedic Maths lessons!",
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
  console.log("   📚 1 active course (Vedic Maths) with 4 modules");
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
