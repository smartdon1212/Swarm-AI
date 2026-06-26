import type { BoardVotes, BoardVoteSummary } from '../types';

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
