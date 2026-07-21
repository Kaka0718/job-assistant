export type PositionCategory =
  | "测试"
  | "开发"
  | "运营"
  | "产品"
  | "设计"
  | "运维"
  | "数据"
  | "其他";

export type PositionStatus = "active" | "archived";

export interface Position {
  id: string;
  title: string;
  category: PositionCategory;
  created: string;
  updated: string;
  status: PositionStatus;
  skills: string[];
  tags: string[];
  notes?: string;
  analysis?: string;
  interviewQuestions?: string;
}

export interface CreatePositionInput {
  title: string;
  category: PositionCategory;
  skills: string[];
  tags: string[];
  notes?: string;
  analysis?: string;
  interviewQuestions?: string;
}

export interface UpdatePositionInput {
  title?: string;
  category?: PositionCategory;
  status?: PositionStatus;
  skills?: string[];
  tags?: string[];
  notes?: string;
  analysis?: string;
  interviewQuestions?: string;
}