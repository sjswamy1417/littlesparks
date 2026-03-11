# LittleSparks — Claude Code Project Instructions

> **How to use this file:** Place `CLAUDE.md` in your project root folder, open
> Claude Code in that folder, and say: **"Build the LittleSparks project as
> described in CLAUDE.md"**

---

## Project Overview

Build a production-grade, cloud-containerized full-stack learning platform called
**LittleSparks** — a fun, engaging educational platform targeting school kids
(ages 6–14) to learn Vedic Maths, with future expansion planned for Abacus and
STEM courses. The app must be deployable on any cloud container platform (AWS ECS,
GCP Cloud Run, Azure Container Apps, Railway, Render, Fly.io) using Docker +
Docker Compose.

---

## Tech Stack

### Frontend
- Next.js 14 (App Router, Server Components, streaming)
- TypeScript (strict mode)
- Tailwind CSS v3 + shadcn/ui component library
- Framer Motion for animations
- Zustand for client state
- TanStack Query v5 for server state + caching
- next-auth v5 for authentication
- React Hook Form + Zod for forms/validation
- canvas-confetti for celebration animations

### Backend
- Next.js API Routes (co-located in same app — monorepo)
- Prisma ORM v5 with PostgreSQL
- Redis (via ioredis) for session caching, rate limiting, leaderboard
- BullMQ for background jobs (streak updates, badge checks, email)
- Resend for transactional email (welcome, progress reports)
- Zod for API input validation

### Database & Storage
- PostgreSQL 16 (primary database)
- Redis 7 (caching + queues)
- Cloudflare R2 / AWS S3 compatible for avatar/asset uploads
  (via @aws-sdk/client-s3 with presigned URLs)

### Infrastructure
- Docker + Docker Compose (multi-service local dev + prod)
- Multi-stage Dockerfiles (builder → runner) for minimal image size
- Nginx as reverse proxy + static asset server
- Health check endpoints on all services
- Environment-based config via .env files

### Monitoring & Observability
- Pino logger with structured JSON logs
- OpenTelemetry setup (ready but not blocking MVP)
- `/api/health` and `/api/ready` endpoints

### Testing (scaffold only for MVP)
- Vitest + React Testing Library setup
- Playwright config for E2E (scaffold only)

---

## Brand & Design

- **Name:** LittleSparks
- **Tagline:** "Where Little Minds Ignite Big Ideas"
- **Mascot:** Sparky — a glowing animated star (built as SVG component)

### Design Language — "Playful Precision"
- NOT generic children's pastel. Think: Duolingo meets Linear.
- Bold typography meets soft rounded shapes
- Dark mode first with electric accents

### Color Palette
| Token | Value |
|-------|-------|
| Background | `#0F0E17` (deep navy) |
| Surface (cards) | `#1A1A2E` |
| Surface (sidebar) | `#16213E` |
| Primary | `#FF6B35` (electric orange) |
| Secondary | `#7B2FBE` (vivid purple) |
| Accent | `#C8F135` (neon yellow-green) |
| Text primary | `#FFFBF2` |
| Text muted | `#A0A0B2` |

### Typography
- **Display:** "Baloo 2" (Google Fonts) — rounded, energetic, child-friendly
- **Body:** "DM Sans" — clean, modern, highly legible
- **Mono:** "JetBrains Mono" — for numbers/math display

### UI Personality
- Micro-animations on every interaction (hover lifts, tap bounces)
- Spring physics on card enters (Framer Motion spring)
- Subtle particle/star background on hero (CSS only)
- Progress bars that fill with satisfying ease-out
- Numbers animate/count up when stats load
- Correct answer = green pulse + star burst
- Wrong answer = gentle shake (no harsh red)

---

## Project Structure

```
littlesparks/
├── app/
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Landing page
│   │   ├── about/page.tsx
│   │   └── layout.tsx
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                    # Protected app
│   │   ├── dashboard/page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── lesson/[id]/page.tsx
│   │   ├── quiz/[moduleId]/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   └── layout.tsx            # App shell with sidebar
│   ├── parent/
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── courses/route.ts
│       ├── courses/[slug]/route.ts
│       ├── lessons/[id]/route.ts
│       ├── progress/route.ts
│       ├── quiz/[moduleId]/route.ts
│       ├── leaderboard/route.ts
│       ├── upload/presign/route.ts
│       ├── health/route.ts
│       └── ready/route.ts
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── sparky/
│   │   ├── Sparky.tsx            # Animated SVG mascot
│   │   └── SparkyMessage.tsx     # Contextual encouragement bubbles
│   ├── gamification/
│   │   ├── StarCounter.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── XPBar.tsx
│   │   ├── ConfettiBlast.tsx
│   │   ├── BadgeCard.tsx
│   │   └── Leaderboard.tsx
│   ├── course/
│   │   ├── CourseCard.tsx
│   │   ├── LessonSidebar.tsx
│   │   ├── LessonContent.tsx
│   │   ├── MathExample.tsx
│   │   └── QuizQuestion.tsx
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── MobileNav.tsx
│   └── shared/
│       ├── Avatar.tsx
│       ├── ProgressRing.tsx
│       └── AnimatedNumber.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── redis.ts
│   ├── queue.ts
│   ├── email.ts
│   └── validators/
├── hooks/
│   ├── useProgress.ts
│   ├── useQuiz.ts
│   └── useLeaderboard.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── workers/
│   ├── streak.worker.ts
│   ├── badge.worker.ts
│   └── email.worker.ts
├── nginx/
│   ├── nginx.conf
│   └── Dockerfile
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .dockerignore
└── README.md
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role     @default(CHILD)
  name          String
  avatarId      Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  childProfile  Child?
  parentProfile Parent?
  @@map("users")
}

enum Role { CHILD PARENT ADMIN }

model Child {
  id           String    @id @default(cuid())
  userId       String    @unique
  user         User      @relation(fields: [userId], references: [id])
  age          Int
  stars        Int       @default(0)
  xp           Int       @default(0)
  streak       Int       @default(0)
  lastActiveAt DateTime  @default(now())
  parentId     String?
  parent       Parent?   @relation(fields: [parentId], references: [id])
  progress     Progress[]
  quizResults  QuizResult[]
  badges       ChildBadge[]
  @@map("children")
}

model Parent {
  id       String  @id @default(cuid())
  userId   String  @unique
  user     User    @relation(fields: [userId], references: [id])
  children Child[]
  @@map("parents")
}

model Course {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String
  thumbnail   String?
  isActive    Boolean  @default(false)
  order       Int
  color       String   @default("#FF6B35")
  icon        String   @default("⭐")
  modules     Module[]
  @@map("courses")
}

model Module {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  title       String
  description String
  order       Int
  lessons     Lesson[]
  quizzes     Quiz[]
  @@map("modules")
}

model Lesson {
  id          String     @id @default(cuid())
  moduleId    String
  module      Module     @relation(fields: [moduleId], references: [id])
  title       String
  slug        String
  content     Json
  duration    Int
  order       Int
  starsReward Int        @default(5)
  progress    Progress[]
  @@map("lessons")
}

model Progress {
  id          String    @id @default(cuid())
  childId     String
  child       Child     @relation(fields: [childId], references: [id])
  lessonId    String
  lesson      Lesson    @relation(fields: [lessonId], references: [id])
  completed   Boolean   @default(false)
  completedAt DateTime?
  starsEarned Int       @default(0)
  @@unique([childId, lessonId])
  @@map("progress")
}

model Quiz {
  id        String       @id @default(cuid())
  moduleId  String
  module    Module       @relation(fields: [moduleId], references: [id])
  title     String
  questions Question[]
  results   QuizResult[]
  @@map("quizzes")
}

model Question {
  id            String       @id @default(cuid())
  quizId        String
  quiz          Quiz         @relation(fields: [quizId], references: [id])
  text          String
  type          QuestionType @default(MULTIPLE_CHOICE)
  options       Json
  correctAnswer String
  explanation   String
  order         Int
  @@map("questions")
}

enum QuestionType { MULTIPLE_CHOICE FILL_IN_BLANK TRUE_FALSE }

model QuizResult {
  id             String   @id @default(cuid())
  childId        String
  child          Child    @relation(fields: [childId], references: [id])
  quizId         String
  quiz           Quiz     @relation(fields: [quizId], references: [id])
  score          Int
  totalQuestions Int
  starsEarned    Int
  timeTaken      Int
  completedAt    DateTime @default(now())
  @@map("quiz_results")
}

model Badge {
  id          String      @id @default(cuid())
  name        String
  description String
  icon        String
  condition   Json
  rarity      BadgeRarity @default(COMMON)
  children    ChildBadge[]
  @@map("badges")
}

enum BadgeRarity { COMMON RARE EPIC LEGENDARY }

model ChildBadge {
  id       String   @id @default(cuid())
  childId  String
  child    Child    @relation(fields: [childId], references: [id])
  badgeId  String
  badge    Badge    @relation(fields: [badgeId], references: [id])
  earnedAt DateTime @default(now())
  @@unique([childId, badgeId])
  @@map("child_badges")
}
```

---

## Docker Setup

### docker/Dockerfile — Multi-stage Next.js

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### docker-compose.yml — Full Local Stack

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/littlesparks
      REDIS_URL: redis://redis:6379
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/littlesparks
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: littlesparks
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "6379:6379"

  nginx:
    build:
      context: ./nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | `{ status: "ok", timestamp }` |
| GET | `/api/ready` | Checks DB + Redis connectivity |
| POST | `/api/auth/register` | Create user + child/parent profile |
| POST | `/api/auth/[...nextauth]` | next-auth handler |
| GET | `/api/courses` | All courses with progress |
| GET | `/api/courses/[slug]` | Course detail + modules + lessons |
| GET | `/api/lessons/[id]` | Lesson content |
| POST | `/api/lessons/[id]/complete` | Mark complete, award stars |
| GET | `/api/quiz/[moduleId]` | Quiz questions (shuffled) |
| POST | `/api/quiz/[moduleId]` | Submit answers, get score + stars |
| GET | `/api/progress` | Full progress for current child |
| GET | `/api/leaderboard` | Top 10 by stars (weekly / all-time) |
| GET | `/api/profile` | Current user profile |
| PATCH | `/api/profile` | Update name, avatarId |
| GET | `/api/parent/children` | List children with stats |
| GET | `/api/parent/children/[id]/activity` | Activity log |

---

## Lesson Content Format

Store lessons as structured JSON content blocks:

```json
{
  "blocks": [
    {
      "type": "intro",
      "text": "Welcome to the magic of multiplying by 11!",
      "sparkyMood": "excited"
    },
    {
      "type": "concept",
      "title": "The Sandwich Method",
      "text": "To multiply any 2-digit number by 11, just add the two digits and place the sum in the middle!"
    },
    {
      "type": "worked_example",
      "problem": "23 × 11",
      "steps": [
        { "label": "Take the digits", "value": "2 and 3" },
        { "label": "Add them", "value": "2 + 3 = 5" },
        { "label": "Place 5 in the middle", "value": "2 _ 3 → 253" }
      ],
      "answer": "253",
      "animation": "sandwich"
    },
    {
      "type": "try_it",
      "problem": "45 × 11 = ?",
      "answer": "495",
      "hint": "Add 4 + 5 and place it in the middle"
    },
    {
      "type": "tip",
      "text": "What if the middle sum is 10 or more? Carry the 1!",
      "example": "75 × 11 → 7+5=12 → 7(12)5 → carry → 825"
    }
  ]
}
```

---

## Seed Data

### Courses

**COURSE: Vedic Maths** (`slug: "vedic-maths"`, `isActive: true`)

- **Module 1: "What is Vedic Maths?"** (order: 1)
  - Lesson 1: History & Fun Facts (5 min)
  - Lesson 2: How is it different from regular maths? (5 min)

- **Module 2: "Multiplication Superpowers"** (order: 2)
  - Lesson 1: Multiply any number by 11 — The Sandwich Method (10 min)
  - Lesson 2: Multiply numbers close to 100 — The Base Method (10 min)
  - Lesson 3: Squaring numbers ending in 5 (8 min)
  - Lesson 4: Multiply by 5, 25, 50 instantly (8 min)
  - Quiz: 10 questions covering all 4 lessons

- **Module 3: "Addition & Subtraction Shortcuts"** (order: 3)
  - Lesson 1: All from 9, last from 10 — Complement subtraction (10 min)
  - Lesson 2: Left-to-right addition for speed (8 min)
  - Lesson 3: Digit sum check — Vedic verification (8 min)
  - Quiz: 10 questions

- **Module 4: "Division Demystified"** (order: 4)
  - Lesson 1: Divide any number by 9 (10 min)
  - Lesson 2: Recurring decimals pattern (8 min)
  - Quiz: 8 questions

**COURSE: Abacus** (`slug: "abacus"`, `isActive: false`) — Coming Soon

**COURSE: STEM Lab** (`slug: "stem-lab"`, `isActive: false`) — Coming Soon

### Badges

| Badge | Rarity | Condition |
|-------|--------|-----------|
| First Spark | COMMON | Complete first lesson |
| Quiz Whiz | RARE | Score 100% on any quiz |
| 7-Day Flame | RARE | 7-day learning streak |
| Speed Solver | EPIC | Complete a quiz in under 60 seconds |
| Vedic Master | LEGENDARY | Complete all Vedic Maths modules |
| Perfect Week | EPIC | Learn every day for 7 days |
| Star Collector | RARE | Earn 100 total stars |

### Test Accounts

- **Parent:** `parent@littlesparks.dev` / `Test1234!`
- **Child:** `spark@littlesparks.dev` / `Test1234!` (age: 10, linked to parent)

---

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LittleSparks

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/littlesparks

# Redis
REDIS_URL=redis://localhost:6379

# Email (Resend)
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=hello@littlesparks.dev

# Storage (S3-compatible)
S3_BUCKET=littlesparks-assets
S3_REGION=auto
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
S3_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com

# Feature Flags
NEXT_PUBLIC_ENABLE_LEADERBOARD=true
NEXT_PUBLIC_ENABLE_PARENT_PORTAL=true
```

---

## Cloud Deployment Configs

### fly.toml (Fly.io)
```toml
app = "littlesparks"
primary_region = "sin"

[build]
  dockerfile = "docker/Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 1024
```

### railway.json (Railway)
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### render.yaml (Render)
```yaml
services:
  - type: web
    name: littlesparks
    env: docker
    dockerfilePath: ./docker/Dockerfile
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
```

---

## Nginx Config Requirements

`nginx/nginx.conf` must include:
- Reverse proxy to Next.js on port 3000
- Gzip compression enabled
- Cache `_next/static` assets with 1-year max-age
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Rate limiting: 100 req/min per IP on `/api` routes
- WebSocket upgrade support

---

## Next.js Config Requirements

`next.config.ts` must include:
- `output: "standalone"` (required for Docker)
- Image optimization with remote pattern allowlist
- Bundle analyzer integration (`ANALYZE=true`)
- Strict Content Security Policy headers
- Compression enabled

---

## GitHub Actions CI/CD

Create `.github/workflows/deploy.yml` with:
1. Lint check
2. Type check
3. Unit tests (Vitest)
4. Build Docker image
5. Push to GitHub Container Registry (GHCR)
6. Deploy to target platform (parameterized via `workflow_dispatch`)
7. Manual deploy trigger support

---

## UI Components to Build

| Component | Description |
|-----------|-------------|
| `Sparky` | Animated SVG mascot with mood states (excited, proud, thinking, celebrating) |
| `SparkyMessage` | Contextual speech bubble with encouragement text |
| `StarCounter` | Animated star count that increments with spring animation |
| `ProgressRing` | SVG circular progress indicator |
| `XPBar` | XP progress bar with level-up animation |
| `ConfettiBlast` | Full-screen confetti burst on quiz completion |
| `BadgeCard` | Badge display with rarity glow effect |
| `Leaderboard` | Top 10 list with rank animations |
| `CourseCard` | Card with lock/unlock state, progress, hover lift |
| `LessonContent` | Rich content block renderer (intro/concept/worked_example/try_it/tip) |
| `MathExample` | Animated step-by-step math worked example |
| `QuizQuestion` | Question card with options that flash green/red on answer |
| `AvatarPicker` | Grid of 8 animal avatars with selection animation |
| `AnimatedNumber` | Count-up animation for stats |
| `StreakBadge` | Fire emoji streak counter that pulses |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, course preview, how it works, testimonials |
| `/login` | Login with animated welcome back |
| `/register` | Kid-friendly registration (name, age, parent email, password) |
| `/dashboard` | Welcome banner, progress summary, course cards, leaderboard preview |
| `/courses` | Course catalog with active/coming-soon states |
| `/courses/[slug]` | Course page with module list and progress |
| `/courses/[slug]/lesson/[id]` | Lesson page with sidebar, content renderer, navigation |
| `/quiz/[moduleId]` | Quiz with timer, feedback, confetti on completion |
| `/profile` | Avatar picker, stats, badge collection |
| `/leaderboard` | Full leaderboard (weekly + all-time) |
| `/parent/dashboard` | Child progress, time spent chart, activity log |

---

## Build Order

Build in this exact sequence:

### Step 1 — Foundation
- `next.config.ts` with standalone output
- Tailwind config with LittleSparks theme tokens
- Prisma schema + initial migration
- Docker Compose with all services
- `.env.example`, `lib/prisma.ts`, `lib/redis.ts`, `lib/auth.ts`

### Step 2 — Backend API
- `/api/health` and `/api/ready`
- next-auth with credentials provider
- `/api/auth/register`
- Course, lesson, quiz, progress API routes
- Leaderboard API using Redis sorted sets

### Step 3 — Core UI Components
- Tailwind theme tokens
- Sparky mascot SVG with mood states
- StarCounter, ProgressRing, ConfettiBlast, BadgeCard
- AnimatedNumber, StreakBadge, XPBar
- AppSidebar, TopNav, MobileNav

### Step 4 — Pages
- Landing page with animated hero
- Login + Register pages
- Dashboard
- Course catalog
- Vedic Maths course + lesson pages
- Quiz page with timer + celebration
- Profile with avatar picker
- Parent portal

### Step 5 — Gamification Logic
- Stars + XP award system
- Streak tracking via Redis + cron
- Badge checking after lesson/quiz completion
- Weekly leaderboard reset job (BullMQ)

### Step 6 — Seed Data
- All Vedic Maths content with real lesson JSON blocks
- Test accounts
- All 7 badges

### Step 7 — Deployment Files
- Multi-stage Dockerfile
- `docker-compose.yml` + `docker-compose.prod.yml`
- `fly.toml`, `railway.json`, `render.yaml`
- GitHub Actions CI/CD workflow
- Full README with setup + deploy guide

---

## README Requirements

The `README.md` must include:
- LittleSparks ASCII art banner
- Tech stack badges (shields.io)
- Quick start in 3 commands: clone → `docker-compose up` → open browser
- Architecture diagram (Mermaid)
- Environment variable reference table
- Deployment guide for Fly.io, Railway, Render, AWS ECS
- How to add a new course (step-by-step)
- API reference table
- Contributing guide

---

## GCP Cloud Run Deployment (Production)

The app is deployed to GCP Cloud Run as a multi-container service.

### Live URL
`https://littlesparks-109887005910.asia-south1.run.app`

### Architecture
```
User -> Cloud Run (1 service, 3 containers sharing localhost)
          |-- app       (Next.js, port 3000, ingress)
          |-- redis     (Redis 7, port 6379, sidecar)
          |-- worker    (BullMQ, sidecar)
               |
               +-- Cloud SQL PostgreSQL (db-f1-micro, public IP)
```

### GCP Resources
| Resource | Name/Details |
|----------|-------------|
| Project ID | `project-0ddfb2d3-8c78-4896-9a8` |
| Region | `asia-south1` |
| Cloud SQL | `littlesparks-db` (db-f1-micro, POSTGRES_16, Enterprise) |
| Artifact Registry | `asia-south1-docker.pkg.dev/project-0ddfb2d3-8c78-4896-9a8/littlesparks` |
| Service Account | `littlesparks-sa@project-0ddfb2d3-8c78-4896-9a8.iam.gserviceaccount.com` |
| Harness WIF Pool | `harness-pool` / `harness-provider` (for future CI/CD) |
| Harness SA | `harness-deployer@project-0ddfb2d3-8c78-4896-9a8.iam.gserviceaccount.com` |

### Secrets (GCP Secret Manager)
- `littlesparks-database-url` — PostgreSQL connection via Cloud SQL Unix socket
- `littlesparks-nextauth-secret` — JWT signing key
- `littlesparks-nextauth-url` — `https://littlesparks-109887005910.asia-south1.run.app`
- `littlesparks-resend-api-key` — Resend API key (placeholder)

### GCP Deployment Scripts
| Script | Purpose |
|--------|---------|
| `gcp/setup.sh` / `gcp/setup.ps1` | One-time infra provisioning (APIs, Cloud SQL, Artifact Registry, IAM, Secrets) |
| `gcp/deploy.sh` / `gcp/deploy.ps1` | Build via Cloud Build + deploy to Cloud Run |
| `gcp/seed.sh` / `gcp/seed.ps1` | Seed database via Cloud Run Job |
| `gcp/service.yaml` | Cloud Run multi-container service definition |
| `gcp/cloudbuild-app.yaml` | Cloud Build config for app image |
| `gcp/cloudbuild-worker.yaml` | Cloud Build config for worker image |

### Deploy from Local
```bash
export GCP_PROJECT_ID="project-0ddfb2d3-8c78-4896-9a8"
bash gcp/deploy.sh
```
Or PowerShell:
```powershell
$env:GCP_PROJECT_ID = "project-0ddfb2d3-8c78-4896-9a8"
.\gcp\deploy.ps1
```

### Important Notes
- Docker is NOT required locally — builds happen remotely via Cloud Build
- Alpine images MUST include `openssl` package for Prisma engine compatibility
- Use `prisma db push` for initial schema creation (not `migrate deploy`) to avoid connection timeouts
- Worker image must be used for migration/seed jobs (has full node_modules)
- Middleware checks `req.auth?.user` (not `req.auth`) to avoid false login detection in next-auth v5 beta

### Known Issues (TODO)
- Login/registration forms not functional — API routes need debugging
- Need to verify all API routes work with Cloud SQL connection
- RESEND_API_KEY is a placeholder — update when ready

### GitHub Repository
`https://github.com/sjswamy1417/littlesparks`

---

## Architecture Decision Record

> **Stack:** Next.js 14 Full-Stack Monorepo
> **Decided:** March 2026
>
> Chosen because: single codebase, single deployment, single language, fastest
> path to a live MVP. Server Components eliminate API roundtrips. Prisma +
> PostgreSQL handles all current data needs cleanly.
>
> **When to revisit:** If adaptive learning recommendations or NLP-based answer
> analysis is needed → extract a Python FastAPI microservice at that point.
> If live multiplayer quiz rooms are needed → evaluate Go for that service.
> The clean `lib/` service boundaries make this extraction straightforward.

---

*LittleSparks — Where Little Minds Ignite Big Ideas ⭐*