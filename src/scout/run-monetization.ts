#!/usr/bin/env node
/**
 * @file This script serves as the entry point for the Scout Monetization CronJob.
 * It is designed to be executed on a schedule (e.g., every 2 weeks on the 1st and 15th)
 * to automatically collect and analyze revenue opportunities from various online platforms.
 * The script orchestrates the ScoutMonetizationAgent and uses a reasoning agent (DeepSeek)
 * to process the findings into an actionable plan.
 */

import { ScoutMonetizationAgent } from '../agents/scout-monetization';
import { DeepSeekAgent } from '../cognitive-architecture/deepseek-agent';

// --- Environment Validation ---
const requiredEnvVars = [
  'COLLECTION_MODE',
  'FOCUS_AREAS',
  'MAX_COLLECTION_TIME'
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// --- Configuration ---
/**
 * Configuration object for the monetization collection script.
 * Populated from environment variables with sensible defaults.
 */
const config = {
  /** The mode of collection, e.g., 'monetization-biweekly'. */
  collectionMode: process.env.COLLECTION_MODE || 'monetization-biweekly',
  /** Comma-separated list of topics to focus on. */
  focusAreas: (process.env.FOCUS_AREAS || 'ai,crypto,sovereignty').split(','),
  /** The maximum total runtime for the collection process, in milliseconds. */
  maxCollectionTime: parseInt(process.env.MAX_COLLECTION_TIME || '50') * 60 * 1000,
  /** The base URL for the DashScope API (used by DeepSeek agent). */
  dashscopeBaseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/api/v1',
  /** The API key for the DashScope service. */
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY
};

/**
 * The main execution function for the cron job.
 * It orchestrates the entire process from initialization to completion or failure.
 * @returns {Promise<void>} A promise that resolves when the process is complete or exits.
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Scout Monetization Collection');
  console.log(`📅 Mode: ${config.collectionMode}`);
  console.log(`🎯 Focus areas: ${config.focusAreas.join(', ')}`);
  console.log(`⏱️ Max time: ${config.maxCollectionTime / 60000} minutes`);
  
  const startTime = Date.now();
  
  try {
    const scout = new ScoutMonetizationAgent();
    
    // Set a global timeout for the entire collection process
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Global collection timeout reached')), config.maxCollectionTime)
    );
    
    // Race the collection process against the global timeout
    const collectionPromise = scout.executeBiweeklyCollection();
    const result = await Promise.race([collectionPromise, timeoutPromise]);
    
    // Further process the raw results with a reasoning agent for deeper insights
    console.log('🧠 Processing results with reasoning agents...');
    await processWithReasoningAgents(result);
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Collection completed successfully in ${duration.toFixed(2)}s`);
    console.log(`💰 Total estimated revenue potential: $${result.estimatedTotalRevenue.toFixed(2)}/month`);
    
    process.exit(0);
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error(`💥 Collection failed after ${duration.toFixed(2)}s:`, (error as Error).message);
    
    await notifyFailure(error as Error);
    
    process.exit(1);
  }
}

/**
 * Uses a cost-efficient reasoning agent (DeepSeek) to analyze the collected opportunities
 * and generate a structured, actionable plan.
 * @param {any} scoutResults - The raw results from the ScoutMonetizationAgent.
 * @returns {Promise<void>}
 */
async function processWithReasoningAgents(scoutResults: any): Promise<void> {
  try {
    const deepseek = new DeepSeekAgent(config.dashscopeApiKey);
    const analysisTask = {
      id: `monetization-analysis-${Date.now()}`,
      type: 'reasoning',
      content: `Analyze these monetization opportunities and create a prioritized action plan: ${JSON.stringify(scoutResults.topOpportunities, null, 2)}`,
      requirements: { maxTokens: 1500, temperature: 0.2, complexity: 1.2 }
    };

    const analysis = await deepseek.processTask(analysisTask);
    
    console.log('🎯 Reasoning Agent Analysis:');
    console.log(analysis.result.content);
    
    // Attach the analysis to the main results object
    scoutResults.reasoningAnalysis = analysis.result.content;
    scoutResults.processingCost = analysis.costEstimate;
    
  } catch (error) {
    console.warn('⚠️ Reasoning agent processing failed:', (error as Error).message);
    // This is treated as non-fatal; the raw scout results are still valuable.
  }
}

/**
 * Placeholder function for sending failure notifications.
 * In a production environment, this would integrate with services like Slack, Discord, or email.
 * @param {Error} error - The error that caused the failure.
 * @returns {Promise<void>}
 */
async function notifyFailure(error: Error): Promise<void> {
  console.log('📧 Notification: Scout collection process failed.');
  console.log(`Error details: ${error.message}`);
  // Example integration:
  // await axios.post(process.env.SLACK_WEBHOOK_URL, { text: `Scout Monetization Failed: ${error.message}` });
}

// --- Process Lifecycle Management ---

/**
 * Gracefully handles process interruption signals.
 */
function handleShutdown(signal: string) {
    console.log(`🛑 Received ${signal}, shutting down gracefully...`);
    // Add any cleanup logic here
    process.exit(0);
}
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

/**
 * Catches unhandled promise rejections to ensure the process exits cleanly with an error.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Catches uncaught exceptions to ensure the process exits cleanly with an error.
 */
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Ensures the main function is called only when the script is executed directly.
 */
if (require.main === module) {
  main().catch(error => {
    console.error('💥 A critical error occurred in the main execution block:', error);
    process.exit(1);
  });
}