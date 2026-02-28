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

export interface GenerateResponseOptions {
  personalityInstructions: string;
  testPrompt: string;
  modelType: string;
  personalityTraits?: {
    tone: number;
    initiative: number;
    depth: number;
    outputStyle: number;
  };
}

export class AIService {
  private buildPersonalityPrompt(instructions: string, traits?: GenerateResponseOptions['personalityTraits']): string {
    let prompt = instructions;
    
    if (traits) {
      const traitDescriptions = {
        tone: traits.tone > 5 ? 'enthusiastic and engaging' : 'formal and professional',
        initiative: traits.initiative > 5 ? 'proactive and anticipate needs' : 'responsive and direct',
        depth: traits.depth > 5 ? 'comprehensive and detailed' : 'concise and to-the-point',
        outputStyle: traits.outputStyle > 5 ? 'creative with analogies and examples' : 'structured and systematic'
      };
      
      prompt += `\n\nAdditional personality adjustments: Be ${traitDescriptions.tone}, ${traitDescriptions.initiative}, provide ${traitDescriptions.depth} responses, and use a ${traitDescriptions.outputStyle} approach.`;
    }
    
    return prompt;
  }

  async generateResponse(options: GenerateResponseOptions): Promise<{ response: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      const personalityPrompt = this.buildPersonalityPrompt(options.personalityInstructions, options.personalityTraits);
      
      let response: string;
      
      if (options.modelType.includes('gpt') || options.modelType.includes('openai')) {
        response = await this.generateOpenAIResponse(personalityPrompt, options.testPrompt);
      } else if (options.modelType.includes('claude') || options.modelType.includes('anthropic')) {
        response = await this.generateAnthropicResponse(personalityPrompt, options.testPrompt);
      } else {
        throw new Error(`Unsupported model type: ${options.modelType}`);
      }
      
      const responseTime = (Date.now() - startTime) / 1000;
      
      return { response, responseTime };
    } catch (error) {
      const responseTime = (Date.now() - startTime) / 1000;
      throw new Error(`AI generation failed after ${responseTime}s: ${error.message}`);
    }
  }

  private async generateOpenAIResponse(personalityInstructions: string, testPrompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        { role: "system", content: personalityInstructions },
        { role: "user", content: testPrompt }
      ],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || "";
  }

  private async generateAnthropicResponse(personalityInstructions: string, testPrompt: string): Promise<string> {
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      system: personalityInstructions,
      max_tokens: 2048,
      messages: [
        { role: "user", content: testPrompt }
      ],
    });

    return response.content[0].text;
  }
}

export const aiService = new AIService();
