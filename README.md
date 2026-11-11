# CampusBuddy AI — Presidency University AI Campus Helpdesk

> **Built for the TECHNOPIA 2.0 60-Minute Challenge**  
> An autonomous, grounded AI Campus Helpdesk application for Presidency University students. Powered by React + TypeScript + Tailwind CSS, Node.js + Express, Google Gemini 2.5 Flash-Lite, and a validated clean vector retrieval pipeline.

---

## 🏛️ Project Overview

CampusBuddy AI addresses university student inquiries across eight key campus domains:
1. **Academics** (Faculty advisor assistance, course guidance)
2. **Attendance** (Minimum attendance requirements & regulations)
3. **Examinations** (Timetables, official communication channels)
4. **Placements** (Placement training & career opportunities)
5. **Library** (Resource access & borrowing regulations)
6. **Hostel** (Hostel administration & complaint procedures)
7. **Administration** (Certificates, transcripts & student records)
8. **Events** (Official event announcements & cultural fests)

### 🛡️ Grounded AI Guarantee (Anti-Hallucination)
- **Zero Hallucination of Absent Information:** Questions asking for dates, percentages, fees, or contacts not present in the supplied university data are explicitly identified as **unavailable**; the AI does not invent facts.
- **Pure Presidency University Corpus:** 100% of the MANAK legal-metrology vector store and legal rules were eliminated. The index contains only verified Presidency University competition information.
- **Dimension & Model Safety:** Prevents incompatible embedding vector spaces (eliminates the mixed 384d / 1024d bug identified in the MANAK audit). Every document in `campus_vector_store.json` shares the identical schema, dimension, and model identifier.

---

## 🚀 Key Features

- **Reference UI Fidelity:** Recreates the Page 3 design with a Presidency navy top header, responsive navigation, welcome hero, 6 primary category cards, quick filters, and a dedicated AI chat transcript.
- **Grounded Source Citations:** Every factual response returns the exact verified source title, category, and document ID (`id`, `title`, `source`).
- **Pre-Retrieval Conversational Routing:** Casual greetings (`Hi`, `Hello`, `Thank you`) bypass vector lookup completely, conserving compute and preventing context contamination.
- **Student Registration & Dashboard (Addendum):** Full student registration, authentication, profile management, and dashboard with 8 university categories.
- **Dual Hosting Support:**
  - **Docker:** Multi-stage container builds frontend static assets and serves both React SPA and Express `/api/*` from a single origin.
  - **Vercel:** Static Vite SPA + Serverless Express adapter with `/api/(.*)` rewrites and static data bundling.

---

## 🏗️ Architecture

```
campusbuddy-ai/
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── public/assets/
│   │   └── presidency-logo.svg   # Official Presidency logo placeholder
│   ├── src/
│   │   ├── components/           # Header, Hero, CategoryCards, ChatWindow, etc.
│   │   ├── pages/                # Home, Chat, Dashboard, Login, Register
│   │   ├── services/             # Chat API & Native Supabase Auth client
│   │   ├── hooks/useChat.ts      # Conversation state & feedback management
│   │   ├── types/index.ts        # TypeScript interfaces
│   │   ├── App.tsx               # Root router & layout
│   │   └── main.tsx              # React DOM entry
│   └── package.json
├── backend/                      # Node.js 20+ Express (ES Modules)
│   ├── src/
│   │   ├── data/
│   │   │   ├── campus_knowledge.json    # University baseline facts
│   │   │   └── campus_vector_store.json # Validated vector store
│   │   ├── routes/               # chat.routes.js, health.routes.js, auth.routes.js
│   │   ├── services/
│   │   │   ├── embeddingService.js      # Vector embedding & dimension validation
│   │   │   ├── vectorStore.js           # Hybrid vector (cosine) + lexical retrieval
│   │   │   ├── queryRouter.js           # Casual vs RAG classification & category mapping
│   │   │   ├── geminiService.js         # Grounded Gemini REST integration
│   │   │   ├── ragEngine.js             # Pipeline orchestrator
│   │   │   └── supabaseService.js       # Auth token verification
│   │   ├── scripts/
│   │   │   └── build-campus-index.js    # Re-indexing tool
│   │   ├── app.js                       # Express application export
│   │   └── server.js                    # Long-running HTTP entry
│   ├── api/index.js              # Vercel serverless adapter
│   └── test/                     # Automated RAG and API test suites
├── Dockerfile                    # Multi-stage production container
├── vercel.json                   # Vercel serverless configuration
├── .env.example                  # Environment template
└── README.md
```

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm 10+

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd techno

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Google Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
PORT=5000
```
*(Note: If `GEMINI_API_KEY` is omitted, CampusBuddy AI automatically runs in verified offline mode, directly serving grounded knowledge extracts without crashing!)*

### 3. Generate Campus Vector Store
```bash
npm run build:index
```
Output:
```text
[IndexBuilder] Reading campus knowledge baseline...
[IndexBuilder] Indexed academics_001 [academics] -> 384d (local-hash-v1)
...
[IndexBuilder] Successfully generated campus vector store: 8 documents
```

### 4. Build the Frontend
```bash
npm run build:frontend
```

### 5. Start the Application
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

---

## 🧪 Automated Testing & Verification

Run the automated test suites verifying all competition test scenarios:
```bash
npm test
```

### Verified Test Matrix

| Query | Expected Grounded Behavior | Status |
|---|---|---|
| `Whom should I contact for academic problems?` | Directs to **Faculty Advisor** | ✅ PASS |
| `Where can I find the examination timetable?` | Directs to **Official university channels** | ✅ PASS |
| `Whom should I contact for placement training?` | Directs to **Placement Department** | ✅ PASS |
| `How can I raise a hostel complaint?` | Directs to **Hostel Administration** | ✅ PASS |
| `What is the exact date of my next examination?` | Explicitly states **not specified in sample data** | ✅ PASS |
| `What is the minimum attendance requirement?` | Cites **minimum attendance regulations** | ✅ PASS |
| `Where can I get certificates & student records?` | Directs to **Administrative Office** | ✅ PASS |
| `Hi` / `Hello` | Routes to **conversational mode** (no vector lookup) | ✅ PASS |
| `What is the capital of Australia?` | Returns **unknown** status (zero hallucination) | ✅ PASS |

---

## 🐳 Docker Deployment

Build and run using the optimized multi-stage container:

```bash
# Build Docker image
docker build -t campusbuddy-ai .

# Run Docker container
docker run --rm -p 5000:5000 --env-file .env campusbuddy-ai
```
Visit `http://localhost:5000` to interact with the containerized application.

---

## ☁️ Vercel Deployment

1. Push your repository to GitHub.
2. Import project in Vercel.
3. Vercel automatically detects `vercel.json`:
   - Builds frontend with `npm run build`
   - Serves static assets from `frontend/dist`
   - Routes `/api/(.*)` to the serverless function `backend/api/index.js`
4. Set your Environment Variables in Vercel Project Settings:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-2.5-flash-lite`

---

## 🎨 Logo Preservation Note

Per Section 0 (Item 5) of the challenge instructions, the Presidency University logo must never be redrawn, regenerated, or replaced with simulated graphics. 

Because standalone original SVG/PNG files were not present in the challenge archive, a clearly identified placeholder is located at:
`frontend/public/assets/presidency-logo.svg`

To apply the official university graphic:
Drop the official `presidency-logo.png` or `presidency-logo.svg` directly into `frontend/public/assets/` without any code changes.

---

## 👥 Authors
Built for Presidency University TECHNOPIA 2.0 Challenge.
All rights reserved.
