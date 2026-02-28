import { useMemo } from "react";
import { computeDiff, DiffLine } from "@/lib/diff-utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DiffViewerProps {
  textA: string;
  textB: string;
  title?: string;
  "data-testid"?: string;
}

export function DiffViewer({ textA, textB, title, "data-testid": dataTestId }: DiffViewerProps) {
  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB]);

  const renderDiffLine = (line: DiffLine, index: number) => {
    const baseClasses = "px-3 py-1 text-sm font-mono leading-relaxed";
    
    switch (line.type) {
      case "added":
        return (
          <div 
            key={index}
            className={`${baseClasses} bg-green-50 border-l-3 border-l-green-500 text-green-900 dark:bg-green-950/20 dark:text-green-100`}
            data-testid={`diff-line-added-${index}`}
          >
            <span className="text-green-600 mr-2">+</span>
            {line.content}
          </div>
        );
      case "removed":
        return (
          <div 
            key={index}
            className={`${baseClasses} bg-red-50 border-l-3 border-l-red-500 text-red-900 dark:bg-red-950/20 dark:text-red-100`}
            data-testid={`diff-line-removed-${index}`}
          >
            <span className="text-red-600 mr-2">-</span>
            {line.content}
          </div>
        );
      case "unchanged":
        return (
          <div 
            key={index}
            className={`${baseClasses} text-muted-foreground`}
            data-testid={`diff-line-unchanged-${index}`}
          >
            <span className="mr-3"> </span>
            {line.content}
          </div>
        );
      default:
        return null;
    }
  };

  const stats = useMemo(() => {
    const added = diff.filter(line => line.type === "added").length;
    const removed = diff.filter(line => line.type === "removed").length;
    const unchanged = diff.filter(line => line.type === "unchanged").length;
    
    return { added, removed, unchanged, total: added + removed + unchanged };
  }, [diff]);

  return (
    <Card data-testid={dataTestId}>
      {title && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">{title}</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/20">
                +{stats.added}
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/20">
                -{stats.removed}
              </Badge>
              <Badge variant="outline">
                {stats.unchanged} unchanged
              </Badge>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto border rounded-md">
          {diff.length > 0 ? (
            <div className="divide-y divide-border">
              {diff.map(renderDiffLine)}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No differences found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
