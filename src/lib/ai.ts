import type { Profile } from "@/types/profile";
import type { Position } from "@/types/position";
import type { Settings } from "@/types/settings";
import type { GreetingResult } from "@/types/greeting";

// ──────────────────────────────────────────────
// Core Prompt — System Prompt
// ──────────────────────────────────────────────

const SYSTEM_PROMPT = `你是一个求职助手，帮助求职者生成个性化的打招呼文案和岗位分析。你需要根据求职者的个人档案和招聘岗位的 JD，生成合适的打招呼内容。

## 输出格式要求
请严格按照以下 JSON 格式输出，不要包含其他内容：

{
  "greeting": "生成的打招呼文案，50-100字，语气礼貌专业，突出匹配点",
  "analysis": {
    "matchScore": 85,
    "highlights": ["亮点1", "亮点2", "亮点3"],
    "gaps": ["不足1", "不足2"],
    "suggestions": ["建议1", "建议2"],
    "keyRequirements": ["硬性要求1", "硬性要求2"]
  }
}

## 打招呼文案要求（严格遵循）
- 语气礼貌、专业
- 突出个人与岗位的匹配点
- 控制 50-100 字
- 不要包含联系方式
- 不要过度承诺
- ⚠️ 强制要求：必须在文案中自然融入 1-2 个来自 JD 的具体关键词
  （如"自动化测试体系"、"性能调优"、"用户增长策略" —— 不是泛泛的"测试"、"开发"）
  这些关键词应嵌入到描述个人经验的句子中，而非生硬列举
- 必须包含公司名称，自然融入开头

## 深度分析要求
- matchScore：0-100 的匹配度评分
- highlights：候选人最匹配该岗位的 2-3 个亮点
- gaps：候选人可能欠缺的方面
- suggestions：针对该岗位的投递建议
- keyRequirements：该岗位最关键的 2-3 个硬性要求`;

// ──────────────────────────────────────────────
// User Message Builder
// ──────────────────────────────────────────────

function buildUserMessage(
  profile: Profile,
  position: Position,
  jdContent: string,
): string {
  const sections: string[] = [];

  sections.push("请根据以下信息生成打招呼文案：\n");

  // Profile section
  const profileLines: string[] = [
    "## 我的个人档案",
    `姓名：${profile.name}`,
    `当前职位：${profile.title}`,
    `城市：${profile.city}`,
    `工作年限：${profile.yearsOfExperience}年`,
    `技能：${profile.skills.join("、")}`,
  ];
  if (profile.workExperience) {
    profileLines.push(`\n工作经历：\n${profile.workExperience}`);
  }
  if (profile.projects) {
    profileLines.push(`\n项目经历：\n${profile.projects}`);
  }
  if (profile.education) {
    profileLines.push(`\n教育背景：\n${profile.education}`);
  }
  sections.push(profileLines.join("\n"));

  // Position section
  const positionLines: string[] = [
    "\n## 目标岗位档案",
    `岗位名称：${position.title}`,
    `分类：${position.category}`,
    `技能要求：${position.skills.join("、")}`,
  ];
  if (position.analysis) {
    positionLines.push(`\n个人匹配分析：\n${position.analysis}`);
  }
  sections.push(positionLines.join("\n"));

  // JD section
  sections.push(`\n## 招聘岗位 JD\n${jdContent}`);

  // Final instruction
  sections.push(
    "\n请确保打招呼中自然融入公司名称和 JD 中的 1-2 个具体岗位关键词。",
  );

  return sections.join("\n\n");
}

// ──────────────────────────────────────────────
// Request Builder
// ──────────────────────────────────────────────

function buildRequestBody(
  settings: Settings,
  systemPrompt: string,
  userMessage: string,
) {
  return {
    model: settings.ai.model,
    messages: [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ],
    temperature: settings.ai.temperature,
    max_tokens: settings.ai.maxTokens,
  };
}

// ──────────────────────────────────────────────
// API Call
// ──────────────────────────────────────────────

async function callAIAPI(
  settings: Settings,
  systemPrompt: string,
  userMessage: string,
  signal?: AbortSignal,
): Promise<string> {
  const baseUrl = settings.ai.baseUrl.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.ai.apiKey}`,
    },
    body: JSON.stringify(
      buildRequestBody(settings, systemPrompt, userMessage),
    ),
    signal,
  });

  if (response.status === 401) {
    throw new Error("API Key 无效，请检查设置");
  }
  if (response.status === 402 || response.status === 429) {
    throw new Error("API 余额不足，请充值");
  }
  if (!response.ok) {
    throw new Error(`API 请求失败 (${response.status})`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

// ──────────────────────────────────────────────
// Response Parser
// ──────────────────────────────────────────────

function parseGreetingResult(raw: string): GreetingResult {
  try {
    // Extract JSON block from response (handles extra text around it)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("未找到 JSON 格式的响应");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.greeting || !parsed.analysis) {
      throw new Error("响应格式不完整");
    }

    return {
      greeting: parsed.greeting,
      analysis: {
        matchScore: parsed.analysis.matchScore ?? 0,
        highlights: parsed.analysis.highlights ?? [],
        gaps: parsed.analysis.gaps ?? [],
        suggestions: parsed.analysis.suggestions ?? [],
        keyRequirements: parsed.analysis.keyRequirements ?? [],
      },
    };
  } catch {
    // Fallback: display raw content as greeting
    return {
      greeting: raw,
      analysis: {
        matchScore: 0,
        highlights: [],
        gaps: [],
        suggestions: [],
        keyRequirements: [],
      },
    };
  }
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const MAX_JD_LENGTH = 8000;
const TIMEOUT_MS = 30_000;

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Generate a greeting message using the AI API.
 * Calls the AI directly from the frontend (OpenAI-compatible format).
 *
 * @param params - Profile, Position, JD content, and Settings
 * @param onProgress - Optional callback for progress stages
 * @throws Error with user-friendly message on failure
 */
export async function generateGreeting(
  params: {
    profile: Profile;
    position: Position;
    jdContent: string;
    settings: Settings;
  },
  onProgress?: (stage: string) => void,
): Promise<GreetingResult> {
  const { profile, position, jdContent, settings } = params;

  // Validate API Key
  if (!settings.ai.apiKey) {
    throw new Error("API Key 未配置，请先前往设置页配置");
  }

  onProgress?.("正在分析 JD...");

  // Truncate JD if too long
  const truncatedJD =
    jdContent.length > MAX_JD_LENGTH
      ? jdContent.slice(0, MAX_JD_LENGTH) +
        "\n\n[注意：JD 内容过长，已自动截断]"
      : jdContent;

  const userMessage = buildUserMessage(profile, position, truncatedJD);

  onProgress?.("正在生成打招呼...");

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const raw = await callAIAPI(
      settings,
      SYSTEM_PROMPT,
      userMessage,
      controller.signal,
    );
    const result = parseGreetingResult(raw);

    onProgress?.("生成完成");
    return result;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("生成超时，请重试");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test the AI API connection by sending a short request.
 *
 * @param settings - AI settings to test
 * @returns true if the connection is successful
 */
export async function testConnection(settings: Settings): Promise<boolean> {
  if (!settings.ai.apiKey) {
    throw new Error("API Key 未配置");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const baseUrl = settings.ai.baseUrl.replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.ai.model,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
      }),
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}