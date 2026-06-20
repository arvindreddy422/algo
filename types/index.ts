export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "pending" | "solved" | "bookmarked" | "review" | "skipped";
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  companyTags?: string[];
  url: string;
  
  // User Data
  status: ProblemStatus;
  attempts: number;
  notes?: string;
  solveTime?: number; // Last solve time in seconds
  solvedAt?: string; // ISO date string
  reviewDate?: string; // ISO date string
  confidence?: ConfidenceLevel;
}
