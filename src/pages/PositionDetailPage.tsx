import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePositionStore } from "@/stores/positionStore";
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

const emptyForm = {
  title: "",
  category: "" as PositionCategory | "",
  skillsInput: "",
  skills: [] as string[],
  tagsInput: "",
  tags: [] as string[],
  notes: "",
  analysis: "",
  interviewQuestions: "",
};

export default function PositionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const pageTitle = isNew ? "新建岗位档案" : "编辑岗位档案";

  const { getPosition, createPosition, updatePosition } = usePositionStore();
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // Load position data in edit mode
  useEffect(() => {
    if (!isNew && id) {
      const position = getPosition(id);
      if (position) {
        setForm({
          title: position.title || "",
          category: position.category || "",
          skillsInput: "",
          skills: position.skills || [],
          tagsInput: "",
          tags: position.tags || [],
          notes: position.notes || "",
          analysis: position.analysis || "",
          interviewQuestions: position.interviewQuestions || "",
        });
        setLoaded(true);
      } else {
        // Position not in store yet, fetch positions first
        const timer = setTimeout(() => {
          const retry = getPosition(id);
          if (retry) {
            setForm({
              title: retry.title || "",
              category: retry.category || "",
              skillsInput: "",
              skills: retry.skills || [],
              tagsInput: "",
              tags: retry.tags || [],
              notes: retry.notes || "",
              analysis: retry.analysis || "",
              interviewQuestions: retry.interviewQuestions || "",
            });
            setLoaded(true);
          } else {
            toast.error("未找到该岗位档案");
            navigate("/positions");
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setLoaded(true);
    }
  }, [id, isNew, getPosition, navigate]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addSkill = () => {
    const skill = form.skillsInput.trim();
    if (!skill) return;
    if (form.skills.includes(skill)) {
      toast.error("该技能已添加");
      return;
    }
    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
      skillsInput: "",
    }));
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const addTag = () => {
    const tag = form.tagsInput.trim();
    if (!tag) return;
    if (form.tags.includes(tag)) {
      toast.error("该标签已添加");
      return;
    }
    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
      tagsInput: "",
    }));
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = "岗位名称不能为空";
    }
    if (!form.category) {
      newErrors.category = "请选择岗位方向";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        category: form.category as PositionCategory,
        skills: form.skills,
        tags: form.tags,
        notes: form.notes || undefined,
        analysis: form.analysis || undefined,
        interviewQuestions: form.interviewQuestions || undefined,
      };

      if (isNew) {
        await createPosition(data);
        toast.success("岗位档案已创建");
      } else if (id) {
        await updatePosition(id, data);
        toast.success("岗位档案已保存");
      }
      navigate("/positions");
    } catch (err) {
      toast.error(`保存失败：${err}`);
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton for edit mode
  if (!isNew && !loaded) {
    return (
      <div className="flex h-full flex-col">
        <Header title={pageTitle} />
        <div className="flex-1 space-y-6 p-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title={pageTitle}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/positions")}>
              <ArrowLeft size={16} className="mr-1" />
              返回
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="mr-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  保存
                </>
              )}
            </Button>
          </div>
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
              <div className="space-y-2">
                <Label htmlFor="title">
                  岗位名称
                  <span className="ml-1 text-error">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="例如：测试工程师"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={errors.title ? "border-error" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-error">{errors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">
                  岗位方向
                  <span className="ml-1 text-error">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(value: string) => updateField("category", value)}
                >
                  <SelectTrigger
                    id="category"
                    className={errors.category ? "border-error" : "w-full"}
                  >
                    <SelectValue placeholder="选择岗位方向" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-error">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skillsInput">技能标签</Label>
              <div className="flex gap-2">
                <Input
                  id="skillsInput"
                  placeholder="输入技能后回车添加"
                  value={form.skillsInput}
                  onChange={(e) => updateField("skillsInput", e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                  disabled={!form.skillsInput.trim()}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer gap-1 text-xs"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X size={12} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tagsInput">标签</Label>
              <div className="flex gap-2">
                <Input
                  id="tagsInput"
                  placeholder="输入标签后回车添加"
                  value={form.tagsInput}
                  onChange={(e) => updateField("tagsInput", e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!form.tagsInput.trim()}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer gap-1 text-xs"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X size={12} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                placeholder="岗位备注信息..."
                rows={3}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">个人匹配分析</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="输入个人匹配分析内容（支持 Markdown）..."
              rows={6}
              value={form.analysis}
              onChange={(e) => updateField("analysis", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Interview Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">面试问题</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="输入常见面试问题（支持 Markdown）..."
              rows={6}
              value={form.interviewQuestions}
              onChange={(e) => updateField("interviewQuestions", e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}