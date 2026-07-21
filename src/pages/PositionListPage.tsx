import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import Header from "@/components/layout/Header";
import { usePositionStore } from "@/stores/positionStore";

export default function PositionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { positions, loading, fetchPositions } = usePositionStore();

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="搜索岗位..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : positions.length === 0 && !search ? (
          <EmptyState
            icon={Briefcase}
            title="还没有岗位档案"
            description="创建你的第一个岗位档案，开始求职之旅"
            actionLabel="新建档案"
            onAction={() => navigate("/positions/new")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {positions
              .filter(
                (p) =>
                  !search ||
                  p.title.toLowerCase().includes(search.toLowerCase()) ||
                  p.category.toLowerCase().includes(search.toLowerCase()),
              )
              .map((position) => (
                <Card
                  key={position.id}
                  className="cursor-pointer transition-colors hover:bg-surface-hover"
                  onClick={() => navigate(`/positions/${position.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{position.title}</CardTitle>
                      <Badge variant={position.status === "active" ? "default" : "secondary"}>
                        {position.status === "active" ? "进行中" : "已归档"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-xs text-text-muted">{position.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {position.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

