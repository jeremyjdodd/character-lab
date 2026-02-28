import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const promptTests = pgTable("prompt_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").references(() => users.id),
  promptA: text("prompt_a").notNull(),
  personalityA: text("personality_a").notNull(),
  promptB: text("prompt_b").notNull(),
  personalityB: text("personality_b").notNull(),
  testPrompt: text("test_prompt").notNull(),
  modelType: text("model_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promptResponses = pgTable("prompt_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => promptTests.id),
  promptType: text("prompt_type").notNull(), // "A" or "B"
  response: text("response").notNull(),
  responseTime: real("response_time"), // in seconds
  personalityTraits: json("personality_traits"), // { tone: 7, initiative: 8, depth: 6, outputStyle: 9 }
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => promptTests.id),
  linguisticDifferences: json("linguistic_differences").notNull(),
  personalityScores: json("personality_scores").notNull(),
  readerImpact: json("reader_impact").notNull(),
  sentimentAnalysis: json("sentiment_analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertPromptTestSchema = createInsertSchema(promptTests).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromptResponseSchema = createInsertSchema(promptResponses).omit({
  id: true,
  createdAt: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
});

export const personalityTraitsSchema = z.object({
  tone: z.number().min(1).max(10),
  initiative: z.number().min(1).max(10),
  depth: z.number().min(1).max(10),
  outputStyle: z.number().min(1).max(10),
});

// Types
export type InsertPromptTest = z.infer<typeof insertPromptTestSchema>;
export type PromptTest = typeof promptTests.$inferSelect;
export type InsertPromptResponse = z.infer<typeof insertPromptResponseSchema>;
export type PromptResponse = typeof promptResponses.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type PersonalityTraits = z.infer<typeof personalityTraitsSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
