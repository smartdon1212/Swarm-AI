# SRASS Swarm: AI Innovation Boardroom

A multi-agent AI boardroom that stress-tests a startup or product idea. You submit an idea; four specialist agents analyze it from different angles, challenge each other, and a Strategist agent synthesizes a verdict with a weighted score.

| Agent | Role |
|---|---|
| **Research** | Market feasibility and need (sources are attached when the model returns them) |
| **Critic** | Adversarial risk audit (what kills this idea) |
| **Engineer** | System architecture and build feasibility |
| **Strategist** | Synthesizes the debate into a verdict and action plan |

The final score combines three sub-scores: market (35%), risk survival (35%) and technical feasibility (30%). You can also ask any agent follow-up questions after the analysis, answer a short launch survey, and export the report as a PDF.

Built by [Smartdon Robotics, Automation and Software Solutions (SRASS)](https://github.com/smartdon1212).

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Motion
- **Backend:** Node.js, Express, TypeScript (`server.ts`)
- **AI:** Google Gemini via `@google/genai`
- **Storage:** pluggable provider, either a local JSON file or Firebase Firestore
- **Export:** jsPDF

## Getting started

Requires Node.js 22+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env      # then set GEMINI_API_KEY
npm run dev               # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

### Configuration

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Required. Gemini API access |
| `GEMINI_MODEL` | Optional. Overrides the default Gemini model |
| `DATABASE_PROVIDER` | `local` (JSON file) or `firestore` |
| `FIREBASE_PROJECT_ID`, `FIREBASE_FIRESTORE_DATABASE_ID` | Needed when using Firestore |

`projects.db.json` is seed/demo data for the local provider. Firestore access rules live in `firestore.rules`.

## API

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze` | Run a full boardroom deliberation on an idea (rate limited) |
| `POST` | `/api/agent-followup` | Ask one agent a follow-up question (rate limited) |
| `GET` | `/api/history` | List past analyses |
| `GET` | `/api/project/:id` | Fetch one analysis |
| `POST` | `/api/survey` | Submit a launch survey |
| `GET` | `/api/surveys` | List surveys |
| `GET` | `/api/status` | Provider status |

## Project structure

```
server.ts            Express API, agent orchestration, storage providers
src/
  App.tsx            Main app and boardroom UI
  components/        AgentCard, ScoreGauge, LaunchSurvey, LandingPage, MarkdownView
  lib/exportUtils.ts PDF export
  types.ts           Shared types (Project, SubScores, AgentFollowUp, ...)
firestore.rules      Firestore security rules (per-user isolation)
```

## Roadmap

- Split `server.ts` into modules (routes, agents, storage providers)
- Add automated tests for scoring and the storage providers
- Stronger server-side identity checks across all history and project routes
- Persistent, shared rate limiting

## License

[MIT](LICENSE)
