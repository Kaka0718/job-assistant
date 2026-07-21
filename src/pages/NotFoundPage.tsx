import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <FileQuestion size={64} className="mb-4 text-text-muted" />
      <h1 className="mb-2 text-2xl font-bold text-text-primary">404</h1>
      <p className="mb-6 text-sm text-text-secondary">页面不存在</p>
      <Button onClick={() => navigate("/")}>返回首页</Button>
    </div>
  );
}