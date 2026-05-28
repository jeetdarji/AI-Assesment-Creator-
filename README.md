<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4.18-000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange" alt="Groq" />
</p>

# VedaAI — AI Assessment Creator

> An AI-powered educational platform that enables teachers to automatically generate structured, print-ready question papers from uploaded reference material — complete with answer keys, difficulty tagging, and PDF export.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Frontend Pages & Routing](#frontend-pages--routing)
- [Design & UI Approach](#design--ui-approach)
- [Approach & Design Decisions](#approach--design-decisions)
- [WebSocket Events](#websocket-events)
- [Screenshots](#screenshots)

---

## Overview

**VedaAI** is a full-stack web application built for the **VedaAI Assessment** that lets teachers:

1. **Upload** reference material (PDF, DOCX, or TXT).
2. **Configure** question types (MCQ, Short Answer, Long Answer, etc.) with per-type counts and marks.
3. **Generate** a complete question paper using **Groq's LLaMA 3.3 70B** model via a background job queue.
4. **View** the generated paper in a paginated A4-style viewer with school header, student info, sections, and answer key.
5. **Download** the paper as a professionally formatted PDF.

The entire pipeline — from file upload to AI generation to real-time status updates — is handled asynchronously using **BullMQ + Redis**, with **Socket.io** providing live progress feedback to the frontend.

---

## Key Features

| Feature | Description |
|---|---|
| **AI Question Generation** | Uses Groq's LLaMA 3.3 70B to generate pedagogically sound questions with difficulty levels (Easy/Moderate/Hard) |
| **Multi-format File Upload** | Supports PDF, DOCX, and TXT files up to 10 MB; text extracted in the background worker |
| **Background Job Queue** | BullMQ + Redis ensures non-blocking generation with automatic retries (3 attempts, exponential backoff) |
| **Real-time Status Updates** | Socket.io pushes `generation:started`, `generation:complete`, and `generation:failed` events to the client |
| **Fallback Polling** | If WebSocket events are missed, the frontend polls the API every 5 seconds as a resilience layer |
| **Output Caching** | Generated outputs are cached in Redis (1-hour TTL) for instant retrieval on repeat visits |
| **PDF Export** | Client-side PDF generation via `@react-pdf/renderer` with a professional question paper layout |
| **Responsive Design** | Fully responsive — desktop sidebar + mobile bottom nav bar, built with Tailwind CSS and Figma design tokens |
| **Optimistic UI** | Delete actions use optimistic updates with automatic rollback on failure |
| **Zod Validation** | Server-side request validation using Zod schemas |
| **Retry Mechanism** | Failed assignments can be re-queued from the UI with a single click |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router, Turbopack dev server |
| **TypeScript 5.4** | Type-safe codebase |
| **Tailwind CSS 3.4** | Utility-first styling with custom design tokens |
| **Zustand** | Lightweight state management (form store, generation store, output store) |
| **Socket.io Client** | Real-time WebSocket communication |
| **Axios** | HTTP client for API requests |
| **Lucide React** | Icon library |
| **@react-pdf/renderer** | Client-side PDF generation |
| **Lenis** | Smooth scroll library |

### Backend

| Technology | Purpose |
|---|---|
| **Express 4.18** | REST API server |
| **TypeScript 5.4** | Type-safe backend |
| **Mongoose 8** | MongoDB ODM |
| **BullMQ** | Redis-based job queue for background processing |
| **ioredis** | Redis client (compatible with Upstash) |
| **Socket.io** | Real-time event broadcasting |
| **Groq SDK** | LLM API client (LLaMA 3.3 70B Versatile) |
| **Multer** | File upload handling (memory storage) |
| **Zod** | Request validation |
| **pdf-parse** | PDF text extraction |
| **Mammoth** | DOCX text extraction |

### Infrastructure

| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted document database |
| **Upstash Redis** | Serverless Redis for BullMQ queue and output caching |
| **Groq Cloud** | Ultra-fast LLM inference API |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  Create   │  │  Generation  │  │   Output    │  │  List   │ │
│  │  Form     │──│  Loading     │──│   Viewer    │  │  Page   │ │
│  │  Page     │  │  Page        │  │   + PDF     │  │         │ │
│  └────┬─────┘  └──────┬───────┘  └─────────────┘  └─────────┘ │
│       │               │                                         │
│       │ POST          │ Socket.io         Axios GET             │
│       │ /api/         │ Events            /api/assignments      │
│       │ assignments   │                   /:id/output           │
└───────┼───────────────┼─────────────────────────────────────────┘
        │               │
        ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express + Socket.io)               │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Routes   │  │ Multer   │  │   Zod    │  │  Socket.io    │  │
│  │  /api/    │──│ Upload   │──│ Validate │  │  Manager      │  │
│  │assignments│  │ (memory) │  │          │  │  (broadcast)  │  │
│  └────┬─────┘  └──────────┘  └──────────┘  └───────┬───────┘  │
│       │                                             │          │
│       ▼                                             │          │
│  ┌──────────────┐    ┌────────────────────┐         │          │
│  │  Controller   │    │   BullMQ Producer  │         │          │
│  │  (CRUD ops)   │───▶│   enqueueAssignment│         │          │
│  └──────────────┘    └────────┬───────────┘         │          │
│                               │                     │          │
└───────────────────────────────┼─────────────────────┼──────────┘
                                │                     │
                                ▼                     │
┌───────────────────────────────────────────────────────────────┐
│                     BACKGROUND WORKER                         │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ File Parser  │  │ Prompt       │  │  Groq AI Service     │ │
│  │ (PDF/DOCX/  │──│ Builder      │──│  (LLaMA 3.3 70B)     │ │
│  │  TXT)       │  │              │  │  3 retries + backoff  │ │
│  └─────────────┘  └──────────────┘  └──────────┬───────────┘ │
│                                                 │             │
│                    ┌────────────────────────────┐│             │
│                    │  Save to MongoDB + Redis   ││             │
│                    │  Emit Socket.io event      │◀             │
│                    └────────────────────────────┘              │
└───────────────────────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐
   │  MongoDB     │    │  Redis       │    │  Groq Cloud      │
   │  Atlas       │    │  (Upstash)   │    │  LLM API         │
   │              │    │              │    │                  │
   │  Assignments │    │  BullMQ      │    │  LLaMA 3.3 70B  │
   │  Outputs     │    │  Queue +     │    │  Versatile       │
   │              │    │  Cache       │    │                  │
   └─────────────┘    └─────────────┘    └──────────────────┘
```

### Request Flow

1. **Teacher submits** the assignment form (name, file, question types, due date, additional instructions).
2. **Express API** validates with Zod, stores the assignment in MongoDB with `status: "pending"`, and enqueues a BullMQ job.
3. **Background Worker** picks up the job, extracts text from uploaded file (if any), builds a structured LLM prompt, and calls Groq.
4. **Groq returns** a JSON response with sections, questions (with difficulty tags), and a complete answer key.
5. **Worker** parses/validates the JSON, saves the `Output` document to MongoDB, caches it in Redis, and updates assignment status to `"completed"`.
6. **Socket.io** broadcasts a `generation:complete` event.
7. **Frontend** receives the event via WebSocket (or catches it via fallback polling) and redirects to the output viewer.

---

## Project Structure

```
vedaai-assessment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                  # MongoDB connection (Mongoose)
│   │   │   └── redis.ts               # Redis client + BullMQ connection config
│   │   ├── controllers/
│   │   │   └── assignmentController.ts # CRUD + retry handlers
│   │   ├── middleware/
│   │   │   ├── upload.ts              # Multer file upload (memory storage, 10MB limit)
│   │   │   └── validate.ts            # Zod schema validation
│   │   ├── models/
│   │   │   ├── Assignment.ts          # Mongoose schema for assignments
│   │   │   └── Output.ts             # Mongoose schema for generated outputs
│   │   ├── queues/
│   │   │   ├── producer.ts            # BullMQ queue + enqueue function
│   │   │   └── worker.ts             # Background job processor
│   │   ├── routes/
│   │   │   └── assignments.ts         # Express route definitions
│   │   ├── services/
│   │   │   ├── aiService.ts           # Groq API integration + JSON parsing
│   │   │   └── cacheService.ts        # Redis get/set/delete for outputs
│   │   ├── socket/
│   │   │   └── socketManager.ts       # Socket.io init + broadcast helper
│   │   ├── types/
│   │   │   ├── assignment.ts          # TypeScript interfaces for assignments
│   │   │   └── output.ts             # TypeScript interfaces for outputs
│   │   ├── utils/
│   │   │   └── promptBuilder.ts       # LLM prompt construction
│   │   └── index.ts                   # Express + Socket.io entrypoint
│   ├── .env                           # Backend environment variables (gitignored)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── _components/
│   │   │   └── LenisProvider.tsx       # Smooth scroll provider
│   │   ├── assignments/
│   │   │   ├── _components/
│   │   │   │   ├── AssignmentCard.tsx  # Assignment list card component
│   │   │   │   └── AssignmentsToolbar.tsx # Search + filter toolbar
│   │   │   ├── [id]/
│   │   │   │   ├── output/
│   │   │   │   │   └── page.tsx       # Generated output viewer (A4 paginated)
│   │   │   │   └── page.tsx           # Generation loading/progress page
│   │   │   ├── create/
│   │   │   │   └── page.tsx           # Assignment creation form
│   │   │   └── page.tsx               # Assignment listing page
│   │   ├── globals.css                # CSS variables + design tokens
│   │   ├── layout.tsx                 # Root layout (fonts, metadata)
│   │   └── page.tsx                   # Home (redirects to /assignments)
│   ├── components/
│   │   ├── create/
│   │   │   ├── AdditionalInfoTextarea.tsx
│   │   │   ├── CounterInput.tsx
│   │   │   ├── DueDatePicker.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── QuestionTypeRow.tsx
│   │   │   ├── QuestionTypeSelector.tsx
│   │   │   └── StepIndicator.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Main layout wrapper
│   │   │   ├── Sidebar.tsx            # Desktop sidebar + mobile bottom nav
│   │   │   └── TopBar.tsx             # Desktop top bar + mobile header
│   │   ├── output/
│   │   │   ├── ActionBar.tsx          # Delete/retry action buttons
│   │   │   ├── AnswerKey.tsx          # Answer key display
│   │   │   ├── DifficultyBadge.tsx    # Easy/Moderate/Hard badge
│   │   │   ├── QuestionItem.tsx       # Individual question renderer
│   │   │   ├── QuestionSection.tsx    # Section with title + questions
│   │   │   ├── SchoolHeader.tsx       # School name/subject/grade header
│   │   │   └── StudentInfoSection.tsx # Student name/roll number fields
│   │   └── pdf/
│   │       ├── PdfDownloadButton.tsx  # Download trigger button
│   │       └── QuestionPaperPDF.tsx   # @react-pdf/renderer template
│   ├── hooks/
│   │   ├── useGenerationStatus.ts     # WebSocket generation event listener
│   │   └── useSocket.ts              # Socket.io singleton hook
│   ├── lib/
│   │   ├── axios.ts                   # Axios instance with base URL
│   │   ├── lenis.ts                   # Lenis smooth scroll config
│   │   └── socket.ts                 # Socket.io client singleton
│   ├── store/
│   │   ├── assignmentFormStore.ts     # Zustand store for create form state
│   │   ├── generationStore.ts         # Zustand store for generation status
│   │   └── outputStore.ts            # Zustand store for output viewer
│   ├── .env.local                     # Frontend environment variables (gitignored)
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── package.json
│
├── package.json                       # Root monorepo scripts
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — Atlas free tier or local instance
- **Redis** — Upstash (recommended) or local Redis 7+
- **Groq API Key** — Free from [console.groq.com](https://console.groq.com)

### Environment Variables

#### Backend (`backend/.env`)

```env
# Port the Express server listens on
PORT=5000

# MongoDB connection string (Atlas or local)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority

# Redis connection URL (used by ioredis and BullMQ)
REDIS_URL=rediss://default:<password>@<host>.upstash.io:6379

# Groq API key — get from console.groq.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Frontend origin for CORS and Socket.io
FRONTEND_URL=http://localhost:3000

# Node environment
NODE_ENV=development
```

#### Frontend (`frontend/.env.local`)

```env
# Base URL of the Express backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Socket.io server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/vedaai-assessment.git
cd vedaai-assessment

# Install root dependencies (mammoth, etc.)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running the Application

You need **three terminals** (or use the backend's `concurrently` script for the first two):

#### Terminal 1 — Backend API + Worker

```bash
cd backend
npm run dev
```

This runs both the Express API server and the BullMQ worker concurrently.

- **API Server** → [http://localhost:5000](http://localhost:5000)
- **Health Check** → [http://localhost:5000/health](http://localhost:5000/health)

#### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

- **Frontend** → [http://localhost:3000](http://localhost:3000)

#### Build for Production

```bash
# From project root — builds both frontend and backend
npm run build

# Or individually
npm run build:frontend
npm run build:backend
```

---

## API Reference

Base URL: `http://localhost:5000`

### Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create a new assignment (multipart/form-data) |
| `GET` | `/api/assignments` | List all assignments (sorted by newest) |
| `GET` | `/api/assignments/:id` | Get a single assignment by ID |
| `GET` | `/api/assignments/:id/output` | Get the generated output (cache → DB fallback) |
| `DELETE` | `/api/assignments/:id` | Delete an assignment and its output |
| `POST` | `/api/assignments/:id/retry` | Re-queue a failed assignment for regeneration |

### `POST /api/assignments` — Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assignmentName` | `string` | Yes | Name of the assignment (1–120 chars) |
| `questionTypes` | `JSON string` | Yes | Array of `{ type, count, marks }` objects |
| `file` | `File` | No | Reference material (PDF, DOCX, or TXT, max 10 MB) |
| `dueDate` | `string` | No | ISO date string |
| `additionalInfo` | `string` | No | Extra instructions for the AI (max 1000 chars) |

### Response — Generated Output Schema

```json
{
  "output": {
    "schoolName": "Delhi Public School",
    "subject": "Science",
    "classGrade": "Class 10",
    "timeAllowed": "3 Hours",
    "maxMarks": 80,
    "sections": [
      {
        "title": "Section A — Multiple Choice Questions",
        "instruction": "Choose the correct option.",
        "questions": [
          {
            "number": 1,
            "text": "Which organelle is known as the powerhouse of the cell?",
            "options": ["A) Nucleus", "B) Mitochondria", "C) Ribosome", "D) Golgi body"],
            "difficulty": "Easy",
            "marks": 1,
            "type": "MCQ"
          }
        ]
      }
    ],
    "answerKey": [
      {
        "questionNumber": 1,
        "answer": "B) Mitochondria",
        "explanation": "Mitochondria are responsible for cellular respiration and ATP production."
      }
    ]
  }
}
```

---

## Frontend Pages & Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Redirects to `/assignments` |
| `/assignments` | Assignment List | Grid of all assignments with search/filter, delete, status badges |
| `/assignments/create` | Create Assignment | Multi-field form: name, file upload, due date, question types, additional info |
| `/assignments/[id]` | Generation Progress | Real-time loading screen with step indicators and elapsed timer |
| `/assignments/[id]/output` | Output Viewer | Paginated A4-style question paper viewer with PDF download |

---

## Design & UI Approach

- **Design System**: Built on custom Figma design tokens mapped to CSS variables and extended Tailwind classes (`veda-*` color palette).
- **Typography**: Bricolage Grotesque (headings/UI) + Inter (body), loaded via `next/font/google`.
- **Layout**: Fixed desktop sidebar (304px) with glassmorphism effect + responsive mobile bottom navigation bar.
- **Glassmorphism**: Translucent cards with `backdrop-blur`, white borders, and soft shadows (`glass`, `glass-light`, `glass-dark` utility classes).
- **Animations**: Custom Tailwind keyframes (`fade-in-up`, `scale-in`, `pulse-soft`) for smooth page transitions.
- **A4 Viewer**: CSS column-based pagination simulating physical A4 pages with scroll-snap navigation.
- **Mobile-First**: All views are fully responsive — the sidebar collapses into a bottom nav, cards stack vertically, and the output viewer adapts.

---

## Approach & Design Decisions

### 1. Asynchronous Generation Pipeline

Instead of making the user wait for the LLM response during the HTTP request (which can take 30–60 seconds), the API immediately returns after enqueuing a BullMQ job. The user is redirected to a loading page that receives real-time updates via Socket.io.

### 2. Worker Process Separation

The BullMQ worker runs as a **separate process** (`ts-node-dev src/queues/worker.ts`), decoupling CPU-intensive file parsing and LLM calls from the API server. This ensures the API remains responsive even under load.

### 3. Dual Notification Strategy

- **Primary**: Socket.io pushes events (`generation:started`, `generation:complete`, `generation:failed`) for instant updates.
- **Fallback**: The frontend polls `GET /api/assignments/:id` every 5 seconds in case WebSocket events are missed (e.g., reconnection scenarios).

### 4. Redis Caching Layer

Generated outputs are cached in Redis with a 1-hour TTL. The `GET /:id/output` endpoint checks Redis first, falling back to MongoDB. This reduces database load for repeated views.

### 5. Resilient AI Integration

The Groq AI service includes:
- **3 retry attempts** with strategy-specific delays (10s for rate limits, 5s for service unavailability, exponential backoff for parsing errors).
- **JSON extraction** that strips markdown fences and locates the first `{...}` block.
- **Difficulty normalization** that defaults invalid values to "Moderate".

### 6. File Processing in Worker

File text extraction (PDF via `pdf-parse`, DOCX via `mammoth`, TXT via buffer decode) happens in the worker, not during the API request. After extraction, the raw `fileUrl` (base64) is replaced with parsed `referenceContent` to save storage.

### 7. State Management with Zustand

Three focused Zustand stores keep frontend state minimal and predictable:
- **`assignmentFormStore`** — Create form fields (name, file, question types, due date, additional info).
- **`generationStore`** — Assignment ID, status, and error for the generation loading page.
- **`outputStore`** — Output data, loading, and error state for the viewer.

### 8. Client-Side PDF Generation

PDF export uses `@react-pdf/renderer` loaded dynamically (`next/dynamic` with `ssr: false`) to avoid SSR issues. The PDF template mirrors the on-screen layout for WYSIWYG accuracy.

---

## WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `generation:started` | Server → Client | `{ assignmentId, status }` | Worker started processing |
| `generation:complete` | Server → Client | `{ assignmentId, status }` | Generation successful |
| `generation:failed` | Server → Client | `{ assignmentId, status, error }` | Generation failed |
| `assignment:status` | Server → Client | `{ assignmentId, status }` | Generic status update |

---

## Screenshots

> Add screenshots here after deployment.

| View | Description |
|------|-------------|
| Assignment List | Grid view of all created assignments with status badges |
| Create Form | Multi-step form with file upload, question type configuration |
| Generation Loading | Real-time progress with step indicators |
| Output Viewer | Paginated A4-style question paper with answer key |
| PDF Export | Downloaded question paper in PDF format |

---

## License

This project was built as part of the **VedaAI Assessment Task**.

---

<p align="center">
  Built with ❤️ using Next.js, Express, and Groq AI
</p>
