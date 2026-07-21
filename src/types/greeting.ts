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