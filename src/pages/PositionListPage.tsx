import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Briefcase, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import Header from "@/components/layout/Header";
import { usePositionStore } from "@/stores/positionStore";
import { toast } from "sonner";
import type { PositionCategory } from "@/types/position";

const CATEGORIES: PositionCategory[] = [
  "测试",
  "开发",
  "运营",
  "产品",
  "设计",
  "运维",
  "数据",
  "其他",
];

export default function PositionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const { positions, loading, fetchPositions, deletePosition, archivePosition } = usePositionStore();

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filteredPositions = positions.filter((p) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    // Category filter
    if (categoryFilter !== "全部" && p.category !== categoryFilter) {
      return false;
    }
    // Status filter
    if (statusFilter === "进行中" && p.status !== "active") return false;
    if (statusFilter === "已归档" && p.status !== "archived") return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePosition(deleteTarget);
      toast.success("已删除");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(`删除失败：${err}`);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archivePosition(archiveTarget);
      toast.success("已归档");
      setArchiveTarget(null);
    } catch (err) {
      toast.error(`归档失败：${err}`);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="岗位档案"
        description="管理你的求职岗位方向"
        actions={
          <Button onClick={() => navigate("/positions/new")}>
            <Plus size={16} className="mr-1" />
            新建档案
          </Button>
        }
      />

      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            placeholder="搜索岗位..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="全部">全部</TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="全部">全部</TabsTrigger>
            <TabsTrigger value="进行中">进行中</TabsTrigger>
            <TabsTrigger value="已归档">已归档</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : filteredPositions.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="没有找到岗位档案"
            description={
              search || categoryFilter !== "全部" || statusFilter !== "全部"
                ? "尝试调整筛选条件"
                : "创建你的第一个岗位档案，开始求职之旅"
            }
            actionLabel={
              search || categoryFilter !== "全部" || statusFilter !== "全部"
                ? undefined
                : "新建档案"
            }
            onAction={
              search || categoryFilter !== "全部" || statusFilter !== "全部"
                ? undefined
                : () => navigate("/positions/new")
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPositions.map((position) => (
              <Card
                key={position.id}
                className={`cursor-pointer transition-colors hover:bg-surface-hover ${
                  position.status === "archived" ? "opacity-60" : ""
                }`}
                onClick={() => navigate(`/positions/${position.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className="truncate text-sm font-medium"
                      title={position.title}
                    >
                      {position.title}
                    </CardTitle>
                    <Badge
                      variant={
                        position.status === "active" ? "default" : "secondary"
                      }
                    >
                      {position.status === "active" ? "进行中" : "已归档"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-xs text-text-muted">
                    {position.category}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {position.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {position.skills.length > 4 && (
                      <span className="text-xs text-text-muted">
                        +{position.skills.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
                    {position.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-text-muted hover:text-warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          setArchiveTarget(position.id);
                        }}
                      >
                        <Archive size={14} className="mr-1" />
                        归档
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-text-muted hover:text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(position.id);
                      }}
                    >
                      <Trash2 size={14} className="mr-1" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="确认删除"
        description="删除后该岗位档案将无法恢复，确认删除？"
        confirmLabel="删除"
        variant="danger"
        onConfirm={handleDelete}
      />

      {/* Archive Confirm Dialog */}
      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="确认归档"
        description="归档后该岗位仍可查看，但不会出现在活跃筛选中。"
        confirmLabel="归档"
        variant="info"
        onConfirm={handleArchive}
      />
    </div>
  );
}