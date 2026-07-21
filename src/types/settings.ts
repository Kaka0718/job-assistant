export type AIProvider = "deepseek" | "openai" | "anthropic";
export type ThemeMode = "light" | "dark" | "system";

export interface Settings {
  ai: AISettings;
  app: AppSettings;
}

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
}

export interface AppSettings {
  theme: ThemeMode;
  language: "zh-CN" | "en";
  dataDir: string;
}