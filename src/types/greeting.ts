export interface GreetingResult {
  greeting: string;
  analysis: GreetingAnalysis;
}

export interface GreetingAnalysis {
  matchScore: number;
  highlights: string[];
  gaps: string[];
  suggestions: string[];
  keyRequirements: string[];
}

export interface GreetingVersion {
  id: string;
  positionId: string;
  positionTitle: string;
  company: string;
  jdContent: string;
  selectedKeywords?: string[];
  result: GreetingResult;
  createdAt: string; // ISO 8601
}