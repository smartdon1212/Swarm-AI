import type { Project, BoardVotes, BoardDecisionMemo } from '../types';

export function defaultVotes(): BoardVotes {
  return {
    market: 'Neutral',
    risk: 'Neutral',
    technical: 'Neutral',
    strategic: 'Neutral',
  };
}

export function defaultMemo(): BoardDecisionMemo {
  return {
    recommendation: 'Proceed With Caution',
    confidenceScore: 50,
    marketOpportunityScore: 50,
    technicalFeasibilityScore: 50,
    riskScore: 50,
    executionDifficultyScore: 50,
    keyOpportunities: [],
    keyRisks: [],
    recommendedNextActions: [],
    decisionTriggers: [],
    finalVerdict: '',
  };
}

/** Normalize API/history records that may use legacy field names */
export function normalizeProject(raw: Record<string, unknown>): Project {
  const memo = (raw.memo as BoardDecisionMemo) || defaultMemo();
  const legacyScore = typeof raw.score === 'number' ? raw.score : undefined;

  return {
    id: String(raw.id),
    idea: String(raw.idea),
    createdAt: String(raw.createdAt),
    market: String(raw.market || raw.research || ''),
    risk: String(raw.risk || raw.critic || ''),
    technical: String(raw.technical || raw.engineer || ''),
    strategic: String(raw.strategic || ''),
    votes: (raw.votes as BoardVotes) || defaultVotes(),
    memo: {
      ...defaultMemo(),
      ...memo,
      confidenceScore: memo.confidenceScore ?? legacyScore ?? 50,
      finalVerdict:
        memo.finalVerdict ||
        String(raw.strategist || raw.final_plan || ''),
    },
  };
}

export function getAgentContent(
  project: Project,
  agentId: 'market' | 'risk' | 'technical' | 'strategic'
): string {
  switch (agentId) {
    case 'market':
      return project.market;
    case 'risk':
      return project.risk;
    case 'technical':
      return project.technical;
    case 'strategic':
      return project.strategic;
  }
}

export function getAgentVote(
  project: Project,
  agentId: 'market' | 'risk' | 'technical' | 'strategic'
) {
  return project.votes?.[agentId] || 'Neutral';
}
