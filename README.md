# Swarm — AI Decision Intelligence Platform

Swarm is not a chatbot. It is a structured AI boardroom that evaluates ideas, startups, and strategic decisions through expert perspectives — then delivers a board-level decision memo with scoring and voting.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your Qwen API key in `.env`:
   ```bash
   cp .env.example .env
   # Set QWEN_API_KEY or DASHSCOPE_API_KEY
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Submit** an idea, startup concept, or strategic question
2. **Four expert perspectives** analyze in parallel waves:
   - Market Analysis (demand, competition, opportunity)
   - Risk Analysis (assumptions, failure points, threats)
   - Technical Analysis (feasibility, complexity, build requirements)
   - Strategic Analysis (GTM, priorities, long-term viability)
3. **Board Moderator** synthesizes a structured **Board Decision Memo** with scores, votes, and a final verdict

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `QWEN_API_KEY` | Yes | — | Aliyun DashScope API key |
| `DASHSCOPE_API_KEY` | Alt | — | Alternative key name |
| `QWEN_MODEL` | No | `qwen-plus` | Qwen model to use |

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Development server (Vite + Express) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | TypeScript check |
