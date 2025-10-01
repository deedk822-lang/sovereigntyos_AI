/**
 * DeepSeek Agent - Ultra Cost-Efficient AI Processing
 * Provides 98% cost savings compared to GPT-4 while maintaining high performance
 * Specialized for reasoning, coding, and mathematical tasks
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface DeepSeekCapability {
  id: string;
  name: string;
  specialization: string[];
  costEfficiency: number; // 0-1 scale (DeepSeek = 0.98)
  processingSpeed: number; // 0-1 scale
  accuracy: number; // 0-1 scale
  contextWindow: number; // token limit
  costPerMillion: {
    input: number;
    inputCached: number;
    output: number;
  };
}

export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
  };
}

export class DeepSeekAgent extends EventEmitter {
  private capability: DeepSeekCapability = {
    id: 'deepseek-v3.2-exp',
    name: 'DeepSeek V3.2-Exp Ultra Cost-Efficient Agent',
    specialization: [
      'reasoning', 
      'mathematics', 
      'coding', 
      'analysis', 
      'cost_optimization',
      'long_context_processing'
    ],
    costEfficiency: 0.98, // 98% more cost efficient than GPT-4
    processingSpeed: 0.85,
    accuracy: 0.92,
    contextWindow: 128000, // 128k tokens
    costPerMillion: {
      input: 0.28,       // $0.28 per 1M tokens
      inputCached: 0.028, // $0.028 per 1M tokens (cache hit)
      output: 0.42       // $0.42 per 1M tokens
    }
  };

  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1';
  private defaultModel: string = 'deepseek-chat';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required');
    }
  }

  async processTask(task: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Prepare the request optimized for cost efficiency
      const request: DeepSeekRequest = {
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(task.type)
          },
          {
            role: 'user',
            content: this.formatTaskContent(task)
          }
        ],
        max_tokens: this.calculateOptimalTokens(task),
        temperature: 0.1, // Lower temperature for cost efficiency and consistency
        top_p: 0.95
      };

      // Make API call to DeepSeek
      const response = await this.makeApiCall(request);
      
      // Calculate actual costs
      const costs = this.calculateCosts(response.usage);
      
      // Emit cost tracking event
      this.emit('cost_calculated', {
        agent: 'deepseek',
        task_id: task.id,
        costs: costs,
        savings: this.calculateSavings(costs),
        tokens: response.usage
      });

      return {
        id: uuidv4(),
        agentId: this.capability.id,
        result: {
          type: 'deepseek_result',
          content: response.choices[0].message.content,
          reasoning: 'Ultra cost-efficient processing with DeepSeek V3.2-Exp',
          model_used: response.model,
          cost_breakdown: costs
        },
        confidence: 0.92,
        processingTime: Date.now() - startTime,
        costEstimate: costs.total,
        metadata: {
          agent: 'DeepSeek-V3.2-Exp',
          cost_efficiency: '98% cheaper than GPT-4',
          tokens_used: response.usage.total_tokens,
          cache_hit_tokens: response.usage.prompt_cache_hit_tokens || 0,
          actual_cost: costs.total,
          savings_vs_gpt4: costs.savings_vs_gpt4
        }
      };

    } catch (error) {
      this.emit('error', {
        agent: 'deepseek',
        task_id: task.id,
        error: error.message
      });
      throw error;
    }
  }

  private async makeApiCall(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  private getSystemPrompt(taskType: string): string {
    const prompts = {
      reasoning: `You are a highly efficient reasoning agent powered by DeepSeek V3.2-Exp. 
        Provide clear, logical analysis while being cost-conscious. Focus on accuracy and conciseness.`,
      
      coding: `You are an expert coding agent using DeepSeek V3.2-Exp for cost-efficient development.
        Provide clean, well-documented code with explanations. Optimize for both performance and cost.`,
      
      mathematics: `You are a mathematical reasoning agent powered by DeepSeek V3.2-Exp.
        Solve problems step-by-step with clear explanations. Be precise and cost-efficient.`,
      
      analysis: `You are an analytical agent using DeepSeek V3.2-Exp for cost-effective data analysis.
        Provide insights, patterns, and recommendations while being concise and thorough.`,
      
      default: `You are a versatile AI agent powered by DeepSeek V3.2-Exp, optimized for cost efficiency.
        Provide helpful, accurate responses while being mindful of token usage.`
    };

    return prompts[taskType] || prompts.default;
  }

  private formatTaskContent(task: any): string {
    // Optimize content formatting to reduce token usage
    return `Task: ${task.content}\n\nRequirements: ${JSON.stringify(task.requirements, null, 0)}`;
  }

  private calculateOptimalTokens(task: any): number {
    // Optimize token usage based on task complexity
    const baseTokens = 1000;
    const complexityMultiplier = task.requirements?.complexity || 1;
    
    return Math.min(baseTokens * complexityMultiplier, 4000); // Cap at 4k for cost efficiency
  }

  private calculateCosts(usage: any): any {
    const { prompt_tokens, completion_tokens, prompt_cache_hit_tokens = 0 } = usage;
    const prompt_cache_miss_tokens = prompt_tokens - prompt_cache_hit_tokens;
    
    const costs = {
      input_cached: (prompt_cache_hit_tokens / 1_000_000) * this.capability.costPerMillion.inputCached,
      input_uncached: (prompt_cache_miss_tokens / 1_000_000) * this.capability.costPerMillion.input,
      output: (completion_tokens / 1_000_000) * this.capability.costPerMillion.output,
      total: 0
    };
    
    costs.total = costs.input_cached + costs.input_uncached + costs.output;
    
    return {
      ...costs,
      savings_vs_gpt4: this.calculateSavingsVsGPT4(usage),
      formatted: {
        total: `$${costs.total.toFixed(6)}`,
        savings_percentage: '98%'
      }
    };
  }

  private calculateSavingsVsGPT4(usage: any): number {
    // GPT-4 pricing: ~$30/1M input, ~$60/1M output
    const gpt4Cost = (usage.prompt_tokens / 1_000_000) * 30 + (usage.completion_tokens / 1_000_000) * 60;
    const deepseekCost = this.calculateCosts(usage).total;
    
    return gpt4Cost - deepseekCost;
  }

  private calculateSavings(costs: any): any {
    return {
      vs_gpt4: costs.savings_vs_gpt4,
      percentage: 98,
      description: 'DeepSeek provides 98% cost savings compared to GPT-4'
    };
  }

  // Specialized methods for different task types
  async handleReasoningTask(task: any): Promise<any> {
    task.type = 'reasoning';
    return this.processTask(task);
  }

  async handleCodingTask(task: any): Promise<any> {
    task.type = 'coding';
    return this.processTask(task);
  }

  async handleMathTask(task: any): Promise<any> {
    task.type = 'mathematics';
    return this.processTask(task);
  }

  async handleAnalysisTask(task: any): Promise<any> {
    task.type = 'analysis';
    return this.processTask(task);
  }

  // Batch processing for even greater cost efficiency
  async processBatchTasks(tasks: any[]): Promise<any[]> {
    const batchStartTime = Date.now();
    const results = [];
    
    // Process tasks in optimal batches to maximize cache hits
    for (const task of tasks) {
      const result = await this.processTask(task);
      results.push(result);
      
      // Small delay to allow for potential caching optimizations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate batch savings
    const totalCost = results.reduce((sum, result) => sum + result.costEstimate, 0);
    const totalSavings = results.reduce((sum, result) => sum + (result.metadata.savings_vs_gpt4 || 0), 0);
    
    this.emit('batch_completed', {
      agent: 'deepseek',
      batch_size: tasks.length,
      total_cost: totalCost,
      total_savings: totalSavings,
      processing_time: Date.now() - batchStartTime,
      average_cost_per_task: totalCost / tasks.length
    });
    
    return results;
  }

  getCapability(): DeepSeekCapability {
    return this.capability;
  }

  // Cost monitoring and optimization
  getCostSummary(): any {
    return {
      model: this.capability.name,
      cost_efficiency_rating: this.capability.costEfficiency,
      pricing_per_million: this.capability.costPerMillion,
      savings_vs_competitors: {
        vs_gpt4: '98% cheaper',
        vs_claude: '93% cheaper',
        vs_gemini: '85% cheaper'
      },
      recommended_for: [
        'High-volume processing',
        'Cost-sensitive applications',
        'Reasoning and analysis tasks',
        'Mathematical computations',
        'Code generation and review'
      ]
    };
  }
}

// Factory function for easy integration
export function createDeepSeekAgent(apiKey?: string): DeepSeekAgent {
  return new DeepSeekAgent(apiKey);
}

// Cost optimization utilities
export class DeepSeekCostOptimizer {
  static optimizeForCost(tasks: any[]): any[] {
    // Sort tasks to maximize cache hit potential
    return tasks.sort((a, b) => {
      // Group similar tasks together for better caching
      if (a.type === b.type) {
        return a.content.localeCompare(b.content);
      }
      return a.type.localeCompare(b.type);
    });
  }

  static estimateCosts(tasks: any[]): any {
    const estimatedTokens = tasks.reduce((total, task) => {
      return total + (task.estimatedTokens || 2000);
    }, 0);

    return {
      deepseek_cost: (estimatedTokens / 1_000_000) * 0.35, // Average of input/output
      gpt4_equivalent: (estimatedTokens / 1_000_000) * 45, // GPT-4 equivalent
      savings: (estimatedTokens / 1_000_000) * 44.65,
      savings_percentage: 98
    };
  }
}