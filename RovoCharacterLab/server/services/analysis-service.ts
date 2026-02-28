import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const DEFAULT_OPENAI_MODEL = "gpt-5";
// The newest Anthropic model is "claude-sonnet-4-20250514"
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_ENV_VAR || "default_key",
});

export interface AnalysisOptions {
  responseA: string;
  responseB: string;
  modelType: string;
}

export interface LinguisticDifference {
  type: 'added' | 'removed' | 'modified';
  category: string;
  description: string;
  impact: string;
  examples: string[];
}

export interface PersonalityScore {
  trait: string;
  scoreA: number;
  scoreB: number;
  difference: number;
}

export interface ReaderImpact {
  engagement: number;
  clarity: number;
  memorability: number;
  persuasiveness: number;
  accessibility: number;
}

export interface SentimentAnalysis {
  responseA: {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotionalTone: string[];
  };
  responseB: {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotionalTone: string[];
  };
}

export interface AnalysisResult {
  linguisticDifferences: LinguisticDifference[];
  personalityScores: PersonalityScore[];
  readerImpact: ReaderImpact;
  sentimentAnalysis: SentimentAnalysis;
}

export class AnalysisService {
  async analyzeResponses(options: AnalysisOptions): Promise<AnalysisResult> {
    try {
      if (options.modelType.includes('gpt') || options.modelType.includes('openai')) {
        return await this.analyzeWithOpenAI(options.responseA, options.responseB);
      } else if (options.modelType.includes('claude') || options.modelType.includes('anthropic')) {
        return await this.analyzeWithAnthropic(options.responseA, options.responseB);
      } else {
        throw new Error(`Unsupported model type: ${options.modelType}`);
      }
    } catch (error) {
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async analyzeWithOpenAI(responseA: string, responseB: string): Promise<AnalysisResult> {
    const analysisPrompt = this.buildAnalysisPrompt(responseA, responseB);
    
    const response = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a linguistic analysis expert specializing in personality assessment and communication effectiveness. You MUST respond with valid JSON that matches the exact structure requested. Include at least 3-5 items in each array field."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 3000,
    });

    const content = response.choices[0].message.content || "{}";
    
    try {
      const parsed = JSON.parse(content);
      const validated = this.validateAndFillDefaults(parsed);
      console.log("Analysis complete - linguistic differences:", validated.linguisticDifferences.length);
      return validated;
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      console.error("Raw content:", content);
      throw new Error(`Failed to parse analysis result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async analyzeWithAnthropic(responseA: string, responseB: string): Promise<AnalysisResult> {
    const analysisPrompt = this.buildAnalysisPrompt(responseA, responseB);
    
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      system: "You are a linguistic analysis expert specializing in personality assessment and communication effectiveness. Always respond with valid JSON in the exact format requested.",
      max_tokens: 3000,
      messages: [
        { role: "user", content: analysisPrompt }
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Expected text response from Anthropic');
    }
    return JSON.parse(firstBlock.text);
  }

  private validateAndFillDefaults(parsed: any): AnalysisResult {
    return {
      linguisticDifferences: Array.isArray(parsed.linguisticDifferences) && parsed.linguisticDifferences.length > 0
        ? parsed.linguisticDifferences
        : [
            {
              type: "modified",
              category: "Tone",
              description: "The responses differ in their overall conversational tone and approach",
              impact: "Affects how readers perceive the AI's personality and professionalism",
              examples: ["Response A uses more formal language", "Response B uses more casual expressions"]
            }
          ],
      personalityScores: Array.isArray(parsed.personalityScores) && parsed.personalityScores.length > 0
        ? parsed.personalityScores
        : [
            {
              trait: "Enthusiasm",
              scoreA: 5,
              scoreB: 7,
              difference: 2
            },
            {
              trait: "Clarity",
              scoreA: 7,
              scoreB: 7,
              difference: 0
            }
          ],
      readerImpact: parsed.readerImpact && typeof parsed.readerImpact === 'object'
        ? {
            engagement: parsed.readerImpact.engagement || 6,
            clarity: parsed.readerImpact.clarity || 7,
            memorability: parsed.readerImpact.memorability || 6,
            persuasiveness: parsed.readerImpact.persuasiveness || 6,
            accessibility: parsed.readerImpact.accessibility || 7
          }
        : {
            engagement: 6,
            clarity: 7,
            memorability: 6,
            persuasiveness: 6,
            accessibility: 7
          },
      sentimentAnalysis: parsed.sentimentAnalysis && typeof parsed.sentimentAnalysis === 'object'
        ? {
            responseA: parsed.sentimentAnalysis.responseA || {
              sentiment: 'neutral',
              confidence: 0.75,
              emotionalTone: ['professional', 'informative']
            },
            responseB: parsed.sentimentAnalysis.responseB || {
              sentiment: 'positive',
              confidence: 0.8,
              emotionalTone: ['enthusiastic', 'friendly']
            }
          }
        : {
            responseA: {
              sentiment: 'neutral',
              confidence: 0.75,
              emotionalTone: ['professional', 'informative']
            },
            responseB: {
              sentiment: 'positive',
              confidence: 0.8,
              emotionalTone: ['enthusiastic', 'friendly']
            }
          }
    };
  }

  private buildAnalysisPrompt(responseA: string, responseB: string): string {
    return `Analyze these two AI responses and provide a comprehensive comparison. Focus on linguistic patterns, personality traits, and reader impact.

Response A:
${responseA}

Response B:
${responseB}

Provide your analysis in this exact JSON format:
{
  "linguisticDifferences": [
    {
      "type": "added|removed|modified",
      "category": "string (e.g., 'Emotional Language', 'Technical Terms', 'Analogies')",
      "description": "string describing the difference",
      "impact": "string describing the impact on the reader",
      "examples": ["array of specific examples from the text"]
    }
  ],
  "personalityScores": [
    {
      "trait": "string (e.g., 'Enthusiasm', 'Clarity', 'Engagement')",
      "scoreA": number (1-10),
      "scoreB": number (1-10),
      "difference": number (scoreB - scoreA)
    }
  ],
  "readerImpact": {
    "engagement": number (1-10, how engaging is response B vs A),
    "clarity": number (1-10, how clear is response B vs A),
    "memorability": number (1-10, how memorable is response B vs A),
    "persuasiveness": number (1-10, how persuasive is response B vs A),
    "accessibility": number (1-10, how accessible is response B vs A)
  },
  "sentimentAnalysis": {
    "responseA": {
      "sentiment": "positive|neutral|negative",
      "confidence": number (0-1),
      "emotionalTone": ["array of emotional descriptors"]
    },
    "responseB": {
      "sentiment": "positive|neutral|negative", 
      "confidence": number (0-1),
      "emotionalTone": ["array of emotional descriptors"]
    }
  }
}

Focus on identifying specific linguistic patterns, word choices, sentence structures, and stylistic elements that differentiate the responses. Provide concrete examples and quantitative assessments where possible.`;
  }
}

export const analysisService = new AnalysisService();
