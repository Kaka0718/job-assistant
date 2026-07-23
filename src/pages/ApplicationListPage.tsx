import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, LayoutList, Columns3, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import Header from "@/components/layout/Header";
import { useApplicationStore } from "@/stores/applicationStore";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { formatDate } from "@/lib/date";
import type { ApplicationStatus } from "@/types/application";
import type { Application } from "@/types/application";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const PAGE_SIZE = 20;

const STATUS_ORDER: ApplicationStatus[] = [
  "draft",
  "applied",
  "read",
  "chatting",
  "interview",
  "offer",
  "rejected",
  "archived",
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

const kanbanColumnColors: Record<string, string> = {
  draft: "border-t-slate-400",
  applied: "border-t-blue-500",
  read: "border-t-sky-500",
  chatting: "border-t-violet-500",
  interview: "border-t-amber-500",
  offer: "border-t-emerald-500",
  rejected: "border-t-red-500",
  archived: "border-t-slate-300",
};

/* ─── Draggable Card ─── */
function KanbanCard({
  app,
  isDragging,
}: {
  app: Application;
  isDragging?: boolean;
}) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `card-${app.id}`,
    data: { app, fromStatus: app.status },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className="transition-shadow hover:shadow-md active:scale-[0.98]"
        onClick={() => !isDragging && navigate(`/applications/${app.id}`)}
      >
        <CardContent className="p-3">
          <p className="truncate text-sm font-medium text-text-primary">
            {app.company}
          </p>
          <p className="truncate text-xs text-text-muted">
            {app.positionTitle}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {formatDate(app.created)}
            </span>
            {app.matchScore != null && (
              <span className="text-xs text-text-muted">
                {app.matchScore}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Droppable Column ─── */
function KanbanColumn({
  status,
  label,
  apps,
}: {
  status: string;
  label: string;
  apps: Application[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-56 flex-col rounded-lg border border-border bg-surface transition-colors ${
        apps.length === 0 ? "opacity-50" : ""
      } ${isOver ? "bg-primary-bg ring-2 ring-primary" : ""}`}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between border-b border-border px-3 py-2.5 ${
          kanbanColumnColors[status]
        } border-t-2`}
      >
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-text-muted">
          {apps.length}
        </span>
      </div>

      {/* Column Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {apps.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-text-muted">暂无记录</p>
          </div>
        ) : (
          apps.map((app) => (
            <div key={app.id}>
              <KanbanCard app={app} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── DragOverlay Content ─── */
function DragOverlayCard({ app }: { app: Application }) {
  return (
    <div className="rotate-3 opacity-90 shadow-lg">
      <Card>
        <CardContent className="p-3">
          <p className="truncate text-sm font-medium text-text-primary">
            {app.company}
          </p>
          <p className="truncate text-xs text-text-muted">
            {app.positionTitle}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ApplicationListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [activeDragApp, setActiveDragApp] = useState<Application | null>(null);
  const { applications, loading, fetchApplications, updateStatus } = useApplicationStore();
  const [csvExporting, setCsvExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      const filePath = await save({
        filters: [{ name: "CSV", extensions: ["csv"] }],
        defaultPath: "applications.csv",
      });
      if (!filePath) return;

      setCsvExporting(true);
      await invoke("export_applications_csv", { path: filePath });
      toast.success("投递记录 CSV 已导出");
    } catch (err) {
      toast.error(`导出失败：${err}`);
    } finally {
      setCsvExporting(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [search, statusFilter]);

  const filteredApplications = applications.filter((app) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !app.company.toLowerCase().includes(q) &&
        !app.positionTitle.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== "全部" && app.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const displayedApplications = filteredApplications.slice(0, displayCount);
  const hasMore = displayCount < filteredApplications.length;

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    setStatusUpdating(id);
    try {
      await updateStatus(id, newStatus);
      toast.success("状态已更新");
    } catch (err) {
      toast.error(`状态更新失败：${err}`);
    } finally {
      setStatusUpdating(null);
    }
  };

  // Kanban data
  const kanbanColumns = STATUS_ORDER.map((status) => ({
    status,
    label: statusLabelMap[status],
    apps: applications.filter(
      (app) =>
        app.status === status &&
        (!search ||
          app.company.toLowerCase().includes(search.toLowerCase()) ||
          app.positionTitle.toLowerCase().includes(search.toLowerCase()))
    ),
  }));

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith("card-")) {
      const app = event.active.data.current?.app as Application;
      setActiveDragApp(app);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragApp(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith("card-")) return;

    const app = active.data.current?.app as Application;
    const fromStatus = active.data.current?.fromStatus as string;

    // Determine target status from droppable column
    let targetStatus: string | null = null;
    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "");
    } else if (overId.startsWith("card-")) {
      // Dropped on another card - find its column
      const overApp = over.data.current?.app as Application;
      targetStatus = overApp?.status || null;
    }

    if (!targetStatus || targetStatus === fromStatus) return;

    // Update status
    try {
      await updateStatus(app.id, targetStatus as ApplicationStatus);
      toast.success("状态已更新");
    } catch (err) {
      toast.error(`状态更新失败：${err}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="投递记录" description="追踪你的投递进展" />
        <div className="flex-1 space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (applications.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <Header title="投递记录" description="追踪你的投递进展" />
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={Send}
            title="还没有投递记录"
            description="生成打招呼后会自动记录投递，也可以手动添加"
            actionLabel="去生成打招呼"
            onAction={() => navigate("/greeting")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="投递记录"
        description="追踪你的投递进展"
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("list")}
            >
              <LayoutList size={14} className="mr-1" />
              列表
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("kanban")}
            >
              <Columns3 size={14} className="mr-1" />
              看板
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleExportCsv}
              disabled={csvExporting || applications.length === 0}
            >
              <Download size={14} className="mr-1" />
              {csvExporting ? "导出中..." : "导出 CSV"}
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <Input
              placeholder="搜索公司或岗位..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {viewMode === "list" ? (
          <>
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="h-auto flex-wrap">
                <TabsTrigger value="全部">全部</TabsTrigger>
                {STATUS_ORDER.map((status) => (
                  <TabsTrigger key={status} value={status}>
                    {statusLabelMap[status]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* List View */}
            {displayedApplications.length === 0 ? (
              <EmptyState
                icon={Send}
                title="没有找到投递记录"
                description="尝试调整筛选条件"
              />
            ) : (
              <>
                <div className="space-y-3">
                  {displayedApplications.map((app) => (
                    <Card
                      key={app.id}
                      className="cursor-pointer transition-colors hover:bg-surface-hover"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {app.company}
                            </p>
                            <p className="text-xs text-text-muted">
                              {app.positionTitle} · {formatDate(app.created)}
                            </p>
                          </div>
                          {app.matchScore != null && (
                            <span className="text-xs text-text-muted">
                              {app.matchScore}%
                            </span>
                          )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={app.status}
                            onValueChange={(value: string) =>
                              handleStatusChange(
                                app.id,
                                value as ApplicationStatus
                              )
                            }
                            disabled={statusUpdating === app.id}
                          >
                            <SelectTrigger className="h-7 w-24 border-0 p-0 shadow-none">
                              <SelectValue>
                                <Badge
                                  className={statusColorMap[app.status] || ""}
                                >
                                  {statusLabelMap[app.status] || app.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_ORDER.map((s) => (
                                <SelectItem key={s} value={s}>
                                  <span className={statusColorMap[s]}>
                                    {statusLabelMap[s]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDisplayCount((prev) => prev + PAGE_SIZE)
                      }
                    >
                      加载更多（
                      {filteredApplications.length - displayCount} 条）
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Kanban View with Drag & Drop */
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
              {kanbanColumns.map((col) => (
                <KanbanColumn
                  key={col.status}
                  status={col.status}
                  label={col.label}
                  apps={col.apps}
                />
              ))}
            </div>

            <DragOverlay>
              {activeDragApp ? (
                <DragOverlayCard app={activeDragApp} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}