#!/usr/bin/env node
/**
 * Scout Monetization CronJob Entry Point
 * Runs every 2 weeks (1st and 15th at 2AM SAST)
 * Collects revenue opportunities from monetizable platforms
 */

import { ScoutMonetizationAgent, runMonetizationCollection } from '../agents/scout-monetization';
import { DeepSeekAgent } from '../cognitive-architecture/deepseek-agent';

// Environment validation
const requiredEnvVars = [
  'COLLECTION_MODE',
  'FOCUS_AREAS',
  'MAX_COLLECTION_TIME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// Configuration
const config = {
  collectionMode: process.env.COLLECTION_MODE || 'monetization-biweekly',
  focusAreas: (process.env.FOCUS_AREAS || 'ai,crypto,sovereignty').split(','),
  maxCollectionTime: parseInt(process.env.MAX_COLLECTION_TIME || '50') * 60 * 1000,
  dashscopeBaseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/api/v1',
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY
};

async function main() {
  console.log('🚀 Starting Scout Monetization Collection');
  console.log(`📅 Mode: ${config.collectionMode}`);
  console.log(`🎯 Focus areas: ${config.focusAreas.join(', ')}`);
  console.log(`⏱️ Max time: ${config.maxCollectionTime / 60000} minutes`);
  
  const startTime = Date.now();
  
  try {
    // Initialize Scout agent
    const scout = new ScoutMonetizationAgent();
    
    // Set timeout for entire collection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Collection timeout')), config.maxCollectionTime)
    );
    
    // Race between collection and timeout
    const collectionPromise = scout.executeBiweeklyCollection();
    
    const result = await Promise.race([collectionPromise, timeoutPromise]);
    
    // Process results with reasoning agents
    console.log('🧠 Processing results with reasoning agents...');
    await processWithReasoningAgents(result);
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Collection completed successfully in ${duration}s`);
    console.log(`💰 Total revenue potential: $${result.estimatedTotalRevenue}/month`);
    
    process.exit(0);
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error(`💥 Collection failed after ${duration}s:`, error.message);
    
    // Send failure notification if configured
    await notifyFailure(error);
    
    process.exit(1);
  }
}

async function processWithReasoningAgents(scoutResults: any): Promise<void> {
  try {
    // Initialize cost-efficient DeepSeek for primary analysis
    const deepseek = new DeepSeekAgent(config.dashscopeApiKey);
    
    const analysis = await deepseek.processTask({
      id: 'monetization-analysis',
      type: 'reasoning',
      content: `Analyze monetization opportunities and create action plan:
      
      Scout Results: ${JSON.stringify(scoutResults.topOpportunities, null, 2)}
      
      Focus on:
      1. Rank opportunities by ROI and implementation speed
      2. Identify synergies across platforms
      3. Create 30-day quick-win action plan
      4. Estimate realistic revenue timeline
      
      Return structured analysis with specific next steps.`,
      requirements: {
        maxTokens: 1500,
        temperature: 0.2,
        complexity: 1
      }
    });
    
    console.log('🎯 Reasoning Agent Analysis:');
    console.log(analysis.result.content);
    
    // Store enhanced results
    scoutResults.reasoningAnalysis = analysis.result.content;
    scoutResults.processingCost = analysis.costEstimate;
    
  } catch (error) {
    console.warn('⚠️ Reasoning agent processing failed:', error.message);
    // Non-fatal; scout results are still valid
  }
}

async function notifyFailure(error: Error): Promise<void> {
  // Optional: send webhook notification or create GitHub issue
  console.log('📧 Notification: Scout collection failed');
  console.log(`Error: ${error.message}`);
  
  // Could integrate with:
  // - Discord webhook
  // - Slack notification
  // - Email alert
  // - GitHub issue creation
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Main execution failed:', error);
    process.exit(1);
  });
}