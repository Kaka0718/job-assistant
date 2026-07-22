import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useApplicationStore } from "@/stores/applicationStore";
import { formatDate } from "@/lib/date";
import type { ApplicationStatus } from "@/types/application";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "draft", label: "草稿" },
  { value: "applied", label: "已投递" },
  { value: "read", label: "已读" },
  { value: "chatting", label: "沟通中" },
  { value: "interview", label: "面试中" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "拒绝" },
  { value: "archived", label: "已归档" },
];

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

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, fetchApplications, updateApplication, updateStatus } = useApplicationStore();
  const [app, setApp] = useState<typeof applications[0] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (applications.length === 0) {
      fetchApplications().then(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, [fetchApplications, applications.length]);

  useEffect(() => {
    if (loaded && id) {
      const found = applications.find((a) => a.id === id);
      if (found) {
        setApp(found);
      } else {
        toast.error("未找到该投递记录");
        navigate("/applications");
      }
    }
  }, [id, applications, loaded, navigate]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!app || !id) return;
    const oldStatus = app.status;
    setApp({ ...app, status: newStatus });
    try {
      await updateStatus(id, newStatus);
      toast.success("状态已更新");
    } catch (err) {
      setApp({ ...app, status: oldStatus });
      toast.error(`状态更新失败：${err}`);
    }
  };

  const handleProgressChange = async (checked: boolean) => {
    if (!app || !id) return;
    const oldProgress = app.hasProgress;
    setApp({ ...app, hasProgress: checked });
    try {
      await updateApplication(id, { hasProgress: checked });
    } catch (err) {
      setApp({ ...app, hasProgress: oldProgress });
      toast.error(`更新失败：${err}`);
    }
  };

  if (!loaded || !app) {
    return (
      <div className="flex h-full flex-col">
        <Header title="投递详情" />
        <div className="flex-1 space-y-6 p-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="投递详情"
        actions={
          <Button variant="outline" onClick={() => navigate("/applications")}>
            <ArrowLeft size={16} className="mr-1" />
            返回
          </Button>
        }
      />

      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">公司</p>
                <p className="text-sm font-medium text-text-primary">{app.company}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">岗位</p>
                <p className="text-sm font-medium text-text-primary">{app.positionTitle}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">投递日期</p>
                <p className="text-sm text-text-primary">{formatDate(app.created)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">匹配度</p>
                <p className="text-sm font-medium text-text-primary">
                  {app.matchScore != null ? `${app.matchScore}%` : "--"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="text-xs text-text-muted">状态</p>
                <Select value={app.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={statusColorMap[opt.value]}>
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Checkbox
                  id="hasProgress"
                  checked={app.hasProgress}
                  onCheckedChange={(checked) =>
                    handleProgressChange(checked === true)
                  }
                />
                <label
                  htmlFor="hasProgress"
                  className="text-sm text-text-secondary cursor-pointer"
                >
                  有进展
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JD Content */}
        {app.jdContent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">JD 原文</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-text-secondary">
                {app.jdContent}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Greeting */}
        {app.greeting && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">打招呼文案</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-text-secondary">
                {app.greeting}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Keywords */}
        {app.keywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">关键词</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {app.keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}