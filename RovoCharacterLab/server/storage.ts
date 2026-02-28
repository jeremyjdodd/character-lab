import { 
  type User, 
  type InsertUser, 
  type PromptTest, 
  type InsertPromptTest,
  type PromptResponse,
  type InsertPromptResponse,
  type AnalysisResult,
  type InsertAnalysisResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Prompt test methods
  createPromptTest(test: InsertPromptTest): Promise<PromptTest>;
  getPromptTest(id: string): Promise<PromptTest | undefined>;
  getPromptTestsByUser(userId: string): Promise<PromptTest[]>;
  updatePromptTest(id: string, updates: Partial<InsertPromptTest>): Promise<PromptTest | undefined>;

  // Response methods
  createPromptResponse(response: InsertPromptResponse): Promise<PromptResponse>;
  getPromptResponses(testId: string): Promise<PromptResponse[]>;
  getLatestPromptResponse(testId: string, promptType: "A" | "B"): Promise<PromptResponse | undefined>;

  // Analysis methods
  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getLatestAnalysisResult(testId: string): Promise<AnalysisResult | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private promptTests: Map<string, PromptTest>;
  private promptResponses: Map<string, PromptResponse>;
  private analysisResults: Map<string, AnalysisResult>;

  constructor() {
    this.users = new Map();
    this.promptTests = new Map();
    this.promptResponses = new Map();
    this.analysisResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPromptTest(test: InsertPromptTest): Promise<PromptTest> {
    const id = randomUUID();
    const now = new Date();
    const promptTest: PromptTest = {
      ...test,
      id,
      userId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.promptTests.set(id, promptTest);
    return promptTest;
  }

  async getPromptTest(id: string): Promise<PromptTest | undefined> {
    return this.promptTests.get(id);
  }

  async getPromptTestsByUser(userId: string): Promise<PromptTest[]> {
    return Array.from(this.promptTests.values()).filter(
      (test) => test.userId === userId
    );
  }

  async updatePromptTest(id: string, updates: Partial<InsertPromptTest>): Promise<PromptTest | undefined> {
    const existing = this.promptTests.get(id);
    if (!existing) return undefined;
    
    const updated: PromptTest = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.promptTests.set(id, updated);
    return updated;
  }

  async createPromptResponse(response: InsertPromptResponse): Promise<PromptResponse> {
    const id = randomUUID();
    const promptResponse: PromptResponse = {
      ...response,
      id,
      responseTime: response.responseTime ?? null,
      personalityTraits: response.personalityTraits ?? null,
      createdAt: new Date(),
    };
    this.promptResponses.set(id, promptResponse);
    return promptResponse;
  }

  async getPromptResponses(testId: string): Promise<PromptResponse[]> {
    return Array.from(this.promptResponses.values()).filter(
      (response) => response.testId === testId
    );
  }

  async getLatestPromptResponse(testId: string, promptType: "A" | "B"): Promise<PromptResponse | undefined> {
    const responses = Array.from(this.promptResponses.values())
      .filter(response => response.testId === testId && response.promptType === promptType)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    
    return responses[0];
  }

  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const analysisResult: AnalysisResult = {
      ...analysis,
      id,
      createdAt: new Date(),
    };
    this.analysisResults.set(id, analysisResult);
    return analysisResult;
  }

  async getLatestAnalysisResult(testId: string): Promise<AnalysisResult | undefined> {
    const results = Array.from(this.analysisResults.values())
      .filter(result => result.testId === testId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    
    return results[0];
  }
}

export const storage = new MemStorage();
