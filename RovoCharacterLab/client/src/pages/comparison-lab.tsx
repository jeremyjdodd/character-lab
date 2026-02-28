import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/sidebar";
import { PromptPanel } from "@/components/prompt-panel";
import { PersonalityControls } from "@/components/personality-controls";
import { AnalysisPanel } from "@/components/analysis-panel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, Save, Share, Settings } from "lucide-react";
import type { PromptTest, PromptResponse, AnalysisResult, PersonalityTraits } from "@shared/schema";

export default function ComparisonLab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the current test
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [personalityA, setPersonalityA] = useState("You are a helpful, professional assistant. Provide clear and concise responses. Maintain a neutral, informative tone while being approachable and friendly.");
  const [personalityB, setPersonalityB] = useState("You are an enthusiastic and creative teacher who loves making complex topics accessible. Use analogies, examples, and a conversational tone. Be encouraging and show genuine excitement about the subject matter.");
  const [testPrompt, setTestPrompt] = useState("Explain the concept of machine learning to someone who has never heard of it before.");
  const [modelType, setModelType] = useState("gpt-5");
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits>({
    tone: 7,
    initiative: 8,
    depth: 6,
    outputStyle: 9,
  });

  // Queries
  const { data: currentTest } = useQuery<PromptTest>({
    queryKey: ["/api/prompt-tests", currentTestId],
    enabled: !!currentTestId,
  });

  const { data: responseA } = useQuery<PromptResponse>({
    queryKey: ["/api/prompt-tests", currentTestId, "responses", "A", "latest"],
    enabled: !!currentTestId,
  });

  const { data: responseB } = useQuery<PromptResponse>({
    queryKey: ["/api/prompt-tests", currentTestId, "responses", "B", "latest"],
    enabled: !!currentTestId,
  });

  const { data: analysis } = useQuery<AnalysisResult>({
    queryKey: ["/api/prompt-tests", currentTestId, "analysis", "latest"],
    enabled: !!currentTestId,
  });

  // Mutations
  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await apiRequest("POST", "/api/prompt-tests", testData);
      return response.json();
    },
    onSuccess: (test: PromptTest) => {
      setCurrentTestId(test.id);
      toast({
        title: "Test Created",
        description: "New prompt test has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create test: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const generateResponseMutation = useMutation({
    mutationFn: async ({ testId, promptType, traits }: { testId: string; promptType: "A" | "B"; traits?: PersonalityTraits }) => {
      const response = await apiRequest("POST", `/api/prompt-tests/${testId}/generate/${promptType}`, {
        personalityTraits: traits,
      });
      return response.json();
    },
    onSuccess: (response: PromptResponse, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-tests", variables.testId, "responses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-tests", variables.testId, "responses", variables.promptType, "latest"] });
      
      toast({
        title: "Response Generated",
        description: `Response ${variables.promptType} has been generated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate response: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async (testId: string) => {
      const response = await apiRequest("POST", `/api/prompt-tests/${testId}/analyze`);
      return response.json();
    },
    onSuccess: (analysis: AnalysisResult, testId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-tests", testId, "analysis"] });
      
      toast({
        title: "Analysis Complete",
        description: "Linguistic analysis has been completed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to run analysis: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleRunComparison = async () => {
    try {
      let testId = currentTestId;
      
      // Create a new test if needed
      if (!testId) {
        const newTest = await createTestMutation.mutateAsync({
          name: "New Comparison Test",
          promptA: "Baseline Prompt",
          personalityA,
          promptB: "Variable Prompt",
          personalityB,
          testPrompt,
          modelType,
        });
        testId = newTest.id;
      }

      // Generate both responses
      await generateResponseMutation.mutateAsync({
        testId,
        promptType: "A",
      });

      await generateResponseMutation.mutateAsync({
        testId,
        promptType: "B",
        traits: personalityTraits,
      });

      // Run analysis after both responses are generated
      await runAnalysisMutation.mutateAsync(testId);
    } catch (error) {
      console.error("Comparison workflow error:", error);
    }
  };

  const handleUpdateResponseB = () => {
    if (!currentTestId) return;
    
    generateResponseMutation.mutate({
      testId: currentTestId,
      promptType: "B",
      traits: personalityTraits,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        modelType={modelType}
        onModelTypeChange={setModelType}
        onRunComparison={handleRunComparison}
        isRunning={createTestMutation.isPending || generateResponseMutation.isPending || runAnalysisMutation.isPending}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-foreground">Character Comparison Lab</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Live session</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" data-testid="button-save-test">
                <Save className="mr-2 h-4 w-4" />
                Save Test
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-share">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-2 gap-6 p-6">
            {/* Left Panel - Prompt A */}
            <div className="flex flex-col space-y-4">
              <PromptPanel
                title="Prompt A - Baseline"
                color="blue"
                personalityInstructions={personalityA}
                onPersonalityInstructionsChange={setPersonalityA}
                testPrompt={testPrompt}
                onTestPromptChange={setTestPrompt}
                response={responseA}
                isGenerating={generateResponseMutation.isPending && generateResponseMutation.variables?.promptType === "A"}
                data-testid="panel-prompt-a"
              />
            </div>

            {/* Right Panel - Prompt B with Controls */}
            <div className="flex flex-col space-y-4">
              <PromptPanel
                title="Prompt B - Variable"
                color="green"
                personalityInstructions={personalityB}
                onPersonalityInstructionsChange={setPersonalityB}
                testPrompt={testPrompt}
                onTestPromptChange={setTestPrompt}
                response={responseB}
                isGenerating={generateResponseMutation.isPending && generateResponseMutation.variables?.promptType === "B"}
                data-testid="panel-prompt-b"
              />

              <PersonalityControls
                traits={personalityTraits}
                onTraitsChange={setPersonalityTraits}
                onUpdateResponse={handleUpdateResponseB}
                isUpdating={generateResponseMutation.isPending && generateResponseMutation.variables?.promptType === "B"}
                data-testid="personality-controls"
              />
            </div>
          </div>

          {/* Analysis Panel */}
          {analysis && responseA && responseB && (
            <AnalysisPanel
              analysis={analysis}
              responseA={responseA.response}
              responseB={responseB.response}
              data-testid="analysis-panel"
            />
          )}
        </div>
      </div>
    </div>
  );
}
