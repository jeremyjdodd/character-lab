import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, BarChart3, History, Bookmark, Play } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  modelType: string;
  onModelTypeChange: (modelType: string) => void;
  onRunComparison: () => void;
  isRunning: boolean;
}

export function Sidebar({ modelType, onModelTypeChange, onRunComparison, isRunning }: SidebarProps) {
  const [realTimeComparison, setRealTimeComparison] = useState(true);
  const [languageAnalysis, setLanguageAnalysis] = useState(true);
  const [exportResults, setExportResults] = useState(false);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground flex items-center">
          <Brain className="mr-2 text-primary h-5 w-5" />
          Rovo Character Lab
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full justify-start"
            data-testid="nav-comparison-lab"
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            Comparison Lab
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="nav-analytics"
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="nav-history"
          >
            <History className="mr-3 h-4 w-4" />
            Test History
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="nav-templates"
          >
            <Bookmark className="mr-3 h-4 w-4" />
            Saved Templates
          </Button>
        </nav>
        
        {/* Model Selection */}
        <div className="p-4 border-t border-border mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">AI Model</label>
          <Select value={modelType} onValueChange={onModelTypeChange}>
            <SelectTrigger className="w-full" data-testid="select-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-5">GPT-5</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
              <SelectItem value="claude-3-opus">Claude-3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude-3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Test Configuration */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Test Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="real-time" 
                checked={realTimeComparison}
                onCheckedChange={setRealTimeComparison}
                data-testid="checkbox-real-time"
              />
              <label htmlFor="real-time" className="text-sm text-muted-foreground">
                Real-time comparison
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="language-analysis" 
                checked={languageAnalysis}
                onCheckedChange={setLanguageAnalysis}
                data-testid="checkbox-language-analysis"
              />
              <label htmlFor="language-analysis" className="text-sm text-muted-foreground">
                Language analysis
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="export" 
                checked={exportResults}
                onCheckedChange={setExportResults}
                data-testid="checkbox-export"
              />
              <label htmlFor="export" className="text-sm text-muted-foreground">
                Export results
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <Button 
          className="w-full" 
          onClick={onRunComparison}
          disabled={isRunning}
          data-testid="button-run-comparison"
        >
          <Play className="mr-2 h-4 w-4" />
          {isRunning ? "Running..." : "Run Comparison Test"}
        </Button>
      </div>
    </div>
  );
}
