import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import Header from "@/components/layout/Header";
import { Edit2, Save, User } from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";
import { toast } from "sonner";
import type { Profile } from "@/types/profile";

const emptyForm = {
  name: "",
  title: "",
  city: "",
  email: "",
  phone: "",
  expectSalary: "",
  yearsOfExperience: "0",
  skills: "",
  workExperience: "",
  projects: "",
  education: "",
};

export default function ProfilePage() {
  const { profile, loading, saving, fetchProfile, saveProfile } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ ...emptyForm });

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        title: profile.title || "",
        city: profile.city || "",
        email: profile.email || "",
        phone: profile.phone || "",
        expectSalary: profile.expectSalary || "",
        yearsOfExperience: String(profile.yearsOfExperience ?? 0),
        skills: (profile.skills || []).join(", "),
        workExperience: profile.workExperience || "",
        projects: profile.projects || "",
        education: profile.education || "",
      });
    }
  }, [profile]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const data: Profile = {
      id: profile?.id || "",
      created: profile?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
      name: form.name,
      title: form.title,
      city: form.city,
      email: form.email,
      phone: form.phone,
      expectSalary: form.expectSalary,
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      workExperience: form.workExperience || undefined,
      projects: form.projects || undefined,
      education: form.education || undefined,
    };

    try {
      await saveProfile(data);
      setIsEditing(false);
      toast.success("个人档案已保存");
    } catch {
      toast.error("保存失败，请重试");
    }
  };

  if (loading) {
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

  if (!profile && !isEditing) {
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
          isEditing ? (
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
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} className="mr-1" />
              编辑
            </Button>
          )
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
                <Input id="name" placeholder="你的姓名" value={form.name} onChange={(e) => updateField("name", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">职位</Label>
                <Input id="title" placeholder="例如：测试工程师" value={form.title} onChange={(e) => updateField("title", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input id="city" placeholder="所在城市" value={form.city} onChange={(e) => updateField("city", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手机</Label>
                <Input id="phone" placeholder="13800138000" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectSalary">期望薪资</Label>
                <Input id="expectSalary" placeholder="例如：15K-20K" value={form.expectSalary} onChange={(e) => updateField("expectSalary", e.target.value)} disabled={!isEditing} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">技能</Label>
              <Input id="skills" placeholder="英文逗号分隔" value={form.skills} onChange={(e) => updateField("skills", e.target.value)} disabled={!isEditing} />
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
              value={form.workExperience}
              onChange={(e) => updateField("workExperience", e.target.value)}
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
              value={form.projects}
              onChange={(e) => updateField("projects", e.target.value)}
              disabled={!isEditing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}