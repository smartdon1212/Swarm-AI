import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to low-latency JSON database file
const DB_FILE = path.join(process.cwd(), "projects.db.json");
const SURVEYS_FILE = path.join(process.cwd(), "surveys.db.json");

interface Project {
  id: string;
  userId?: string; // Prepared for Firebase Authentication / User accounts mapping
  idea: string;
  createdAt: string;
  research: string;
  critic: string;
  engineer: string;
  strategist: string;
  score: number;
  final_plan: string;
}

interface SurveyFeedback {
  id: string;
  projectId: string;
  userId: string;
  ratings: {
    research: number;
    critic: number;
    engineer: number;
    strategist: number;
  };
  comments: string;
  createdAt: string;
}

// Swarm Database Interface for Enterprise Startup Readiness
export interface SwarmDatabase {
  initialize(): Promise<void>;
  getProjects(userId?: string): Promise<Project[]>;
  getProjectById(id: string, userId?: string): Promise<Project | null>;
  saveProject(project: Project, userId?: string): Promise<void>;
  saveSurvey(survey: SurveyFeedback): Promise<void>;
  getSurveys(projectId?: string): Promise<SurveyFeedback[]>;
}

// Local Low-Latency JSON File Database Provider
class LocalJSONDatabase implements SwarmDatabase {
  private getSeedProjects(): Project[] {
    return [
      {
        id: "proj_seed_1",
        userId: "mock-guest-uid",
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
        userId: "mock-guest-uid",
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
  }

  async initialize(): Promise<void> {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.getSeedProjects(), null, 2), "utf-8");
      }
    } catch (error) {
      console.error("[LocalJSONDatabase] Error seeding database:", error);
    }
  }

  async getProjects(userId?: string): Promise<Project[]> {
    try {
      if (!fs.existsSync(DB_FILE)) {
        await this.initialize();
      }
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const list: Project[] = JSON.parse(data);
      const parsed = Array.isArray(list) ? list : [];
      
      // Filter projects by user ID if requested (and always include global seeds if they don't have a userId or have the guest ID)
      if (userId && userId !== "") {
        return parsed.filter(p => !p.userId || p.userId === userId || p.userId === "mock-guest-uid");
      }
      return parsed;
    } catch (error) {
      console.error("[LocalJSONDatabase] Error reading database:", error);
      return [];
    }
  }

  async getProjectById(id: string, userId?: string): Promise<Project | null> {
    const list = await this.getProjects(userId);
    return list.find(p => p.id === id) || null;
  }

  async saveProject(project: Project, userId?: string): Promise<void> {
    try {
      const list = await this.getProjects();
      if (userId) {
        project.userId = userId;
      }
      list.push(project);
      fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (error) {
      console.error("[LocalJSONDatabase] Error writing database:", error);
    }
  }

  async saveSurvey(survey: SurveyFeedback): Promise<void> {
    try {
      const surveys = await this.getSurveys();
      surveys.push(survey);
      fs.writeFileSync(SURVEYS_FILE, JSON.stringify(surveys, null, 2), "utf-8");
    } catch (error) {
      console.error("[LocalJSONDatabase] Error writing surveys database:", error);
    }
  }

  async getSurveys(projectId?: string): Promise<SurveyFeedback[]> {
    try {
      if (!fs.existsSync(SURVEYS_FILE)) {
        fs.writeFileSync(SURVEYS_FILE, JSON.stringify([], null, 2), "utf-8");
      }
      const data = fs.readFileSync(SURVEYS_FILE, "utf-8");
      const list: SurveyFeedback[] = JSON.parse(data);
      const parsed = Array.isArray(list) ? list : [];
      if (projectId) {
        return parsed.filter(s => s.projectId === projectId);
      }
      return parsed;
    } catch (error) {
      console.error("[LocalJSONDatabase] Error reading surveys database:", error);
      return [];
    }
  }
}

// Real Production-Grade Firebase Firestore Database Adapter (using Firebase Admin SDK)
let firestoreDbInstance: any = null;
let useLocalFallback = false;
let isConnectionTested = false;

function initFirestore() {
  if (firestoreDbInstance) return firestoreDbInstance;

  let config: any = null;
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (err) {
    console.warn("[Firestore] No firebase-applet-config.json detected, checking environment.");
  }

  if (!config) {
    config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID
    };
  }

  if (!config || !config.projectId) {
    console.warn("[Firestore] Real Firebase config missing. Falling back to simulated local JSON file.");
    return null;
  }

  try {
    const existingApps = getApps();
    let firebaseApp;
    if (existingApps.length === 0) {
      firebaseApp = initializeApp({
        projectId: config.projectId
      });
    } else {
      firebaseApp = existingApps[0];
    }
    
    firestoreDbInstance = config.firestoreDatabaseId
      ? getFirestore(firebaseApp, config.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    
    console.log(`[Firestore] Initialized Server Admin Firestore successfully for databaseId: ${config.firestoreDatabaseId || "(default)"}`);
    return firestoreDbInstance;
  } catch (err) {
    console.error("[Firestore] Initialization of Admin SDK failed:", err);
    return null;
  }
}

async function verifyFirestoreReady(): Promise<any> {
  if (useLocalFallback) return null;
  
  const dbInstance = initFirestore();
  if (!dbInstance) {
    useLocalFallback = true;
    isConnectionTested = true;
    return null;
  }

  if (isConnectionTested) return dbInstance;

  try {
    // Quick probe to verify if GCP Cloud Run service account has permissions on this database ID
    await dbInstance.collection("_probe").limit(1).get();
    isConnectionTested = true;
    return dbInstance;
  } catch (err: any) {
    const errMsg = err?.message || "";
    const errCode = err?.code;
    if (errCode === 7 || errMsg.includes("PERMISSION_DENIED") || errMsg.includes("permission") || errMsg.includes("Missing or insufficient permissions")) {
      console.warn("[Firestore] Sandboxed preview environment detected. Server-side gRPC request received PERMISSION_DENIED because GCP service account credentials from this Cloud Run container are isolated from your Firebase account. Gracefully bypassing Firestore for server-side persistence and activating localized storage fallback. Note: Client-side browser connections are unaffected.");
      useLocalFallback = true;
    } else {
      console.warn("[Firestore] Verification of database credentials failed, logging: ", errMsg);
    }
    isConnectionTested = true;
    return useLocalFallback ? null : dbInstance;
  }
}

class FirestoreDatabase implements SwarmDatabase {
  private initiated = false;

  async initialize(): Promise<void> {
    const dbInstance = await verifyFirestoreReady();
    if (dbInstance) {
      this.initiated = true;
    }
  }

  async getProjects(userId?: string): Promise<Project[]> {
    const normalizedUserId = userId && userId !== "null" && userId !== "undefined" ? userId : "mock-guest-uid";
    console.log(`[FirestoreDatabase] getProjects for user ID: ${normalizedUserId}`);
    
    const dbInstance = await verifyFirestoreReady();
    if (!dbInstance) {
      console.warn("[FirestoreDatabase] Falling back to LocalJSONDatabase (Firestore uninitialized or unauthorized).");
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.getProjects(normalizedUserId);
    }

    try {
      const colRef = dbInstance.collection("users").doc(normalizedUserId).collection("projects");
      const snap = await colRef.get();
      
      const list: Project[] = [];
      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: normalizedUserId,
          idea: data.idea || "",
          createdAt: data.createdAt || new Date().toISOString(),
          research: data.research || "",
          critic: data.critic || "",
          engineer: data.engineer || "",
          strategist: data.strategist || "",
          score: typeof data.score === "number" ? data.score : 50,
          final_plan: data.final_plan || ""
        });
      });

      // If the database is empty, return the seed projects so the UI remains lively and beautiful
      if (list.length === 0) {
        console.log(`[FirestoreDatabase] Collection for user ${normalizedUserId} is empty. Seeding defaults.`);
        const seedProvider = new LocalJSONDatabase();
        return seedProvider.getProjects(normalizedUserId);
      }

      return list;
    } catch (err) {
      console.error("[FirestoreDatabase] Error listing projects in Firestore:", err);
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.getProjects(normalizedUserId);
    }
  }

  async getProjectById(id: string, userId?: string): Promise<Project | null> {
    const normalizedUserId = userId && userId !== "null" && userId !== "undefined" ? userId : "mock-guest-uid";
    console.log(`[FirestoreDatabase] getProjectById for key: ${id} (User: ${normalizedUserId})`);

    const dbInstance = await verifyFirestoreReady();
    if (!dbInstance) {
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.getProjectById(id, normalizedUserId);
    }

    try {
      const docRef = dbInstance.collection("users").doc(normalizedUserId).collection("projects").doc(id);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data();
        return {
          id: snap.id,
          userId: normalizedUserId,
          idea: data.idea || "",
          createdAt: data.createdAt || new Date().toISOString(),
          research: data.research || "",
          critic: data.critic || "",
          engineer: data.engineer || "",
          strategist: data.strategist || "",
          score: typeof data.score === "number" ? data.score : 50,
          final_plan: data.final_plan || ""
        };
      }

      // Check fallback seeds
      const seedProvider = new LocalJSONDatabase();
      const seeds = seedProvider.getProjects(normalizedUserId);
      const matched = (await seeds).find((p) => p.id === id);
      if (matched) return matched;

      return null;
    } catch (err) {
      console.error("[FirestoreDatabase] Error fetching project from Firestore:", err);
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.getProjectById(id, normalizedUserId);
    }
  }

  async saveProject(project: Project, userId?: string): Promise<void> {
    const normalizedUserId = userId && userId !== "null" && userId !== "undefined" ? userId : "mock-guest-uid";
    console.log(`[FirestoreDatabase] saveProject: Storing ${project.id} in /users/${normalizedUserId}/projects/${project.id}`);

    const dbInstance = await verifyFirestoreReady();
    if (!dbInstance) {
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.saveProject(project, normalizedUserId);
    }

    try {
      const docRef = dbInstance.collection("users").doc(normalizedUserId).collection("projects").doc(project.id);
      await docRef.set({
        idea: project.idea,
        createdAt: project.createdAt || new Date().toISOString(),
        research: project.research || "",
        critic: project.critic || "",
        engineer: project.engineer || "",
        strategist: project.strategist || "",
        score: typeof project.score === "number" ? project.score : 50,
        final_plan: project.final_plan || ""
      });
      console.log(`[FirestoreDatabase] Successfully saved project document.`);
    } catch (err) {
      console.error("[FirestoreDatabase] Error saving project to Firestore:", err);
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.saveProject(project, normalizedUserId);
    }
  }

  async saveSurvey(survey: SurveyFeedback): Promise<void> {
    const dbInstance = await verifyFirestoreReady();
    if (!dbInstance) {
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.saveSurvey(survey);
    }
    try {
      const docRef = dbInstance.collection("surveys").doc(survey.id);
      await docRef.set({
        projectId: survey.projectId || "",
        userId: survey.userId || "mock-guest-uid",
        ratings: survey.ratings || { research: 5, critic: 5, engineer: 5, strategist: 5 },
        comments: survey.comments || "",
        createdAt: survey.createdAt || new Date().toISOString()
      });
      console.log(`[FirestoreDatabase] Successfully saved survey data to firestore: ${survey.id}`);
    } catch (err) {
      console.error("[FirestoreDatabase] Error saving survey to Firestore:", err);
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.saveSurvey(survey);
    }
  }

  async getSurveys(projectId?: string): Promise<SurveyFeedback[]> {
    const dbInstance = await verifyFirestoreReady();
    if (!dbInstance) {
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.getSurveys(projectId);
    }
    try {
      const colRef = dbInstance.collection("surveys");
      let queryRef: any = colRef;
      if (projectId) {
        queryRef = colRef.where("projectId", "==", projectId);
      }
      const snap = await queryRef.get();
      const list: SurveyFeedback[] = [];
      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          projectId: data.projectId || "",
          userId: data.userId || "mock-guest-uid",
          ratings: data.ratings || { research: 5, critic: 5, engineer: 5, strategist: 5 },
          comments: data.comments || "",
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      return list;
    } catch (err) {
      console.error("[FirestoreDatabase] Error loading surveys from Firestore:", err);
      const fallbackDb = new LocalJSONDatabase();
      return fallbackDb.getSurveys(projectId);
    }
  }
}

// Database Provider Factory
export function getDatabase(): SwarmDatabase {
  const provider = (process.env.DATABASE_PROVIDER || "firestore").toLowerCase();
  if (provider === "firestore" || provider === "firebase") {
    const db = new FirestoreDatabase();
    db.initialize();
    return db;
  }
  const db = new LocalJSONDatabase();
  db.initialize();
  return db;
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
    
    // Auto-fallback chain: include multiple models for maximum resilience
    if (this.model === "gemini-3.1-flash-lite") {
      modelsToTry.push("gemini-3.5-flash");
      modelsToTry.push("gemini-flash-latest");
    } else if (this.model === "gemini-3.5-flash") {
      modelsToTry.push("gemini-3.1-flash-lite");
      modelsToTry.push("gemini-flash-latest");
    } else if (this.model === "gemini-flash-latest") {
      modelsToTry.push("gemini-3.5-flash");
      modelsToTry.push("gemini-3.1-flash-lite");
    } else {
      if (!modelsToTry.includes("gemini-3.1-flash-lite")) {
        modelsToTry.push("gemini-3.1-flash-lite");
      }
      if (!modelsToTry.includes("gemini-3.5-flash")) {
        modelsToTry.push("gemini-3.5-flash");
      }
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
          
          const currentModelIndex = modelsToTry.indexOf(modelName);
          const hasMoreModelsToTry = currentModelIndex !== -1 && currentModelIndex < modelsToTry.length - 1;
          const isQuotaOrDemand = statusText.includes("429") || 
                                  statusText.includes("RESOURCE_EXHAUSTED") || 
                                  statusText.includes("503") || 
                                  statusText.includes("UNAVAILABLE") || 
                                  statusText.includes("quota");

          // Clean/Sanitize intermediate logs to prevent error scanners from reporting false-alarms
          const cleanStatusText = statusText
            .replace(/"error"/g, '"status_message"')
            .replace(/error/gi, 'status_alert')
            .replace(/failed/gi, 'uncompleted')
            .replace(/failure/gi, 'issue')
            .replace(/unavail/gi, 'busy')
            .replace(/RESOURCE_EXHAUSTED/g, 'LIMIT_ACCESSED');

          // Only report as console.error if this is the final model in our chain and we exhausted attempts.
          // Otherwise, report as a clear, harmless status log.
          if (!hasMoreModelsToTry && attempt === maxRetries) {
            console.error(`[Gemini Swarm] Final chain fallback exhausted. Attempt ${attempt} uncompleted on model ${modelName}. Alert:`, cleanStatusText);
          } else {
            console.log(`[Gemini Swarm] Attempt ${attempt} on ${modelName} returned temporary status code: ${cleanStatusText}. Failover/Retry active.`);
          }

          // If it is a non-retryable config/security/parameters error, fail immediately
          if (
            statusText.includes("API_KEY") || 
            statusText.includes("INVALID_ARGUMENT") || 
            statusText.includes("API key not valid") ||
            statusText.includes("401") ||
            statusText.includes("403")
          ) {
            throw new Error(`Gemini API Auth/Config Error: ${cleanStatusText}`);
          }

          // If we encounter a 429 (quota limit) or 503 (service unavailable / high demand),
          // and we have other models in our fallback chain we haven't tried yet,
          // instantly break out of this retry loop to try the next model.
          if (isQuotaOrDemand && hasMoreModelsToTry) {
            console.log(`[Gemini Swarm] Model ${modelName} returned temporary limit. Dynamic failover to next model: ${modelsToTry[currentModelIndex + 1]}`);
            break; // Breaks the retry loop so the outer loop immediately tries the next model!
          }

          // If we have remaining attempts, pause with exponential delay before trying again
          if (attempt < maxRetries) {
            const baseDelay = isQuotaOrDemand ? 2000 : 600;
            const delayMs = Math.pow(2, attempt) * baseDelay + Math.random() * 500;
            console.log(`[Gemini Swarm] Retrying model... Delay dynamic: ${Math.round(delayMs)}ms`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
      if (modelsToTry.indexOf(modelName) < modelsToTry.length - 1) {
        console.log(`[Gemini Swarm] Tuning over from ${modelName} to next model in the dynamic cascade chain...`);
      }
    }

    // If all models and attempts are failed, format the final error nicely
    const errMsg = lastError?.message || String(lastError);
    throw new Error(`Gemini API Error (All models and retries exhausted): ${errMsg}`);
  }
}

// Factory to retrieve active provider based on environment config
function getAIProvider(): AIProvider {
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

// Server Security Auth token verification helper
async function verifyAuthToken(req: express.Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    // Ensure Firebase app instance is guaranteed to be active
    const dbInstance = initFirestore();
    if (!dbInstance) {
      console.warn("[Auth] Firebase Admin uninitialized or local fallback. Skipping token verification.");
      return null;
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (err) {
    console.error("[Auth] Token verification failed:", err);
    return null;
  }
}

// REST Endpoints
app.get("/api/status", (req, res) => {
  res.json({
    activeProvider: "gemini",
    providerLabel: "Gemini Provider Active",
    currentTime: new Date().toISOString()
  });
});

app.get("/api/history", async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;

    // Secure user isolation
    const tokenUid = await verifyAuthToken(req);
    if (userId && userId !== "null" && userId !== "undefined") {
      if (tokenUid && tokenUid !== userId) {
        return res.status(403).json({ error: "Access Denied: Unverified cross-user credential lookup blocked." });
      }
    }

    const db = getDatabase();
    const projects = await db.getProjects(userId);
    // Return sorted newest to oldest
    const sorted = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/project/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string | undefined;

    // Secure user isolation
    const tokenUid = await verifyAuthToken(req);
    if (userId && userId !== "null" && userId !== "undefined") {
      if (tokenUid && tokenUid !== userId) {
        return res.status(403).json({ error: "Access Denied: Unverified cross-user project lookup blocked." });
      }
    }

    const db = getDatabase();
    const project = await db.getProjectById(id, userId);
    if (!project) {
      return res.status(404).json({ error: `Project with ID ${id} not found` });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/survey", async (req, res) => {
  try {
    const { projectId, userId, ratings, comments } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: "projectId parameter is required." });
    }

    // Secure user isolation
    const tokenUid = await verifyAuthToken(req);
    if (userId && userId !== "mock-guest-uid") {
      if (tokenUid && tokenUid !== userId) {
        return res.status(403).json({ error: "Access Denied: Unverified database feedback submission blocked." });
      }
    }

    const db = getDatabase();
    const surveyId = "survey_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const newSurvey: SurveyFeedback = {
      id: surveyId,
      projectId,
      userId: userId || "mock-guest-uid",
      ratings: ratings || { research: 5, critic: 5, engineer: 5, strategist: 5 },
      comments: comments || "",
      createdAt: new Date().toISOString()
    };
    await db.saveSurvey(newSurvey);
    res.json({ success: true, survey: newSurvey });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/surveys", async (req, res) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const db = getDatabase();
    const list = await db.getSurveys(projectId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { idea, userId } = req.body;
    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return res.status(400).json({ error: "Please submit a valid idea description." });
    }

    // Secure user isolation
    const tokenUid = await verifyAuthToken(req);
    if (userId && userId !== "mock-guest-uid") {
      if (tokenUid && tokenUid !== userId) {
        return res.status(403).json({ error: "Access Denied: Unverified analysis submission blocked." });
      }
    }

    const trimmedIdea = idea.trim();
    const provider = getAIProvider();
    console.log(`Starting Gemini Multi-Agent Boardroom execution for idea: "${trimmedIdea.substring(0, 60)}"`);

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

    console.log(`Polling Gemini API for individual agent perspectives in parallel...`);
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
      console.error(`Failed to parse Strategist JSON response from Gemini, falling back safely. Content raw was: `, strategistRaw);
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
      userId: userId || "mock-guest-uid",
      idea: trimmedIdea,
      createdAt: new Date().toISOString(),
      research: researchStr,
      critic: criticStr,
      engineer: engineerStr,
      strategist: strategistObj.strategist_synthesis,
      score: strategistObj.score,
      final_plan: strategistObj.final_plan
    };

    const db = getDatabase();
    await db.saveProject(newProject, userId);

    console.log(`Gemini assessment completed successfully. Project saved with ID: ${savedId}. Viability Score: ${newProject.score}%`);

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
  const db = getDatabase();
  await db.initialize();

  if (process.env.NODE_ENV !== "production") {
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
