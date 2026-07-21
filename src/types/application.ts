export type ApplicationStatus =
  | "draft"
  | "applied"
  | "read"
  | "chatting"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

export interface Application {
  id: string;
  positionId: string;
  company: string;
  positionTitle: string;
  created: string;
  matchScore?: number;
  hasProgress: boolean;
  keywords: string[];
  jdContent?: string;
  greeting?: string;
  status: ApplicationStatus;
}

export interface ApplicationFilter {
  status?: ApplicationStatus;
  positionId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateApplicationInput {
  positionId: string;
  company: string;
  positionTitle: string;
  matchScore?: number;
  keywords: string[];
  jdContent?: string;
  greeting?: string;
}

export interface UpdateApplicationInput {
  hasProgress?: boolean;
  status?: ApplicationStatus;
  keywords?: string[];
  greeting?: string;
}