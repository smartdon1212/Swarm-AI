export type BoardVote =
  | 'Strong Approve'
  | 'Approve'
  | 'Neutral'
  | 'Concerned'
  | 'Reject';

export type Recommendation =
  | 'Proceed'
  | 'Proceed With Caution'
  | 'Pivot'
  | 'Reject';

export interface BoardVotes {
  market: BoardVote;
  risk: BoardVote;
  technical: BoardVote;
  strategic: BoardVote;
}

export interface BoardVoteSummary {
  strongApprove: number;
  approve: number;
  neutral: number;
  concerned: number;
  reject: number;
}

export interface BoardDecisionMemo {
  recommendation: Recommendation;
  confidenceScore: number;
  marketOpportunityScore: number;
  technicalFeasibilityScore: number;
  riskScore: number;
  executionDifficultyScore: number;
  keyOpportunities: string[];
  keyRisks: string[];
  recommendedNextActions: string[];
  decisionTriggers: string[];
  finalVerdict: string;
}

export interface Project {
  id: string;
  idea: string;
  createdAt: string;
  market: string;
  risk: string;
  technical: string;
  strategic: string;
  votes: BoardVotes;
  memo: BoardDecisionMemo;
  /** @deprecated Legacy field — mapped from market */
  research?: string;
  /** @deprecated Legacy field — mapped from risk */
  critic?: string;
  /** @deprecated Legacy field — mapped from technical */
  engineer?: string;
  /** @deprecated Legacy field — mapped from memo.finalVerdict */
  strategist?: string;
  /** @deprecated Legacy field — mapped from memo.confidenceScore */
  score?: number;
  /** @deprecated Legacy field */
  final_plan?: string;
}

export interface BoardMember {
  id: 'market' | 'risk' | 'technical' | 'strategic' | 'moderator';
  name: string;
  role: string;
  perspective: string;
  avatar: string;
  credentials: string;
  color: string;
  borderColor: string;
  accentColor: string;
}

export interface AgentResponse {
  analysis: string;
  vote: BoardVote;
}
