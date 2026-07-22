import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Briefcase,
  TrendingUp,
  Target,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useApplicationStore } from "@/stores/applicationStore";
import { useProfileStore } from "@/stores/profileStore";
import { formatRelative } from "@/lib/date";
import { isToday, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

const statusColorMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  read: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  chatting: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  interview: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  offer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabelMap: Record<string, string> = {
  draft: "草稿",
  applied: "已投递",
  read: "已读",
  chatting: "沟通中",
  interview: "面试中",
  offer: "Offer",
  rejected: "拒绝",
  archived: "已归档",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { applications, loading: appsLoading, error: appsError, fetchApplications } = useApplicationStore();
  const { profile, loading: profileLoading, fetchProfile } = useProfileStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([fetchApplications(), fetchProfile()]).finally(() =>
      setLoaded(true)
    );
  }, [fetchApplications, fetchProfile]);

  const isLoading = !loaded || appsLoading || profileLoading;
  const hasData = applications.length > 0;
  const hasProfile = profile !== null;

  // Calculate stats
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const todayCount = applications.filter((app) =>
    isToday(new Date(app.created))
  ).length;

  const weekCount = applications.filter((app) =>
    isWithinInterval(new Date(app.created), { start: weekStart, end: weekEnd })
  ).length;

  const scores = applications
    .filter((app) => app.matchScore != null)
    .map((app) => app.matchScore as number);

  const avgMatchScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const progressCount = applications.filter(
    (app) => app.hasProgress
  ).length;

  // Recent 5 applications
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      label: "今日投递",
      value: isLoading ? "--" : String(todayCount),
      icon: Send,
      color: "text-blue-600",
    },
    {
      label: "本周投递",
      value: isLoading ? "--" : String(weekCount),
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      label: "平均匹配度",
      value: isLoading ? "--" : avgMatchScore != null ? `${avgMatchScore}%` : "--",
      icon: Target,
      color: "text-violet-600",
    },
    {
      label: "有进展",
      value: isLoading ? "--" : String(progressCount),
      icon: Briefcase,
      color: "text-amber-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="仪表盘" />
        <div className="flex-1 space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (appsError) {
    return (
      <div className="flex h-full flex-col">
        <Header title="仪表盘" description="求职概览" />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <AlertCircle size={48} className="text-error" />
              <p className="text-sm text-text-secondary">
                数据加载失败：{appsError}
              </p>
              <Button
                variant="outline"
                onClick={() => fetchApplications()}
              >
                <RefreshCw size={16} className="mr-1" />
                重试
              </Button>
            </CardContent>
          </Card>
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
                      <p className="mt-1 text-2xl font-bold text-text-primary">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg bg-surface-hover p-2.5 ${stat.color}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!hasData && !hasProfile ? (
          /* Welcome Guide for new users */
          <Card>
            <CardHeader>
              <CardTitle className="text-base">欢迎使用求职助手</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">
                开始使用前，请先完善个人档案和配置 API Key，然后即可开始生成打招呼、追踪投递进展。
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/profile")}>
                  完善个人档案
                </Button>
                <Button variant="outline" onClick={() => navigate("/settings")}>
                  配置 API Key
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/greeting")}
                >
                  去生成打招呼
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !hasData ? (
          /* No applications but has profile */
          <Card>
            <CardHeader>
              <CardTitle className="text-base">开始投递</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">
                个人档案已就绪，现在去生成你的第一个打招呼吧！
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/greeting")}>
                  去生成打招呼
                </Button>
                <Button variant="outline" onClick={() => navigate("/positions")}>
                  管理岗位档案
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Recent Applications */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">最近投递</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => navigate("/applications")}
                >
                  查看全部
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-surface-hover"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {app.company}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {app.positionTitle} · {formatRelative(app.created)}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    {app.matchScore != null && (
                      <span className="text-xs text-text-muted">
                        {app.matchScore}%
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        statusColorMap[app.status] || ""
                      }`}
                    >
                      {statusLabelMap[app.status] || app.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}