import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import Header from "@/components/layout/Header";

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

const mockApplications: Array<{
  id: string;
  company: string;
  positionTitle: string;
  created: string;
  status: string;
}> = [];

export default function ApplicationListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const isLoading = false;

  return (
    <div className="flex h-full flex-col">
      <Header title="投递记录" description="追踪你的投递进展" />

      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="搜索公司或岗位..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : mockApplications.length === 0 ? (
          <EmptyState
            icon={SendIcon}
            title="还没有投递记录"
            description="生成打招呼后会自动记录投递，也可以手动添加"
          />
        ) : (
          <div className="space-y-3">
            {mockApplications.map((app) => (
              <Card
                key={app.id}
                className="cursor-pointer transition-colors hover:bg-surface-hover"
                onClick={() => navigate(`/applications/${app.id}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{app.company}</p>
                    <p className="text-xs text-text-muted">
                      {app.positionTitle} · {app.created}
                    </p>
                  </div>
                  <Badge className={statusColorMap[app.status] || ""}>
                    {statusLabelMap[app.status] || app.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Send } from "lucide-react";
const SendIcon = Send;