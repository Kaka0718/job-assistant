import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Send, Briefcase, TrendingUp, Target } from "lucide-react";
import Header from "@/components/layout/Header";

const stats = [
  { label: "今日投递", value: "--", icon: Send, color: "text-blue-600" },
  { label: "本周投递", value: "--", icon: TrendingUp, color: "text-emerald-600" },
  { label: "平均匹配度", value: "--", icon: Target, color: "text-violet-600" },
  { label: "有进展", value: "--", icon: Briefcase, color: "text-amber-600" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="仪表盘" />
        <div className="flex-1 space-y-6 p-6">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="仪表盘" description="求职概览" />

      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg bg-surface-hover p-2.5 ${stat.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Welcome / Empty State */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">欢迎使用求职助手</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary">
              这里将展示你的求职概览数据，包括最近投递记录、匹配度趋势等。
              开始使用前，请先完善个人档案和配置 API Key。
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/profile")}>
                完善个人档案
              </Button>
              <Button variant="outline" onClick={() => navigate("/settings")}>
                配置 API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}