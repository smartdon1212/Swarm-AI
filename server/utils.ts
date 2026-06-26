import type {
  AgentResponse,
  BoardDecisionMemo,
  BoardVote,
  BoardVoteSummary,
  BoardVotes,
  Recommendation,
} from '../src/types.js';

const VALID_VOTES: BoardVote[] = [
  'Strong Approve',
  'Approve',
  'Neutral',
  'Concerned',
  'Reject',
];

const VALID_RECOMMENDATIONS: Recommendation[] = [
  'Proceed',
  'Proceed With Caution',
  'Pivot',
  'Reject',
];

export function cleanAndParseJSON(raw: string): unknown {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }
  return JSON.parse(cleaned);
}

function clampScore(value: unknown, fallback = 50): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (Number.isNaN(num)) return fallback;
  return Math.min(100, Math.max(0, num));
}

function normalizeVote(raw: unknown): BoardVote {
  const str = String(raw || '').trim();
  const match = VALID_VOTES.find(
    (v) => v.toLowerCase() === str.toLowerCase()
  );
  return match || 'Neutral';
}

function normalizeRecommendation(raw: unknown): Recommendation {
  const str = String(raw || '').trim();
  const match = VALID_RECOMMENDATIONS.find(
    (r) => r.toLowerCase() === str.toLowerCase()
  );
  return match || 'Proceed With Caution';
}

function normalizeStringArray(raw: unknown, fallback: string[]): string[] {
  if (!Array.isArray(raw)) return fallback;
  const items = raw.map((item) => String(item).trim()).filter(Boolean);
  return items.length > 0 ? items : fallback;
}

export function parseAgentResponse(raw: string): AgentResponse {
  try {
    const parsed = cleanAndParseJSON(raw) as Record<string, unknown>;
    return {
      analysis: String(parsed.analysis || raw),
      vote: normalizeVote(parsed.vote),
    };
  } catch {
    return { analysis: raw, vote: 'Neutral' };
  }
}

export function parseModeratorResponse(raw: string): BoardDecisionMemo {
  const fallback: BoardDecisionMemo = {
    recommendation: 'Proceed With Caution',
    confidenceScore: 50,
    marketOpportunityScore: 50,
    technicalFeasibilityScore: 50,
    riskScore: 50,
    executionDifficultyScore: 50,
    keyOpportunities: ['Further market validation required'],
    keyRisks: ['Insufficient structured data from board synthesis'],
    recommendedNextActions: ['Re-run analysis with more detail on the submission'],
    decisionTriggers: ['New competitive or regulatory information'],
    finalVerdict: raw,
  };

  try {
    const parsed = cleanAndParseJSON(raw) as Record<string, unknown>;
    return {
      recommendation: normalizeRecommendation(parsed.recommendation),
      confidenceScore: clampScore(parsed.confidenceScore, 50),
      marketOpportunityScore: clampScore(parsed.marketOpportunityScore, 50),
      technicalFeasibilityScore: clampScore(parsed.technicalFeasibilityScore, 50),
      riskScore: clampScore(parsed.riskScore, 50),
      executionDifficultyScore: clampScore(parsed.executionDifficultyScore, 50),
      keyOpportunities: normalizeStringArray(parsed.keyOpportunities, fallback.keyOpportunities),
      keyRisks: normalizeStringArray(parsed.keyRisks, fallback.keyRisks),
      recommendedNextActions: normalizeStringArray(parsed.recommendedNextActions, fallback.recommendedNextActions),
      decisionTriggers: normalizeStringArray(parsed.decisionTriggers, fallback.decisionTriggers),
      finalVerdict: String(parsed.finalVerdict || fallback.finalVerdict),
    };
  } catch {
    const scoreMatch = raw.match(/"confidenceScore"\s*:\s*(\d+)/);
    if (scoreMatch) {
      fallback.confidenceScore = clampScore(parseInt(scoreMatch[1], 10));
    }
    return fallback;
  }
}

export function summarizeVotes(votes: BoardVotes): BoardVoteSummary {
  const summary: BoardVoteSummary = {
    strongApprove: 0,
    approve: 0,
    neutral: 0,
    concerned: 0,
    reject: 0,
  };

  for (const vote of Object.values(votes)) {
    switch (vote) {
      case 'Strong Approve':
        summary.strongApprove++;
        break;
      case 'Approve':
        summary.approve++;
        break;
      case 'Neutral':
        summary.neutral++;
        break;
      case 'Concerned':
        summary.concerned++;
        break;
      case 'Reject':
        summary.reject++;
        break;
    }
  }

  return summary;
}
