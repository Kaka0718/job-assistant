import type { GreetingAnalysis } from "@/types/greeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DeepAnalysisCardProps {
  analysis: GreetingAnalysis;
  loading?: boolean;
}

export default function DeepAnalysisCard({
  analysis,
  loading = false,
}: DeepAnalysisCardProps) {
  const { matchScore, highlights, gaps, suggestions, keyRequirements } =
    analysis;

  return (
    <Card className="border-primary-bg bg-primary-bg/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">深度分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-1.5 h-4 w-16" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <p className="text-xs text-text-muted italic">分析生成中...</p>
          </div>
        ) : (
          <>
            {/* Match Score */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-text-secondary">匹配度</span>
                <span className="text-sm font-semibold text-text-primary">
                  {matchScore}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${matchScore}%`,
                    backgroundColor:
                      matchScore >= 80
                        ? "var(--color-success)"
                        : matchScore >= 60
                          ? "var(--color-warning)"
                          : "var(--color-error)",
                  }}
                />
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-success">✨ 亮点</h4>
                <ul className="space-y-0.5">
                  {highlights.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-sm text-text-secondary"
                    >
                      <span className="mt-0.5 shrink-0 text-success">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {gaps.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-warning">📋 待提升</h4>
                <ul className="space-y-0.5">
                  {gaps.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-sm text-text-secondary"
                    >
                      <span className="mt-0.5 shrink-0 text-warning">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-info">💡 建议</h4>
                <ul className="space-y-0.5">
                  {suggestions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-sm text-text-secondary"
                    >
                      <span className="mt-0.5 shrink-0 text-info">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Requirements */}
            {keyRequirements.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-text-primary">
                  🔑 硬性要求
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {keyRequirements.map((req, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-text-secondary"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}