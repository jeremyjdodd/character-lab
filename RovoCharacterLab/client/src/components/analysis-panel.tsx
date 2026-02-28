import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Microscope } from "lucide-react";
import { DiffViewer } from "./diff-viewer";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  responseA: string;
  responseB: string;
  "data-testid"?: string;
}

export function AnalysisPanel({ analysis, responseA, responseB, "data-testid": dataTestId }: AnalysisPanelProps) {
  const linguisticDifferences = Array.isArray(analysis.linguisticDifferences) 
    ? analysis.linguisticDifferences 
    : [];
    
  const personalityScores = Array.isArray(analysis.personalityScores) 
    ? analysis.personalityScores 
    : [];

  const readerImpact = analysis.readerImpact || {};
  const sentimentAnalysis = (analysis.sentimentAnalysis || {}) as any;

  const getDifferenceIcon = (type: string) => {
    switch (type) {
      case "added":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case "removed":
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case "modified":
        return <div className="w-2 h-2 bg-amber-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
    }
  };

  const getDifferenceColor = (type: string) => {
    switch (type) {
      case "added":
        return "text-green-600";
      case "removed":
        return "text-red-600";
      case "modified":
        return "text-amber-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <Card 
      className="fixed bottom-6 left-80 right-6 h-80 shadow-lg"
      data-testid={dataTestId}
    >
      <div className="flex h-full">
        {/* Analysis Summary */}
        <div className="w-1/3 border-r border-border">
          <CardHeader className="pb-3">
            <h4 className="font-semibold text-foreground flex items-center">
              <Microscope className="mr-2 h-4 w-4 text-primary" />
              Analysis Results
            </h4>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-y-auto h-64 px-4">
              <div className="space-y-4">
                {/* Key Differences */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground">Key Differences</h5>
                  <div className="space-y-1">
                    {linguisticDifferences.slice(0, 4).map((diff, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {getDifferenceIcon(diff.type)}
                        <span className="ml-2 text-muted-foreground" data-testid={`difference-${index}`}>
                          {diff.category}: {diff.description.slice(0, 40)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Personality Scores */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground">Personality Scores</h5>
                  <div className="space-y-2">
                    {personalityScores.slice(0, 3).map((score, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{score.trait}</span>
                        <div className="flex items-center space-x-1">
                          <Progress 
                            value={(score.scoreB / 10) * 100} 
                            className="w-12 h-2" 
                            data-testid={`score-${score.trait.toLowerCase()}`}
                          />
                          <span 
                            className={`font-medium ${score.difference > 0 ? getDifferenceColor('added') : getDifferenceColor('removed')}`}
                          >
                            {score.scoreB.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reader Impact */}
                {readerImpact && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Reader Impact</h5>
                    <div className="space-y-1">
                      {Object.entries(readerImpact).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{key}</span>
                          <Badge 
                            variant={Number(value) > 7 ? "default" : Number(value) > 5 ? "secondary" : "outline"}
                            className="text-xs"
                            data-testid={`impact-${key}`}
                          >
                            {Number(value).toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
        
        {/* Detailed Analysis */}
        <div className="flex-1">
          <Tabs defaultValue="patterns" className="w-full h-full flex flex-col">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patterns" className="text-sm" data-testid="tab-patterns">
                  Language Patterns
                </TabsTrigger>
                <TabsTrigger value="impact" className="text-sm" data-testid="tab-impact">
                  Reader Impact
                </TabsTrigger>
                <TabsTrigger value="sentiment" className="text-sm" data-testid="tab-sentiment">
                  Sentiment
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="p-0 flex-1">
              <div className="px-4 pb-4">
                <TabsContent value="patterns" className="mt-0">
                  <div className="overflow-y-auto h-56 text-sm space-y-3">
                    {linguisticDifferences.map((diff, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md border-l-3 ${
                          diff.type === 'added' 
                            ? 'bg-green-50 border-l-green-500 dark:bg-green-950/20' 
                            : diff.type === 'removed'
                            ? 'bg-red-50 border-l-red-500 dark:bg-red-950/20'
                            : 'bg-amber-50 border-l-amber-500 dark:bg-amber-950/20'
                        }`}
                        data-testid={`linguistic-difference-${index}`}
                      >
                        <strong>{diff.category}:</strong> {diff.description}
                        {diff.impact && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Impact: {diff.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="impact" className="mt-0">
                  <div className="overflow-y-auto h-56 text-sm space-y-3">
                    {readerImpact && Object.entries(readerImpact).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-md bg-muted/30" data-testid={`reader-impact-${key}`}>
                        <div className="flex items-center justify-between mb-2">
                          <strong className="capitalize">{key}</strong>
                          <Badge variant="outline">{Number(value).toFixed(1)}/10</Badge>
                        </div>
                        <Progress value={(Number(value) / 10) * 100} className="w-full" />
                        <div className="mt-1 text-xs text-muted-foreground">
                          Response B shows {Number(value) > 5 ? 'improved' : 'decreased'} {key} compared to Response A
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="sentiment" className="mt-0">
                  <div className="overflow-y-auto h-56 text-sm space-y-4">
                    {sentimentAnalysis.responseA && (
                      <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20" data-testid="sentiment-a">
                        <strong>Response A Sentiment:</strong>
                        <div className="mt-1">
                          <Badge className="mr-2">{sentimentAnalysis.responseA.sentiment}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {(sentimentAnalysis.responseA.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        {sentimentAnalysis.responseA.emotionalTone && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {sentimentAnalysis.responseA.emotionalTone.map((tone: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tone}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {sentimentAnalysis.responseB && (
                      <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/20" data-testid="sentiment-b">
                        <strong>Response B Sentiment:</strong>
                        <div className="mt-1">
                          <Badge className="mr-2">{sentimentAnalysis.responseB.sentiment}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {(sentimentAnalysis.responseB.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        {sentimentAnalysis.responseB.emotionalTone && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {sentimentAnalysis.responseB.emotionalTone.map((tone: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tone}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </CardContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
}
