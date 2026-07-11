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
  final_plan: string;
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

