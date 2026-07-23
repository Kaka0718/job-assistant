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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useSettingsStore } from "@/stores/settingsStore";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Download, Upload, Database } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
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
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [restoreFilePath, setRestoreFilePath] = useState<string | null>(null);

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

  // Handle backup export
  const handleExportBackup = async () => {
    try {
      const filePath = await save({
        filters: [{ name: "ZIP Backup", extensions: ["zip"] }],
        defaultPath: `job-assistant-backup-${new Date().toISOString().slice(0, 10)}.zip`,
      });
      if (!filePath) return;

      setBackingUp(true);
      await invoke("export_backup", { path: filePath });
      toast.success("备份已导出");
    } catch (err) {
      toast.error(`备份失败：${err}`);
    } finally {
      setBackingUp(false);
    }
  };

  // Handle backup import
  const handleSelectRestore = async () => {
    try {
      const filePath = await open({
        filters: [{ name: "ZIP Backup", extensions: ["zip"] }],
        multiple: false,
      });
      if (!filePath) return;

      setRestoreFilePath(filePath as string);
      setRestoreConfirm(true);
    } catch (err) {
      toast.error(`选择文件失败：${err}`);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreFilePath) return;
    setRestoreConfirm(false);
    setRestoring(true);
    try {
      await invoke("import_backup", { path: restoreFilePath });
      toast.success("数据已恢复，请重新加载页面查看变更");
    } catch (err) {
      toast.error(`恢复失败：${err}`);
    } finally {
      setRestoring(false);
      setRestoreFilePath(null);
    }
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

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database size={16} className="text-primary" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary">
              导出备份将把全部数据（岗位档案、投递记录、个人档案）打包为 ZIP 文件。
              导入备份会覆盖当前所有数据。
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExportBackup}
                disabled={backingUp}
              >
                {backingUp ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    备份中...
                  </>
                ) : (
                  <>
                    <Download size={14} className="mr-1" />
                    导出备份
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSelectRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    恢复中...
                  </>
                ) : (
                  <>
                    <Upload size={14} className="mr-1" />
                    导入备份
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirm Dialog */}
      <ConfirmDialog
        open={restoreConfirm}
        onOpenChange={(open) => { if (!open) setRestoreConfirm(false); }}
        title="确认恢复数据"
        description="恢复备份将覆盖当前所有数据（岗位档案、投递记录、个人档案），此操作不可撤销。建议先导出当前数据作为备份。"
        confirmLabel="确认恢复"
        variant="danger"
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreFilePath(null)}
      />
    </div>
  );
}