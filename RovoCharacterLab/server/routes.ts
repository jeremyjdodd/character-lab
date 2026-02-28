import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";
import { analysisService } from "./services/analysis-service";
import { 
  insertPromptTestSchema, 
  insertPromptResponseSchema, 
  personalityTraitsSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new prompt test
  app.post("/api/prompt-tests", async (req, res) => {
    try {
      const validatedData = insertPromptTestSchema.parse(req.body);
      const test = await storage.createPromptTest(validatedData);
      res.json(test);
    } catch (error) {
      console.error("Create prompt test error:", error);
      res.status(400).json({ 
        message: "Failed to create prompt test", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get a prompt test by ID
  app.get("/api/prompt-tests/:id", async (req, res) => {
    try {
      const test = await storage.getPromptTest(req.params.id);
      if (!test) {
        return res.status(404).json({ message: "Prompt test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Get prompt test error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve prompt test", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Update a prompt test
  app.patch("/api/prompt-tests/:id", async (req, res) => {
    try {
      const updates = insertPromptTestSchema.partial().parse(req.body);
      const test = await storage.updatePromptTest(req.params.id, updates);
      if (!test) {
        return res.status(404).json({ message: "Prompt test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Update prompt test error:", error);
      res.status(400).json({ 
        message: "Failed to update prompt test", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Generate response for a prompt
  app.post("/api/prompt-tests/:id/generate/:promptType", async (req, res) => {
    try {
      const { id, promptType } = req.params;
      
      if (promptType !== "A" && promptType !== "B") {
        return res.status(400).json({ message: "Prompt type must be 'A' or 'B'" });
      }

      const test = await storage.getPromptTest(id);
      if (!test) {
        return res.status(404).json({ message: "Prompt test not found" });
      }

      const personalityTraits = req.body.personalityTraits ? 
        personalityTraitsSchema.parse(req.body.personalityTraits) : undefined;

      const personalityInstructions = promptType === "A" ? test.personalityA : test.personalityB;
      
      const { response, responseTime } = await aiService.generateResponse({
        personalityInstructions,
        testPrompt: test.testPrompt,
        modelType: test.modelType,
        personalityTraits: promptType === "B" ? personalityTraits : undefined,
      });

      const promptResponse = await storage.createPromptResponse({
        testId: id,
        promptType,
        response,
        responseTime,
        personalityTraits: personalityTraits ? personalityTraits : null,
      });

      res.json(promptResponse);
    } catch (error) {
      console.error("Generate response error:", error);
      res.status(500).json({ 
        message: "Failed to generate response", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get responses for a test
  app.get("/api/prompt-tests/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getPromptResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Get responses error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve responses", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get latest response for a specific prompt type
  app.get("/api/prompt-tests/:id/responses/:promptType/latest", async (req, res) => {
    try {
      const { id, promptType } = req.params;
      
      if (promptType !== "A" && promptType !== "B") {
        return res.status(400).json({ message: "Prompt type must be 'A' or 'B'" });
      }

      const response = await storage.getLatestPromptResponse(id, promptType as "A" | "B");
      if (!response) {
        return res.status(404).json({ message: "No response found" });
      }
      
      res.json(response);
    } catch (error) {
      console.error("Get latest response error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve latest response", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Run analysis comparison
  app.post("/api/prompt-tests/:id/analyze", async (req, res) => {
    try {
      const test = await storage.getPromptTest(req.params.id);
      if (!test) {
        return res.status(404).json({ message: "Prompt test not found" });
      }

      const responseA = await storage.getLatestPromptResponse(req.params.id, "A");
      const responseB = await storage.getLatestPromptResponse(req.params.id, "B");

      if (!responseA || !responseB) {
        return res.status(400).json({ 
          message: "Both responses (A and B) must exist before running analysis" 
        });
      }

      const analysis = await analysisService.analyzeResponses({
        responseA: responseA.response,
        responseB: responseB.response,
        modelType: test.modelType,
      });

      console.log("Analysis from service:", JSON.stringify(analysis, null, 2));

      const analysisResult = await storage.createAnalysisResult({
        testId: req.params.id,
        linguisticDifferences: analysis.linguisticDifferences,
        personalityScores: analysis.personalityScores,
        readerImpact: analysis.readerImpact,
        sentimentAnalysis: analysis.sentimentAnalysis,
      });

      console.log("Stored analysis result:", JSON.stringify(analysisResult, null, 2));

      res.json(analysisResult);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: "Failed to run analysis", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get latest analysis for a test
  app.get("/api/prompt-tests/:id/analysis/latest", async (req, res) => {
    try {
      const analysis = await storage.getLatestAnalysisResult(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "No analysis found" });
      }
      console.log("Retrieved analysis from storage:", JSON.stringify(analysis, null, 2));
      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve analysis", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
