import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import JDPasteInput from "@/components/greeting/JDPasteInput";
import PositionSelector from "@/components/position/PositionSelector";
import GenerationProgress from "@/components/greeting/GenerationProgress";
import GreetingResult from "@/components/greeting/GreetingResult";
import { useGreetingStore } from "@/stores/greetingStore";
import { useProfileStore } from "@/stores/profileStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Sparkles, Settings, User } from "lucide-react";

export default function GreetingPage() {
  const navigate = useNavigate();
  const {
    jdContent,
    selectedPositionId,
    result,
    generating,
    error,
    progress,
    setJdContent,
    setSelectedPosition,
    generateGreeting,
  } = useGreetingStore();

  const { profile, fetchProfile } = useProfileStore();
  const { settings, fetchSettings } = useSettingsStore();

  // Load data on mount
  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, [fetchProfile, fetchSettings]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
        action:
          error.includes("API Key") || error.includes("设置")
            ? {
                label: "去设置",
                onClick: () => navigate("/settings"),
              }
            : undefined,
      });
    }
  }, [error, navigate]);

  // Check if API Key is configured
  const isApiKeyConfigured = settings.ai.apiKey.length > 0;

  // Can generate?
  const canGenerate = jdContent.trim() && selectedPositionId && !generating && isApiKeyConfigured;

  const handleGenerate = () => {
    if (!profile) {
      toast.error("请先完善个人档案", {
        action: {
          label: "去完善",
          onClick: () => navigate("/profile"),
        },
      });
      return;
    }
    generateGreeting();
  };

  const handleRegenerate = () => {
    generateGreeting();
  };

  return (
    <div className="flex h-full flex-col">
      <Header title="AI 打招呼" description="粘贴 JD，生成个性化打招呼文案" />

      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* API Key Warning */}
        {!isApiKeyConfigured && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-warning">
                <Settings size={16} />
                <span>API Key 未配置，请先设置</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/settings")}
              >
                去设置
              </Button>
            </div>
          </div>
        )}

        {/* Profile Warning */}
        {!profile && (
          <div className="rounded-lg border border-info/30 bg-info/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-info">
                <User size={16} />
                <span>个人档案未完善，AI 生成需要您的个人信息</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
              >
                去完善
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Input */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">输入区域</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <JDPasteInput
                  value={jdContent}
                  onChange={setJdContent}
                  disabled={generating}
                />

                <PositionSelector
                  value={selectedPositionId}
                  onChange={setSelectedPosition}
                  disabled={generating}
                />

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                >
                  {generating ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {progress || "生成中..."}
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" />
                      生成打招呼
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {generating && <GenerationProgress progress={progress} isGenerating={generating} />}
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            {result ? (
              <GreetingResult
                result={result}
                onRegenerate={handleRegenerate}
                disabled={generating}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">生成结果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
                    <Sparkles size={32} className="mb-3 text-text-muted" />
                    <p className="text-sm text-text-muted">
                      粘贴 JD 并选择岗位档案后，点击"生成打招呼"按钮
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}