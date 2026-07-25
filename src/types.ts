export interface AttachmentMetadata {
  name: string;
  mimeType: string;
  size?: number;
}

export interface AttachmentFile {
  name: string;
  mimeType: string;
  base64: string;
  size: number;
}

export interface SubScores {
  market: number;         // 0-100 (Dr. Evelyn Carter's market findings)
  riskSurvival: number;   // 0-100 (Julian Vance's inverted risk severity score)
  techFeasibility: number;// 0-100 (Chief Architect Linus's build feasibility score)
}

export interface SubScoreWeights {
  market: number;         // default 0.35
  riskSurvival: number;   // default 0.35
  techFeasibility: number;// default 0.30
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AgentFollowUp {
  agentId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface Project {
  id: string;
  userId?: string;
  idea: string;
  createdAt: string;
  research: string;
  critic: string;
  engineer: string;
  strategist: string;
  score: number;
  subScores?: SubScores;
  subScoreWeights?: SubScoreWeights;
  final_plan: string;
  attachments?: AttachmentMetadata[];
  groundingSources?: GroundingSource[];
  followUps?: Record<string, AgentFollowUp[]>;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  credentials: string;
  color: string;
  borderColor: string;
  accentColor: string;
}

export interface SurveyFeedback {
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


