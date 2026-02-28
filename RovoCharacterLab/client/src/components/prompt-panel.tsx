import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Clock, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptResponse } from "@shared/schema";

const PERSONALITY_LIBRARY = [
  {
    name: "Professional Assistant",
    instructions: "You are a helpful, professional assistant. Provide clear and concise responses. Maintain a neutral, informative tone while being approachable and friendly."
  },
  {
    name: "Creative Teacher",
    instructions: "You are an enthusiastic and creative teacher who loves making complex topics accessible. Use analogies, examples, and a conversational tone. Be encouraging and show genuine excitement about the subject matter."
  },
  {
    name: "Technical Expert",
    instructions: "You are a technical expert with deep knowledge. Provide precise, detailed explanations with technical terminology when appropriate. Be thorough and systematic in your responses."
  },
  {
    name: "Friendly Coach",
    instructions: "You are a supportive and motivational coach. Use an encouraging tone, ask thoughtful questions, and help users think through problems. Be warm, empathetic, and action-oriented."
  },
  {
    name: "Concise Analyst",
    instructions: "You are a direct and efficient analyst. Get straight to the point with minimal fluff. Use bullet points and structured formats. Focus on key insights and actionable information."
  },
  {
    name: "Socratic Mentor",
    instructions: "You are a thoughtful mentor who guides through questions. Instead of giving direct answers, ask probing questions that help users discover solutions themselves. Be patient and reflective."
  },
  {
    name: "Witty Companion",
    instructions: "You are a clever and humorous companion. Use wit, wordplay, and light humor to make interactions enjoyable. Keep things fun while still being helpful and informative."
  },
  {
    name: "Empathetic Counselor",
    instructions: "You are a compassionate and understanding counselor. Show empathy, validate feelings, and provide thoughtful, supportive guidance. Use a warm and caring tone."
  }
];

interface PromptPanelProps {
  title: string;
  color: "blue" | "green";
  personalityInstructions: string;
  onPersonalityInstructionsChange: (value: string) => void;
  testPrompt: string;
  onTestPromptChange: (value: string) => void;
  response?: PromptResponse;
  isGenerating?: boolean;
  "data-testid"?: string;
}

export function PromptPanel({
  title,
  color,
  personalityInstructions,
  onPersonalityInstructionsChange,
  testPrompt,
  onTestPromptChange,
  response,
  isGenerating = false,
  "data-testid": dataTestId,
}: PromptPanelProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  const handleCopyResponse = () => {
    if (response?.response) {
      navigator.clipboard.writeText(response.response);
    }
  };

  return (
    <>
      <Card data-testid={dataTestId}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center">
              <div className={cn("w-3 h-3 rounded-full mr-2", colorClasses[color])} />
              {title}
            </h3>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Personality Library
            </Label>
            <Select 
              onValueChange={(value) => {
                if (value && value !== "custom") {
                  const personality = PERSONALITY_LIBRARY.find(p => p.name === value);
                  if (personality) {
                    onPersonalityInstructionsChange(personality.instructions);
                  }
                }
              }}
              data-testid={`${dataTestId}-personality-select`}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a personality or write your own" />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITY_LIBRARY.map((personality) => (
                  <SelectItem key={personality.name} value={personality.name}>
                    {personality.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom (write your own)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-foreground mb-2">
              Personality Instructions
            </Label>
            <Textarea
              value={personalityInstructions}
              onChange={(e) => onPersonalityInstructionsChange(e.target.value)}
              placeholder="Enter personality instructions..."
              className="h-32 font-mono text-sm resize-none"
              data-testid={`${dataTestId}-personality-textarea`}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-foreground mb-2">
              Test Prompt
            </Label>
            <Textarea
              value={testPrompt}
              onChange={(e) => onTestPromptChange(e.target.value)}
              placeholder="Enter the prompt to test..."
              className="h-24 text-sm resize-none"
              data-testid={`${dataTestId}-test-prompt-textarea`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Output */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              Response {title.includes("A") ? "A" : "B"}
            </h4>
            <div className="flex items-center space-x-2">
              {response?.responseTime && (
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {response.responseTime.toFixed(1)}s
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyResponse}
                disabled={!response?.response}
                data-testid={`${dataTestId}-copy-button`}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px]">
            {isGenerating ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Generating response...</span>
              </div>
            ) : response?.response ? (
              <div 
                className="text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap"
                data-testid={`${dataTestId}-response-text`}
              >
                {response.response}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <span className="text-sm">No response generated yet</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
