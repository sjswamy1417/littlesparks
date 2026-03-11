```
 _      _ _   _   _      ____                   _
| |    (_) | | | | |    / ___| _ __   __ _ _ __| | _____
| |    | | |_| |_| |   \___ \| '_ \ / _` | '__| |/ / __|
| |___ | |  _|  _| |___ ___) | |_) | (_| | |  |   <\__ \
|_____|_|_| |_| |_____|____/| .__/ \__,_|_|  |_|\_\___/
                             |_|
    Where Little Minds Ignite Big Ideas
```

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![GCP Cloud Run](https://img.shields.io/badge/Cloud%20Run-Deployed-4285F4?style=flat-square&logo=google-cloud)](https://cloud.google.com/run)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

**LittleSparks** is a fun, engaging learning platform for kids ages 6-14, starting with **Vedic Maths**. Built with modern tech, gamification, and a playful-yet-polished design language.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/sjswamy1417/littlesparks.git && cd littlesparks

# 2. Start everything with Docker
docker-compose -f docker/docker-compose.yml up -d

# 3. Open browser
open http://localhost:3000
```

**Test accounts (after seeding):**
- Parent: `parent@littlesparks.dev` / `Test1234!`
- Child: `spark@littlesparks.dev` / `Test1234!`

---

## Local Development (without Docker)

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start PostgreSQL and Redis (or use Docker for just those)
docker-compose -f docker/docker-compose.yml up postgres redis -d

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start dev server
npm run dev
```

---

## Architecture

### GCP Cloud Run (Production)

```mermaid
graph TB
    subgraph Client
        Browser[Browser / Mobile]
    end

    subgraph "GCP Cloud Run — Single Service"
        subgraph "Ingress Container"
            APP[Next.js App :3000]
            SSR[Server Components]
            API[API Routes]
            AUTH[NextAuth.js]
        end
        subgraph "Sidecar Containers"
            RD[(Redis 7 :6379)]
            WK[BullMQ Worker]
        end
    end

    subgraph "GCP Managed Services"
        CSQL[(Cloud SQL PostgreSQL 16)]
        SM[Secret Manager]
        AR[Artifact Registry]
    end

    subgraph "External Services"
        RS[Resend Email]
    end

    Browser --> APP
    APP --> SSR
    APP --> API
    API --> AUTH
    API --> CSQL
    API --> RD
    API --> WK
    WK --> CSQL
    WK --> RD
    WK --> RS
    SM -.-> APP
    AR -.-> APP
```

### Local Development (Docker Compose)

```mermaid
graph TB
    subgraph Client
        Browser[Browser / Mobile]
    end

    subgraph "Nginx Reverse Proxy"
        NG[Nginx :80/:443]
    end

    subgraph "Next.js App"
        SSR[Server Components]
        API[API Routes]
        AUTH[NextAuth.js]
    end

    subgraph "Background Workers"
        BQ[BullMQ Workers]
        SW[Streak Worker]
        BW[Badge Worker]
        EW[Email Worker]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 16)]
        RD[(Redis 7)]
        S3[(S3 / R2 Storage)]
    end

    subgraph "External Services"
        RS[Resend Email]
    end

    Browser --> NG
    NG --> SSR
    NG --> API
    API --> AUTH
    API --> PG
    API --> RD
    API --> BQ
    BQ --> SW
    BQ --> BW
    BQ --> EW
    SW --> PG
    SW --> RD
    BW --> PG
    EW --> RS
    API --> S3
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| **State** | Zustand (client), TanStack Query v5 (server) |
| **Auth** | NextAuth v5 (Credentials provider) |
| **Database** | PostgreSQL 16 via Prisma ORM v5 |
| **Cache/Queue** | Redis 7 (ioredis), BullMQ |
| **Email** | Resend |
| **Storage** | S3-compatible (Cloudflare R2 / AWS S3) |
| **Infra** | Docker, Docker Compose, Nginx, GCP Cloud Run |
| **Testing** | Vitest, React Testing Library, Playwright |
| **CI/CD** | GitHub Actions |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `LittleSparks` |
| `NEXTAUTH_URL` | NextAuth callback URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWT signing secret | (generate one) |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:password@localhost:5432/littlesparks` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `RESEND_API_KEY` | Resend email API key | |
| `EMAIL_FROM` | Sender email address | `hello@littlesparks.dev` |
| `S3_BUCKET` | S3 bucket name | `littlesparks-assets` |
| `S3_REGION` | S3 region | `auto` |
| `S3_ACCESS_KEY_ID` | S3 access key | |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | |
| `S3_ENDPOINT` | S3 endpoint URL | |
| `NEXT_PUBLIC_ENABLE_LEADERBOARD` | Enable leaderboard feature | `true` |
| `NEXT_PUBLIC_ENABLE_PARENT_PORTAL` | Enable parent portal | `true` |
| `GCP_PROJECT_ID` | GCP project ID (for Cloud Run deploy) | |
| `GCP_REGION` | GCP region | `asia-south1` |

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/ready` | Readiness check (DB + Redis) |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler |
| `GET` | `/api/courses` | List all courses |
| `GET` | `/api/courses/[slug]` | Course detail with modules |
| `GET` | `/api/lessons/[id]` | Lesson content |
| `POST` | `/api/lessons/[id]/complete` | Complete a lesson |
| `GET` | `/api/quiz/[moduleId]` | Get quiz questions |
| `POST` | `/api/quiz/[moduleId]` | Submit quiz answers |
| `GET` | `/api/progress` | Child's full progress |
| `GET` | `/api/leaderboard` | Top 10 leaderboard |
| `GET` | `/api/profile` | User profile |
| `PATCH` | `/api/profile` | Update profile |
| `GET` | `/api/parent/children` | Parent's children |
| `GET` | `/api/parent/children/[id]/activity` | Child activity log |
| `POST` | `/api/upload/presign` | Get presigned upload URL |

---

## Deployment

### GCP Cloud Run (Production — Current)

Live at: `https://littlesparks-109887005910.asia-south1.run.app`

**Architecture:**
```
User -> Cloud Run (1 service, 3 containers sharing localhost)
          |-- app       (Next.js, port 3000, ingress)
          |-- redis     (Redis 7, port 6379, sidecar)
          |-- worker    (BullMQ, sidecar)
               |
               +-- Cloud SQL PostgreSQL (db-f1-micro, public IP)
```

**First-time setup:**
```bash
# 1. Set project ID
export GCP_PROJECT_ID="project-0ddfb2d3-8c78-4896-9a8"

# 2. Provision infrastructure (Cloud SQL, Artifact Registry, IAM, Secrets)
bash gcp/setup.sh

# 3. Build & deploy
bash gcp/deploy.sh

# 4. Seed database
bash gcp/seed.sh
```

**Subsequent deploys:**
```bash
export GCP_PROJECT_ID="project-0ddfb2d3-8c78-4896-9a8"
bash gcp/deploy.sh
```

**PowerShell (Windows):**
```powershell
$env:GCP_PROJECT_ID = "project-0ddfb2d3-8c78-4896-9a8"
.\gcp\deploy.ps1
```

**Key details:**
- Docker is NOT required locally — builds happen remotely via Cloud Build
- Images stored in Artifact Registry (`asia-south1-docker.pkg.dev`)
- Secrets managed via GCP Secret Manager
- Multi-container service defined in `gcp/service.yaml`
- See `gcp/` directory for all deployment scripts and configs

---

### Fly.io

```bash
fly auth login
fly launch --config fly.toml
fly secrets set DATABASE_URL="..." REDIS_URL="..." NEXTAUTH_SECRET="..."
fly deploy
```

### Railway

```bash
railway login
railway init
railway up
```

### Render

Push to GitHub and connect the repo in Render dashboard. It will auto-detect `render.yaml`.

### AWS ECS

```bash
# Build and push to ECR
docker build -f docker/Dockerfile -t littlesparks .
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag littlesparks:latest YOUR_ECR_URL/littlesparks:latest
docker push YOUR_ECR_URL/littlesparks:latest

# Deploy with ECS CLI or CloudFormation
```

---

## Adding a New Course

1. **Define the course** in `prisma/seed.ts`:
   ```typescript
   await prisma.course.create({
     data: {
       title: "My New Course",
       slug: "my-new-course",
       description: "Course description",
       isActive: true,
       order: 4,
       color: "#FF6B35",
       icon: "book",
     },
   });
   ```

2. **Add modules** with lessons following the content block format:
   ```typescript
   await prisma.module.create({
     data: {
       courseId: course.id,
       title: "Module 1",
       description: "Module description",
       order: 1,
       lessons: {
         create: [{
           title: "Lesson 1",
           slug: "lesson-1",
           duration: 10,
           order: 1,
           starsReward: 10,
           content: {
             blocks: [
               { type: "intro", text: "Welcome!", sparkyMood: "excited" },
               { type: "concept", title: "The Idea", text: "Explanation..." },
               { type: "worked_example", problem: "2 + 2", steps: [...], answer: "4" },
               { type: "try_it", problem: "3 + 3 = ?", answer: "6", hint: "..." },
               { type: "tip", text: "Remember...", example: "..." }
             ]
           }
         }]
       }
     }
   });
   ```

3. **Add quizzes** with questions for each module.

4. **Run the seed**: `npm run db:seed`

---

## Project Structure

```
littlesparks/
├── app/                    # Next.js 14 App Router
│   ├── (marketing)/        # Public pages (landing, about)
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (app)/              # Protected app (dashboard, courses, etc.)
│   ├── parent/             # Parent portal
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Base UI components (shadcn-style)
│   ├── sparky/             # Mascot components
│   ├── gamification/       # Stars, badges, leaderboard
│   ├── course/             # Course & lesson components
│   ├── layout/             # App shell (sidebar, nav)
│   └── shared/             # Reusable shared components
├── lib/                    # Server utilities (prisma, redis, auth)
├── hooks/                  # React hooks
├── prisma/                 # Schema, migrations, seed
├── workers/                # BullMQ background workers
├── nginx/                  # Nginx reverse proxy config
├── docker/                 # Docker build files
├── gcp/                    # GCP Cloud Run deployment scripts
└── .github/workflows/      # CI/CD
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run linting: `npm run lint`
5. Run type checking: `npm run typecheck`
6. Run tests: `npm test`
7. Commit: `git commit -m "Add my feature"`
8. Push: `git push origin feature/my-feature`
9. Open a Pull Request

---

*LittleSparks — Where Little Minds Ignite Big Ideas*
