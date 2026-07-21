import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import { ArrowLeft, Save } from "lucide-react";

export default function PositionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const title = isNew ? "新建岗位档案" : "编辑岗位档案";

  return (
    <div className="flex h-full flex-col">
      <Header
        title={title}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/positions")}>
              <ArrowLeft size={16} className="mr-1" />
              返回
            </Button>
            <Button>
              <Save size={16} className="mr-1" />
              保存
            </Button>
          </div>
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
                <Label htmlFor="title">岗位名称</Label>
                <Input id="title" placeholder="例如：测试工程师" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">岗位方向</Label>
                <Input id="category" placeholder="例如：测试、开发、运营" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">技能标签</Label>
              <Input id="skills" placeholder="英文逗号分隔，例如：功能测试, 自动化测试, Python" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea id="notes" placeholder="岗位备注信息..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">个人匹配分析</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="输入个人匹配分析内容（支持 Markdown）..." rows={6} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}