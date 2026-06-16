import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to low-latency JSON database file
const DB_FILE = path.join(process.cwd(), "projects.db.json");

interface Project {
  id: string;
  idea: string;
  createdAt: string;
  research: string;
  critic: string;
  engineer: string;
  strategist: string;
  score: number;
  final_plan: string;
}

// Ensure the DB file exists and seed initial boardrooms
function readDB(): Project[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seedProjects: Project[] = [
        {
          id: "proj_seed_1",
          idea: "EcoRoute Fleet Carbon Minimizer (Seed Idea)",
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          research: `### Factual Market Feasibility Analysis (Research Agent)

1. **Market Need**: Heavy-duty commercial shipping accounts for over 8% of global CO2 emissions. Global ESG regulations (like EU CSRD) enforce strict audit trails.
2. **Competitive Landscape**: Existing fleet tools (e.g., Samsara, Geotab) focus on optimal arrival times and driver behavior metrics but lack real-time cargo payload vs. aerodynamic drag energy optimizations.
3. **Target Audience**: Mid-to-large-scale cargo logistics companies operating over 100 vehicles.
4. **Feasibility**: High. Telematics hardware can stream OBD-II fuel injection levels and engine load directly to the cloud.`,
          critic: `### Adversarial Critique & Risk Audit (Critic Agent)

1. **Hardware Retrofitting Costs**: Fleet operators operate on razor-thin margins. Demanding $400/truck for active sensors will cause immediate customer drop-off.
2. **GPS Blackouts**: Long routing paths in sub-rural mountainous corridors lack consistent cell connection. Routing logic must run offline locally.
3. **Legal Regulatory Liabilities**: If the AI recommends a "fuel-efficient route" that forces a 15-ton truck down a residential bridge with a 10-ton limit, who is liable?
4. **Adoption Friction**: Experienced truck drivers routinely override automated routing suggestions from dispatch. Convincing them to trust fuel eco-routing requires structural behavioral rewards.`,
          engineer: `### System Architecture Blueprint (Engineer Agent)

1. **Tech Stack Selection**:
   - **Ingestion**: Node.js/TypeScript running an MQTT Broker (Eclipse Avenito) on AWS IoT Core.
   - **Database**: PostgreSQL with PostGIS extension for georouting; InfluxDB for time-series telematics histories.
   - **Frontend**: Vite + Tailwind, rendering map plots through Mapbox GL Node controllers.
2. **Conceptual Relational Datastructure**:
   - \`fleets\` (id, enterprise_owner_id, region)
   - \`vehicles\` (id, fleet_id, obd_telemetry_id, cargo_capacity_kg)
   - \`routes\` (id, start_lat, start_long, end_lat, end_long, predicted_co2_kg, optimized_path_geojson)
3. **Core Development Challenge**: Building a customized A* pathfinding server capable of combining dynamic elevation slope contours (3D Terrain DEMs) with cargo weight to output precise fuel curve maps.`,
          strategist: `The Strategist Agent synthesizes the boardroom arguments of Research, Critic, and Engineer to formulate a clear, balanced verdict for the EcoRoute Fleet Carbon Minimizer.`,
          score: 87,
          final_plan: `### Consensual Roadmap & Executive Strategy

#### Phase 1: High-Value Pilot & Edge-Caching Strategy (Months 1–4)
To directly bypass the **Critic's** concerns regarding driver behavior and GPS blackouts:
- Target empty/under-capacity deadhead routes first, where fleet managers hold 100% routing control.
- Implement client-side SQLite local storage on the driver mobile application, caching regional route vectors for offline route guidance.

#### Phase 2: PostGIS Pipeline Setup (Months 5–8)
Implement the **Engineer's** dynamic A* pathfinding routing model:
- Integrate high-resolution Digital Elevation Models (DEMs) across 15 high-density freight corridors.
- Map OBD-II engine load indicators to model fuel burn against varying elevation slopes.

#### Phase 3: Hardware Cost Elimination Plan (Months 9–12)
- Eradicate custom telematics hardware installs. Build APIs to ingest GPS telemetry directly from preexisting in-cab devices (Samsara APIs). This handles the **Critic's** concern about upfront equipment costs, unlocking zero-friction adoption.`
        },
        {
          id: "proj_seed_2",
          idea: "MediScan Deep Ultrasound Diagnostic Suite (Seed Idea)",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          research: `### Factual Market Feasibility Analysis (Research Agent)

1. **Market Need**: Over 45% of rural healthcare clinics in developing regions lack certified sonographers, causing delayed detection of critical prenatal anomalies.
2. **Competitive Landscape**: Philips Lumify offers hand-held USB probes, but relies entirely on manual diagnostic expertise. Integrated real-time neural networks for image classification are mostly research-locked.
3. **Target Audience**: Rural community midwives, state healthcare practitioners, and NGO aid centers.
4. **Physiology feasibility**: High. Diagnostic patterns for fetal positioning and gallstones show high contrast on raw grey-scale sonogram feeds.`,
          critic: `### Adversarial Critique & Risk Audit (Critic Agent)

1. **Lethal Liability & False Negatives**: A single missed prenatal defect that results in neonatal emergency will trigger colossal lawsuits and permanent regulatory shutdowns.
2. **Extremely Low-Quality Inputs**: Rural clinic imagery is plagued by operator jitter, outdated transducer crystals, and dust accumulation on probes. The neural network will receive noisy, highly degraded inputs.
3. **FDA/CE Medical Certification**: Navigating Class II / III software guidelines is extremely arduous, frequently demanding 3 years of clinical trials costing up to $5M.
4. **Connectivity Assumptions**: Cloud-based computer vision is non-viable. Processing must be completed in the field on low-specs mobile hardware.`,
          engineer: `### System Architecture Blueprint (Engineer Agent)

1. **Tech Stack Selection**:
   - **Local AI execution**: TensorFlow Lite or ONNX Runtime transpiled to run locally on mid-range Android tablets/mobiles via WebAssembly.
   - **Database**: Local SQLite on-device keeping track of patients; encrypted sync with an AWS Athena clinical vault.
   - **Capture Integration**: Standard UVC (Universal Video Class) USB-OTG drivers to stream ultrasound frames directly to App views.
2. **Data Privacy Framework**:
   - Full end-to-end symmetric encryption (AES-256-GCM) of patient medical images before caching. Local scans are pseudonymous.
3. **Key Architectural Challenge**: Quantizing a ResNet-based fetal posture classifier down to 8-bit integer precision so it runs at 15 FPS on cheap mobile processors without losing diagnostic accuracy.`,
          strategist: `The Strategist Agent synthesizes the boardroom arguments of Research, Critic, and Engineer to formulate a clear, balanced verdict for the MediScan Diagnostic Suite.`,
          score: 72,
          final_plan: `### Consensual Roadmap & Executive Strategy

#### Phase 1: Clear Clinical Guardrails & FDA Strategy (Months 1–6)
To counter the **Critic's** major liability arguments:
- Categorize the soft application as a **Diagnostic Decision Support Tool** rather than an autonomous diagnostician, assuring human-in-the-loop validation.
- Focus primary MVP on binary triage indicators (e.g., Fetal Presentation: Head-First vs Breech) which carry lower risk and much speedier regulatory paths.

#### Phase 2: Quantized Edge Deployment Pipeline (Months 7–12)
- Establish the WebAssembly/ONNX local execution engine designed by the **Engineer**.
- Embed a "Transducer Quality Assessment" heuristic that inspects frame noise and immediately alerts operators if the acoustic scanning contact gel is insufficient, filtering out noisy clinic imagery.

#### Phase 3: NGO Partnership & Clinical Seeding (Months 13–18)
- Partner with international health programs to bypass commercial medical sales channels, deploying directly into community micro-clinics under monitored medical studies.`
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(seedProjects, null, 2), "utf-8");
      return seedProjects;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
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

// Qwen API integration parameters
function getQwenApiKey(): string | null {
  const key = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!key || key === "MY_QWEN_API_KEY" || key === "MY_DASHSCOPE_API_KEY") {
    return null;
  }
  return key;
}

function extractIdeaFromPrompt(prompt: string): string {
  const match1 = prompt.match(/User Idea:\s*["']([\s\S]+?)["']/i);
  if (match1 && match1[1]) return match1[1].trim();
  const match2 = prompt.match(/User Idea:\s*\n*([\s\S]+?)(?=\n---|\nUser|\n\d|\nYour|$)/i);
  if (match2 && match2[1]) return match2[1].trim();
  return "Decentralized enterprise network solution";
}

// AI Provider Abstraction Interface
export interface AIProvider {
  generate(prompt: string): Promise<string>;
}

// Gemini active provider using the official @google/genai SDK with exponential backoff and model auto-fallback
class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in your environment settings (Settings > Secrets). Please configure it to activate live analysis.");
    }
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    this.model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  }

  async generate(prompt: string): Promise<string> {
    const modelsToTry = [this.model];
    
    // Auto-fallback chain: if primary is gemini-3.5-flash, fall back to gemini-3.1-flash-lite
    if (this.model === "gemini-3.5-flash" || this.model === "gemini-flash-latest") {
      modelsToTry.push("gemini-3.1-flash-lite");
    } else if (!modelsToTry.includes("gemini-3.5-flash")) {
      modelsToTry.push("gemini-3.5-flash");
    }

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini Swarm] Querying model ${modelName} - Attempt ${attempt}/${maxRetries}`);
          const response = await this.ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });

          if (!response.text) {
            throw new Error("Empty response received from Gemini.");
          }
          
          console.log(`[Gemini Swarm] Successful response generation via ${modelName}`);
          return response.text;
        } catch (err: any) {
          lastError = err;
          const statusText = String(err.message || err);
          console.error(`[Gemini Swarm] Attempt ${attempt} failed on model ${modelName}. Error:`, statusText);

          // If it is a non-retryable config/security/parameters error, fail immediately
          if (
            statusText.includes("API_KEY") || 
            statusText.includes("INVALID_ARGUMENT") || 
            statusText.includes("API key not valid") ||
            statusText.includes("401") ||
            statusText.includes("403")
          ) {
            throw new Error(`Gemini API Auth/Config Error: ${statusText}`);
          }

          // If we have remaining attempts, pause with exponential delay before trying again
          if (attempt < maxRetries) {
            const delayMs = Math.pow(2, attempt) * 600 + Math.random() * 300;
            console.log(`[Gemini Swarm] Demands/Transient error. Waiting ${Math.round(delayMs)}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
      console.warn(`[Gemini Swarm] Model ${modelName} exhausted all ${maxRetries} attempts. Trying fallback model in chain...`);
    }

    // If all models and attempts are failed, format the final error nicely
    const errMsg = lastError?.message || String(lastError);
    throw new Error(`Gemini API Error (All models and retries exhausted): ${errMsg}`);
  }
}

// Qwen provider utilizing DashScope OpenAI-compatible API
class QwenProvider implements AIProvider {
  async generate(prompt: string): Promise<string> {
    const apiKey = getQwenApiKey();
    if (!apiKey) {
      throw new Error("Qwen API key (QWEN_API_KEY or DASHSCOPE_API_KEY) is not configured in your environment settings. Please specify the API key to activate live analysis.");
    }

    const url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    const model = process.env.QWEN_MODEL || "qwen-plus";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Aliyun DashScope Qwen API returned status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      const resultText = data.choices?.[0]?.message?.content;
      if (!resultText) {
        throw new Error("Invalid response structural envelope from Qwen API.");
      }
      return resultText;
    } catch (err: any) {
      console.error("Qwen API call error:", err);
      throw new Error(err.message || "Communication with Qwen API failed.");
    }
  }
}

// Factory to retrieve active provider based on environment config
function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (providerType === "qwen") {
    return new QwenProvider();
  }
  return new GeminiProvider();
}

// Helper to clean Markdown and parse JSON returned from AI solutions
function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

// REST Endpoints
app.get("/api/status", (req, res) => {
  const providerType = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const qwenKeyPresent = !!getQwenApiKey();
  
  let label = "Gemini Provider Active";
  if (providerType === "qwen") {
    label = qwenKeyPresent ? "Qwen Swarm API Active" : "Qwen Swarm API (Key Pending)";
  }

  res.json({
    activeProvider: providerType,
    providerLabel: label,
    currentTime: new Date().toISOString()
  });
});

app.get("/api/history", (req, res) => {
  try {
    const projects = readDB();
    // Return sorted newest to oldest
    const sorted = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/project/:id", (req, res) => {
  try {
    const { id } = req.params;
    const projects = readDB();
    const project = projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: `Project with ID ${id} not found` });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return res.status(400).json({ error: "Please submit a valid idea description." });
    }

    const trimmedIdea = idea.trim();
    const provider = getAIProvider();
    const providerName = (process.env.AI_PROVIDER || "gemini").toLowerCase();
    const providerLabel = providerName === "qwen" ? "Qwen" : "Gemini";
    console.log(`Starting ${providerLabel} Multi-Agent Boardroom execution for idea: "${trimmedIdea.substring(0, 60)}"`);

    // 1. Prepare prompts for Research, Critic, and Engineer agents
    const researchPrompt = `You are the Research Agent in a multi-agent innovation boardroom.

Your job is NOT to be helpful. Your job is to be accurate and reality-bound.

TASK:
Analyze the idea and expose real-world context, constraints, and existing solutions.

RULES:
- Focus on real-world feasibility and known systems
- Identify similar existing technologies or products
- Highlight constraints from physics, cost, infrastructure, or adoption
- Do NOT suggest solutions or improvements
- Do NOT align with other agents
- Be neutral, strict, and evidence-driven

BEHAVIOR:
- If the idea is common, say so directly
- If the idea is unrealistic, clearly state why
- If uncertain, state limitations instead of guessing

OUTPUT FORMAT:
- Existing Similar Systems
- Real-World Constraints
- Key Technical/Market Facts
- Feasibility Snapshot (Low / Medium / High with reason)

User Idea: "${trimmedIdea}"`;

    const criticPrompt = `You are the Critic Agent in a multi-agent innovation boardroom.

Your role is to aggressively challenge the idea and expose failure points.

RULES:
- Assume the idea will fail unless proven otherwise
- Actively search for technical, economic, and adoption failures
- Do NOT be polite
- Do NOT suggest improvements unless necessary to explain failure
- Challenge assumptions made by humans and other agents

FOCUS AREAS:
- Technical infeasibility
- Cost overruns
- Market rejection
- Scalability issues
- Safety/security risks
- Operational complexity

BEHAVIOR:
- Be direct and critical
- Identify at least 3 strong failure points
- If idea is strong, still find hidden risks

OUTPUT FORMAT:
- Major Failure Risks (bullet list)
- Why This Could Fail in Real World
- Worst-Case Scenario
- Critical Verdict (Not viable / risky / viable with conditions)

User Idea: "${trimmedIdea}"`;

    const engineerPrompt = `You are the Engineer Agent in a multi-agent innovation boardroom.

Your role is to design a realistic, buildable technical solution.

RULES:
- Stay grounded in real engineering constraints
- Prefer simple, scalable architectures
- Avoid overengineering or fantasy solutions
- Must respond to risks raised by Research and Critic agents

FOCUS:
- System architecture
- Tech stack selection
- Implementation steps
- Constraints handling
- MVP design only (not full product vision)

BEHAVIOR:
- Be practical, not optimistic
- Acknowledge limitations honestly
- Provide step-by-step build approach

OUTPUT FORMAT:
- System Architecture
- Tech Stack
- MVP Build Plan (phases)
- Key Technical Challenges
- Feasibility Adjustment (how to make it real)

User Idea: "${trimmedIdea}"`;

    console.log(`Polling ${providerLabel} API for individual agent perspectives in parallel...`);
    const [researchStr, criticStr, engineerStr] = await Promise.all([
      provider.generate(researchPrompt),
      provider.generate(criticPrompt),
      provider.generate(engineerPrompt)
    ]);

    console.log("Drafting Strategist synthesis using Research, Critic, and Engineer feedback...");

    // 2. Synthesize feedback and idea using the Strategist Agent
    const strategistPrompt = `You are the Strategist Agent in a multi-agent innovation boardroom.

Your role is to make the FINAL DECISION after reviewing all other agents.

INPUTS:
- Research analysis
- Critic analysis
- Engineer proposal

Original User Idea: "${trimmedIdea}"

Research Agent Analysis:
${researchStr}

Critic Agent Warnings:
${criticStr}

Lead Systems Engineer Blueprint:
${engineerStr}

RULES:
- Do NOT be neutral
- You MUST take a position
- Choose what is most realistic and valuable
- Resolve conflicts between agents
- Identify which agent is most correct and why
- Do NOT simply combine everything

FOCUS:
- Real-world viability
- Strategic direction
- MVP decision
- Market impact
- Execution clarity

BEHAVIOR:
- Confident decision-making
- Point out disagreements between agents
- Explicitly state what to ignore and what to keep
- Choose ONE clear direction

OUTPUT FORMAT:
Your response MUST be in JSON format matching the schema properties exactly.
Return a valid JSON object containing exactly these fields (with NO extra text, introductory words, or markdown wrapper around JSON):
{
  "score": <integer from 0 to 100 with justification>,
  "final_plan": "<detailed key-milestones roadmap text matching the Final MVP Plan in beautiful Markdown>",
  "strategist_synthesis": "<A comprehensive summary of the boardroom debate, explaining the Conflict Summary, What is Actually True, Final Decision (Go / Pivot / Reject), and detailed Reasoning with agent-by-agent verdict in Markdown>"
}

Ensure to escape double quotes correctly inside JSON values. Return ONLY the raw JSON object.`;

    const strategistRaw = await provider.generate(strategistPrompt);
    
    let strategistObj = {
      score: 75,
      final_plan: "Default synthesized strategy plan.",
      strategist_synthesis: "Synthesized verdict."
    };

    try {
      const parsed = cleanAndParseJSON(strategistRaw);
      if (typeof parsed.score === "number") strategistObj.score = parsed.score;
      if (parsed.final_plan) strategistObj.final_plan = parsed.final_plan;
      if (parsed.strategist_synthesis) {
        strategistObj.strategist_synthesis = parsed.strategist_synthesis;
      } else if (parsed.synthesis) {
        strategistObj.strategist_synthesis = parsed.synthesis;
      }
    } catch (parseErr) {
      console.error(`Failed to parse Strategist JSON response from ${providerLabel}, falling back safely. Content raw was: `, strategistRaw);
      // Fallback parser: search for "score" key or similar
      const scoreMatch = strategistRaw.match(/"score"\s*:\s*(\d+)/);
      if (scoreMatch) {
         strategistObj.score = parseInt(scoreMatch[1], 10);
      }
      strategistObj.final_plan = strategistRaw;
    }

    const savedId = "proj_api_" + Date.now();
    const newProject: Project = {
      id: savedId,
      idea: trimmedIdea,
      createdAt: new Date().toISOString(),
      research: researchStr,
      critic: criticStr,
      engineer: engineerStr,
      strategist: strategistObj.strategist_synthesis,
      score: strategistObj.score,
      final_plan: strategistObj.final_plan
    };

    const db = readDB();
    db.push(newProject);
    writeDB(db);

    console.log(`${providerLabel} assessment completed successfully. Project saved with ID: ${savedId}. Viability Score: ${newProject.score}%`);

    return res.json({
      research: newProject.research,
      critic: newProject.critic,
      engineer: newProject.engineer,
      strategist: newProject.strategist,
      score: newProject.score,
      final_plan: newProject.final_plan,
      saved_id: newProject.id
    });

  } catch (error: any) {
    console.error("Boardroom process failed:", error);
    res.status(500).json({ error: error.message || "An error occurred during multi-agent analysis." });
  }
});

// Configure Vite middleware in development or static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Force seeding DB on load in dev too
    readDB();
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SRASS SWARM BOARDROOM] Server initialized and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
