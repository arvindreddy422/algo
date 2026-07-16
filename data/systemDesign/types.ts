export type Difficulty = 1 | 2 | 3; // 1: Beginner, 2: Intermediate, 3: Advanced

export interface Resource {
  id: string;
  type: "blog" | "video" | "paper";
  title: string;
  company?: string;
  url: string;
  readTime?: number; // in minutes
  duration?: number; // in minutes (for video)
  tags: string[];
  publishedDate?: string;
  relevance?: "high" | "medium" | "low";
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  category: "Databases" | "APIs & Communication" | "Scalability" | "Distributed Systems" | "Real-time Systems" | "Search & Analytics" | "High Availability";
  difficulty: Difficulty;
  description: string;
  whyItMatters: string;
  learningObjectives: string[];
  keyConcepts: string[];
  resources: Resource[];
  relatedTopics: string[];
  interviewQuestions: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  companies: string[];
  estimatedTime: number; // in minutes
  keyConcepts: string[];
  relatedTopics: string[];
  resources: Resource[];
  interviewTips: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  company: string;
  companyId: string;
  url: string;
  publishedDate: string;
  excerpt: string;
  tags: string[];
  readTime: number; // in minutes
  type: "blog";
  isRead?: boolean;
  relatedTopics: string[];
  source: "manual" | "rss";
}

export interface CurriculumWeek {
  id: string;
  title: string;
  focusArea: string;
  description: string;
  topics: string[];
}
