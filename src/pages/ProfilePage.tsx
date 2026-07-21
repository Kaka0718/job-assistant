import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import Header from "@/components/layout/Header";
import { Edit2, Save, User } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const isLoading = false;
  const hasProfile = false;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="个人档案" />
        <div className="flex-1 space-y-6 p-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!hasProfile && !isEditing) {
    return (
      <div className="flex h-full flex-col">
        <Header title="个人档案" />
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={User}
            title="还没有个人档案"
            description="完善个人档案，让 AI 生成更精准的打招呼文案"
            actionLabel="创建档案"
            onAction={() => setIsEditing(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="个人档案"
        description="你的个人信息"
        actions={
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save size={16} className="mr-1" />
                保存
              </>
            ) : (
              <>
                <Edit2 size={16} className="mr-1" />
                编辑
              </>
            )}
          </Button>
        }
      />

      <div className="flex-1 space-y-6 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input id="name" placeholder="你的姓名" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">职位</Label>
                <Input id="title" placeholder="例如：测试工程师" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input id="city" placeholder="所在城市" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" placeholder="email@example.com" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手机</Label>
                <Input id="phone" placeholder="13800138000" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectSalary">期望薪资</Label>
                <Input id="expectSalary" placeholder="例如：15K-20K" disabled={!isEditing} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">技能</Label>
              <Input id="skills" placeholder="英文逗号分隔" disabled={!isEditing} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">工作经历</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="描述你的工作经历（支持 Markdown）..."
              rows={6}
              disabled={!isEditing}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">项目经历</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="描述你的项目经历（支持 Markdown）..."
              rows={6}
              disabled={!isEditing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}