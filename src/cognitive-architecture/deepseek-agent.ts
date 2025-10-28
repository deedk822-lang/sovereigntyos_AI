/**
 * @file Implements the DeepSeek Agent, a specialized cognitive module designed for
 * ultra cost-efficient AI processing. This agent leverages the DeepSeek API
 * to provide significant cost savings (up to 98% compared to GPT-4) for tasks
 * involving reasoning, coding, and mathematics, without compromising high performance.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

/**
 * Defines the capabilities and cost structure of the DeepSeek agent.
 */
export interface DeepSeekCapability {
  /** A unique identifier for the capability set. */
  id: string;
  /** The human-readable name of the agent. */
  name: string;
  /** A list of tasks the agent specializes in. */
  specialization: string[];
  /** The cost efficiency rating compared to a baseline (e.g., GPT-4), on a 0-1 scale. */
  costEfficiency: number;
  /** The relative processing speed on a 0-1 scale. */
  processingSpeed: number;
  /** The typical accuracy of the agent on a 0-1 scale. */
  accuracy: number;
  /** The maximum number of tokens in the context window. */
  contextWindow: number;
  /** The cost per one million tokens for various operations. */
  costPerMillion: {
    input: number;
    inputCached: number;
    output: number;
  };
}

/**
 * Represents the request payload sent to the DeepSeek API.
 */
export interface DeepSeekRequest {
  /** The specific model to use for the request. */
  model: string;
  /** The sequence of messages forming the conversation history. */
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  /** The maximum number of tokens to generate. */
  max_tokens?: number;
  /** The sampling temperature. */
  temperature?: number;
  /** The nucleus sampling probability. */
  top_p?: number;
  /** Penalty for repeating tokens. */
  frequency_penalty?: number;
  /** Penalty for introducing new tokens. */
  presence_penalty?: number;
  /** A list of stop sequences. */
  stop?: string[];
  /** Whether to stream the response. */
  stream?: boolean;
}

/**
 * Represents the response payload received from the DeepSeek API.
 */
export interface DeepSeekResponse {
  /** A unique identifier for the response. */
  id: string;
  /** The type of object returned (e.g., 'chat.completion'). */
  object: string;
  /** The Unix timestamp of when the response was created. */
  created: number;
  /** The model that generated the response. */
  model: string;
  /** An array of choices, typically one. */
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  /** Token usage statistics for the request. */
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
  };
}

/**
 * A cognitive agent that interacts with the DeepSeek API for cost-effective task processing.
 * It is specialized in handling reasoning, coding, and mathematical tasks with high efficiency.
 * Emits `cost_calculated`, `error`, and `batch_completed` events.
 */
export class DeepSeekAgent extends EventEmitter {
  private capability: DeepSeekCapability = {
    id: 'deepseek-v3.2-exp',
    name: 'DeepSeek V3.2-Exp Ultra Cost-Efficient Agent',
    specialization: ['reasoning', 'mathematics', 'coding', 'analysis', 'cost_optimization', 'long_context_processing'],
    costEfficiency: 0.98,
    processingSpeed: 0.85,
    accuracy: 0.92,
    contextWindow: 128000,
    costPerMillion: { input: 0.28, inputCached: 0.028, output: 0.42 }
  };

  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1';
  private defaultModel: string = 'deepseek-chat';

  /**
   * @param {string} [apiKey] - The DeepSeek API key. If not provided, it falls back to the `DEEPSEEK_API_KEY` environment variable.
   * @throws {Error} If no API key is available.
   */
  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required');
    }
  }

  /**
   * Processes a given task by preparing a request, calling the DeepSeek API, and calculating costs.
   * @param {any} task - The task object to be processed. Should contain `id`, `type`, and `content`.
   * @returns {Promise<any>} A promise that resolves to the processed task result, including cost analysis.
   * @throws {Error} If the API call fails.
   */
  async processTask(task: any): Promise<any> {
    const startTime = Date.now();
    try {
      const request: DeepSeekRequest = {
        model: this.defaultModel,
        messages: [
          { role: 'system', content: this.getSystemPrompt(task.type) },
          { role: 'user', content: this.formatTaskContent(task) }
        ],
        max_tokens: this.calculateOptimalTokens(task),
        temperature: 0.1,
        top_p: 0.95
      };

      const response = await this.makeApiCall(request);
      const costs = this.calculateCosts(response.usage);

      this.emit('cost_calculated', { agent: 'deepseek', task_id: task.id, costs: costs, savings: this.calculateSavings(costs), tokens: response.usage });

      return {
        id: uuidv4(),
        agentId: this.capability.id,
        result: {
          type: 'deepseek_result',
          content: response.choices[0].message.content,
          cost_breakdown: costs
        },
        confidence: 0.92,
        processingTime: Date.now() - startTime,
        costEstimate: costs.total,
        metadata: {
          agent: 'DeepSeek-V3.2-Exp',
          cost_efficiency: '98% cheaper than GPT-4',
          tokens_used: response.usage.total_tokens,
          actual_cost: costs.total,
          savings_vs_gpt4: costs.savings_vs_gpt4
        }
      };

    } catch (error) {
      this.emit('error', { agent: 'deepseek', task_id: task.id, error: (error as Error).message });
      throw error;
    }
  }

  /** Makes the actual HTTP POST request to the DeepSeek API. @private */
  private async makeApiCall(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, request, {
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /** Returns a specialized system prompt based on the task type. @private */
  private getSystemPrompt(taskType: string): string {
    const prompts = {
      reasoning: 'You are a highly efficient reasoning agent. Provide clear, logical analysis.',
      coding: 'You are an expert coding agent. Provide clean, well-documented code.',
      mathematics: 'You are a mathematical reasoning agent. Solve problems step-by-step.',
      analysis: 'You are an analytical agent. Provide insights, patterns, and recommendations.',
      default: 'You are a versatile AI agent optimized for cost efficiency. Provide helpful, accurate responses.'
    };
    return prompts[taskType] || prompts.default;
  }

  /** Formats the task content to be token-efficient. @private */
  private formatTaskContent(task: any): string {
    return `Task: ${task.content}\n\nRequirements: ${JSON.stringify(task.requirements, null, 0)}`;
  }

  /** Calculates the optimal number of tokens to request for a task. @private */
  private calculateOptimalTokens(task: any): number {
    const baseTokens = 1000;
    const complexityMultiplier = task.requirements?.complexity || 1;
    return Math.min(baseTokens * complexityMultiplier, 4000);
  }

  /** Calculates the cost of a request based on token usage. @private */
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
    return { ...costs, savings_vs_gpt4: this.calculateSavingsVsGPT4(usage) };
  }

  /** Calculates the cost savings compared to using GPT-4. @private */
  private calculateSavingsVsGPT4(usage: any): number {
    const gpt4Cost = (usage.prompt_tokens / 1_000_000) * 30 + (usage.completion_tokens / 1_000_000) * 60;
    const deepseekCost = this.calculateCosts(usage).total;
    return gpt4Cost - deepseekCost;
  }

  /** Calculates savings metrics. @private */
  private calculateSavings(costs: any): any {
      return { vs_gpt4: costs.savings_vs_gpt4, percentage: 98 };
  }

  /**
   * Processes a batch of tasks, optimizing for cost and performance.
   * @param {any[]} tasks - An array of task objects to process.
   * @returns {Promise<any[]>} A promise that resolves to an array of processed task results.
   */
  async processBatchTasks(tasks: any[]): Promise<any[]> {
    const batchStartTime = Date.now();
    const results = await Promise.all(tasks.map(task => this.processTask(task)));
    const totalCost = results.reduce((sum, result) => sum + result.costEstimate, 0);
    const totalSavings = results.reduce((sum, result) => sum + (result.metadata.savings_vs_gpt4 || 0), 0);
    
    this.emit('batch_completed', {
      agent: 'deepseek',
      batch_size: tasks.length,
      total_cost: totalCost,
      total_savings: totalSavings,
      processing_time: Date.now() - batchStartTime
    });
    
    return results;
  }

  /**
   * Retrieves the agent's capability description.
   * @returns {DeepSeekCapability} The capability object.
   */
  getCapability(): DeepSeekCapability {
    return this.capability;
  }
}

/**
 * Factory function to create a new instance of the DeepSeekAgent.
 * @param {string} [apiKey] - The DeepSeek API key.
 * @returns {DeepSeekAgent} A new DeepSeekAgent instance.
 */
export function createDeepSeekAgent(apiKey?: string): DeepSeekAgent {
  return new DeepSeekAgent(apiKey);
}

/**
 * A utility class for optimizing tasks and estimating costs before processing.
 */
export class DeepSeekCostOptimizer {
  /**
   * Sorts tasks to maximize potential for prompt caching.
   * @param {any[]} tasks - The tasks to be optimized.
   * @returns {any[]} The sorted array of tasks.
   */
  static optimizeForCost(tasks: any[]): any[] {
    return tasks.sort((a, b) => {
      if (a.type === b.type) return a.content.localeCompare(b.content);
      return a.type.localeCompare(b.type);
    });
  }

  /**
   * Estimates the cost of processing a batch of tasks.
   * @param {any[]} tasks - The tasks to estimate costs for.
   * @returns {object} An object containing estimated costs and savings.
   */
  static estimateCosts(tasks: any[]): any {
    const estimatedTokens = tasks.reduce((total, task) => total + (task.estimatedTokens || 2000), 0);
    const deepseekCost = (estimatedTokens / 1_000_000) * 0.35; // Using an average cost
    const gpt4Equivalent = (estimatedTokens / 1_000_000) * 45; // Using an average cost for GPT-4
    return {
      deepseek_cost: deepseekCost,
      gpt4_equivalent: gpt4Equivalent,
      savings: gpt4Equivalent - deepseekCost,
      savings_percentage: 98
    };
  }
}