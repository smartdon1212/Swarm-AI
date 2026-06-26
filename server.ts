import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import type { BoardDecisionMemo, BoardVotes, Project } from "./src/types.js";
import {
  marketPrompt,
  riskPrompt,
  technicalPrompt,
  strategicPrompt,
  moderatorPrompt,
} from "./server/prompts.js";
import { parseAgentResponse, parseModeratorResponse } from "./server/utils.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = path.join(process.cwd(), "projects.db.json");

function defaultMemo(): BoardDecisionMemo {
  return {
    recommendation: "Proceed With Caution",
    confidenceScore: 50,
    marketOpportunityScore: 50,
    technicalFeasibilityScore: 50,
    riskScore: 50,
    executionDifficultyScore: 50,
    keyOpportunities: [],
    keyRisks: [],
    recommendedNextActions: [],
    decisionTriggers: [],
    finalVerdict: "",
  };
}

function defaultVotes(): BoardVotes {
  return {
    market: "Neutral",
    risk: "Neutral",
    technical: "Neutral",
    strategic: "Neutral",
  };
}

function migrateLegacyProject(raw: Record<string, unknown>): Project {
  const memo = (raw.memo as BoardDecisionMemo) || defaultMemo();
  const legacyScore = typeof raw.score === "number" ? raw.score : memo.confidenceScore;

  return {
    id: String(raw.id),
    idea: String(raw.idea),
    createdAt: String(raw.createdAt),
    market: String(raw.market || raw.research || ""),
    risk: String(raw.risk || raw.critic || ""),
    technical: String(raw.technical || raw.engineer || ""),
    strategic: String(raw.strategic || ""),
    votes: (raw.votes as BoardVotes) || defaultVotes(),
    memo: {
      ...defaultMemo(),
      ...memo,
      confidenceScore: memo.confidenceScore ?? legacyScore,
      finalVerdict: memo.finalVerdict || String(raw.strategist || ""),
    },
  };
}

function seedProjects(): Project[] {
  return [
    {
      id: "proj_seed_1",
      idea: "EcoRoute Fleet Carbon Minimizer",
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      market: `### Demand Assessment
Heavy-duty commercial shipping accounts for over 8% of global CO2 emissions. EU CSRD and similar ESG mandates create urgent demand for auditable fleet carbon reporting.

### Competitive Landscape
Samsara and Geotab dominate telematics but optimize for arrival time and driver behavior — not payload-aware aerodynamic fuel optimization.

### Market Opportunity
Mid-to-large logistics fleets (100+ vehicles) represent a $2B+ addressable segment for carbon compliance tooling.`,
      risk: `### Critical Assumptions
- Fleets will pay for software without mandated regulation
- Drivers will follow AI routing recommendations

### Major Failure Points
1. **Hardware retrofit costs** — $400/truck sensor installs destroy margins
2. **GPS blackouts** in rural corridors break cloud routing
3. **Liability exposure** if eco-routes send overweight trucks onto restricted bridges`,
      technical: `### Technical Feasibility
High. OBD-II telematics and existing fleet APIs provide sufficient data without custom hardware.

### System Architecture
MQTT ingestion on AWS IoT Core, PostGIS routing engine, Mapbox visualization layer.

### MVP Build Requirements
Phase 1: API integration with existing telematics providers. Phase 2: Offline-capable route caching on driver mobile apps.`,
      strategic: `### Strategic Positioning
Position as a compliance-first carbon reporting layer, not a driver-facing routing disruptor.

### Go-to-Market
Target fleet managers on deadhead routes where routing control is centralized — bypass driver adoption friction.

### Long-Term Viability
Strong if hardware dependency is eliminated and regulatory tailwinds continue.`,
      votes: {
        market: "Approve",
        risk: "Concerned",
        technical: "Approve",
        strategic: "Approve",
      },
      memo: {
        recommendation: "Proceed With Caution",
        confidenceScore: 78,
        marketOpportunityScore: 82,
        technicalFeasibilityScore: 85,
        riskScore: 58,
        executionDifficultyScore: 55,
        keyOpportunities: [
          "Regulatory tailwinds from EU CSRD carbon reporting mandates",
          "Zero-hardware MVP via existing telematics API integrations",
          "Underserved mid-market fleet segment vs. enterprise-only incumbents",
        ],
        keyRisks: [
          "Driver override behavior undermines routing recommendations",
          "Liability exposure from AI-generated route suggestions",
          "Thin margins make fleet operators price-sensitive",
        ],
        recommendedNextActions: [
          "Run 30-day pilot with 2 fleet partners on deadhead routes only",
          "Build Samsara/Geotab API integration before any custom hardware",
          "Engage legal counsel on routing liability disclaimers",
        ],
        decisionTriggers: [
          "Pilot shows <15% driver compliance with recommended routes",
          "Regulatory changes reduce carbon reporting requirements",
          "Incumbent telematics vendors launch native carbon modules",
        ],
        finalVerdict:
          "The board recommends **Proceed With Caution**. Market demand is real and growing, technical feasibility is strong via API-first architecture, but adoption friction and liability risks require a tightly scoped pilot before scaling.",
      },
    },
    {
      id: "proj_seed_2",
      idea: "MediScan Deep Ultrasound Diagnostic Suite",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      market: `### Demand Assessment
45%+ of rural clinics lack certified sonographers. Delayed prenatal anomaly detection creates measurable mortality impact.

### Competitive Landscape
Philips Lumify offers handheld probes but requires manual diagnostic expertise — no integrated real-time AI classification at the point of care.

### Market Opportunity
NGO health programs and rural midwife networks represent an underserved channel with grant-funded procurement.`,
      risk: `### Critical Assumptions
- AI can match sonographer accuracy on degraded rural imagery
- Regulatory pathways can be shortened via decision-support classification

### Major Failure Points
1. **False negatives** in prenatal screening carry catastrophic liability
2. **Image quality degradation** from outdated probes and operator jitter
3. **FDA Class II/III certification** requiring 3+ years and $5M+ in trials`,
      technical: `### Technical Feasibility
Moderate. Edge inference via TensorFlow Lite/ONNX on mid-range Android tablets is proven for narrow classification tasks.

### MVP Build Requirements
Quantized ResNet classifier at 15 FPS on low-spec hardware. UVC USB-OTG probe integration. Full on-device encryption.`,
      strategic: `### Strategic Positioning
Launch as a **Diagnostic Decision Support Tool** with human-in-the-loop validation — not autonomous diagnosis.

### Go-to-Market
Partner with international health NGOs to deploy under monitored clinical studies, bypassing commercial medical sales channels.

### Long-Term Viability
Conditional on regulatory pathway clarity and narrow initial use case (binary triage indicators).`,
      votes: {
        market: "Approve",
        risk: "Reject",
        technical: "Concerned",
        strategic: "Neutral",
      },
      memo: {
        recommendation: "Pivot",
        confidenceScore: 62,
        marketOpportunityScore: 74,
        technicalFeasibilityScore: 58,
        riskScore: 78,
        executionDifficultyScore: 82,
        keyOpportunities: [
          "Massive underserved rural healthcare market",
          "NGO partnership channel bypasses commercial sales friction",
          "Edge AI enables offline operation in connectivity-poor regions",
        ],
        keyRisks: [
          "Single false negative could trigger regulatory shutdown",
          "FDA/CE certification timeline exceeds startup runway",
          "Degraded probe imagery may invalidate model accuracy",
        ],
        recommendedNextActions: [
          "Pivot to low-risk binary triage (fetal presentation) as MVP scope",
          "Engage regulatory consultant on Class I vs Class II pathway",
          "Partner with one NGO for a 6-month monitored clinical pilot",
        ],
        decisionTriggers: [
          "Regulatory counsel confirms Class II minimum 18-month pathway",
          "Pilot achieves >95% sensitivity on binary triage indicators",
          "Competitor launches FDA-cleared rural ultrasound AI",
        ],
        finalVerdict:
          "The board recommends **Pivot**. Market need is genuine, but the current scope carries lethal liability and regulatory risk. Narrow to decision-support triage indicators and NGO-gated deployment before pursuing full diagnostic claims.",
      },
    },
  ];
}

function readDB(): Project[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = seedProjects();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf-8");
      return seed;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => migrateLegacyProject(item));
  } catch (error) {
    console.error("Error reading database:", error);
    return [];
  }
}

function writeDB(projects: Project[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

function getQwenApiKey(): string | null {
  const key = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!key || key === "MY_QWEN_API_KEY" || key === "MY_DASHSCOPE_API_KEY") {
    return null;
  }
  return key;
}

export interface AIProvider {
  generate(prompt: string): Promise<string>;
}

class QwenProvider implements AIProvider {
  async generate(prompt: string): Promise<string> {
    const apiKey = getQwenApiKey();
    if (!apiKey) {
      throw new Error(
        "Qwen API key (QWEN_API_KEY or DASHSCOPE_API_KEY) is not configured. Add your DashScope key to enable live analysis."
      );
    }

    const url =
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    const model = process.env.QWEN_MODEL || "qwen-plus";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Qwen API returned status ${response.status}: ${errText}`
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) {
      throw new Error("Invalid response from Qwen API.");
    }
    return resultText;
  }
}

function getAIProvider(): AIProvider {
  return new QwenProvider();
}

async function runBoardAnalysis(idea: string, provider: AIProvider) {
  console.log("[Swarm] Wave 1: Market + Risk analysis...");
  const [marketRaw, riskRaw] = await Promise.all([
    provider.generate(marketPrompt(idea)),
    provider.generate(riskPrompt(idea)),
  ]);

  const market = parseAgentResponse(marketRaw);
  const risk = parseAgentResponse(riskRaw);

  console.log("[Swarm] Wave 2: Technical + Strategic analysis...");
  const [technicalRaw, strategicRaw] = await Promise.all([
    provider.generate(technicalPrompt(idea, market.analysis, risk.analysis)),
    provider.generate(strategicPrompt(idea, market.analysis, risk.analysis)),
  ]);

  const technical = parseAgentResponse(technicalRaw);
  const strategic = parseAgentResponse(strategicRaw);

  console.log("[Swarm] Wave 3: Board Moderator synthesis...");
  const moderatorRaw = await provider.generate(
    moderatorPrompt(idea, market, risk, technical, strategic)
  );
  const memo = parseModeratorResponse(moderatorRaw);

  const votes: BoardVotes = {
    market: market.vote,
    risk: risk.vote,
    technical: technical.vote,
    strategic: strategic.vote,
  };

  return { market, risk, technical, strategic, memo, votes };
}

app.get("/api/status", (_req, res) => {
  const qwenKeyPresent = !!getQwenApiKey();
  res.json({
    activeProvider: "qwen",
    providerLabel: qwenKeyPresent
      ? "Qwen Decision Engine Active"
      : "Qwen Engine (API Key Required)",
    model: process.env.QWEN_MODEL || "qwen-plus",
    keyConfigured: qwenKeyPresent,
    currentTime: new Date().toISOString(),
  });
});

app.get("/api/history", (_req, res) => {
  try {
    const projects = readDB();
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.get("/api/project/:id", (req, res) => {
  try {
    const { id } = req.params;
    const project = readDB().find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({ error: `Project ${id} not found` });
    }
    res.json(project);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return res
        .status(400)
        .json({ error: "Please submit a valid idea or decision question." });
    }

    const trimmedIdea = idea.trim();
    const provider = getAIProvider();
    console.log(
      `[Swarm] Board review started: "${trimmedIdea.substring(0, 60)}..."`
    );

    const result = await runBoardAnalysis(trimmedIdea, provider);

    const savedId = "proj_" + Date.now();
    const newProject: Project = {
      id: savedId,
      idea: trimmedIdea,
      createdAt: new Date().toISOString(),
      market: result.market.analysis,
      risk: result.risk.analysis,
      technical: result.technical.analysis,
      strategic: result.strategic.analysis,
      votes: result.votes,
      memo: result.memo,
    };

    const db = readDB();
    db.push(newProject);
    writeDB(db);

    console.log(
      `[Swarm] Review complete. ID: ${savedId}. Recommendation: ${newProject.memo.recommendation}`
    );

    return res.json({ ...newProject, saved_id: newProject.id });
  } catch (error: unknown) {
    console.error("Board review failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An error occurred during board analysis.";
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    readDB();
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[SWARM] Decision Intelligence Platform running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
