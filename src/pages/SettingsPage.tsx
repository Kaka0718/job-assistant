import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { useSettingsStore } from "@/stores/settingsStore";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { ThemeMode } from "@/types/settings";

export default function SettingsPage() {
  const {
    settings,
    loaded,
    loading,
    saving,
    testing,
    testResult,
    fetchSettings,
    saveSettings,
    updateSettings,
    testConnection,
  } = useSettingsStore();

  const { setTheme } = useTheme();
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (!loaded) {
      fetchSettings();
    }
  }, [loaded, fetchSettings]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="设置" />
        <div className="flex-1 space-y-6 p-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  // Handle AI field changes
  const handleAIChange = (field: string, value: string | number) => {
    updateSettings({
      ai: { ...settings.ai, [field]: value },
    });
  };

  // Handle theme change
  const handleThemeChange = (value: string) => {
    updateSettings({
      app: { ...settings.app, theme: value as ThemeMode },
    });
    setTheme(value);
  };

  // Handle save
  const handleSave = async () => {
    try {
      await saveSettings(settings);
    } catch {
      // Error is handled by the store
    }
  };

  // Handle test connection
  const handleTestConnection = async () => {
    await testConnection();
  };

  return (
    <div className="flex h-full flex-col">
      <Header title="设置" description="AI 配置与应用偏好" />

      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">AI 提供商</Label>
              <Select
                value={settings.ai.provider}
                onValueChange={(value: string) => handleAIChange("provider", value)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">Deepseek</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  value={settings.ai.apiKey}
                  onChange={(e) => handleAIChange("apiKey", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Model & Base URL */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">模型</Label>
                <Input
                  id="model"
                  placeholder="deepseek-chat"
                  value={settings.ai.model}
                  onChange={(e) => handleAIChange("model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  placeholder="https://api.deepseek.com"
                  value={settings.ai.baseUrl}
                  onChange={(e) => handleAIChange("baseUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  placeholder="0.7"
                  value={settings.ai.temperature}
                  onChange={(e) =>
                    handleAIChange("temperature", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  placeholder="2048"
                  value={settings.ai.maxTokens}
                  onChange={(e) =>
                    handleAIChange("maxTokens", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing || !settings.ai.apiKey}
              >
                {testing ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    测试中...
                  </>
                ) : (
                  "测试连接"
                )}
              </Button>

              {testResult && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    testResult.success ? "text-success" : "text-error"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {testResult.message}
                </div>
              )}

              <div className="ml-auto">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={14} className="mr-1 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "保存设置"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">应用设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">主题</Label>
              <Select
                value={settings.app.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">亮色模式</SelectItem>
                  <SelectItem value="dark">暗色模式</SelectItem>
                  <SelectItem value="system">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">语言</Label>
              <Select
                value={settings.app.language}
                onValueChange={(value: string) =>
                  updateSettings({
                    app: {
                      ...settings.app,
                      language: value as "zh-CN" | "en",
                    },
                  })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}