/**
 * @file Agent TARS Configuration for SovereigntyOS AI.
 * This file defines the configuration for a multi-agent system, specifying the roles,
 * capabilities, and instructions for each specialized AI agent. This declarative approach
 * allows for clear separation of concerns and easy modification of the agent ecosystem.
 *
 * The configuration is based on the `@agent-tars/interface`, which provides a structured
 * way to define a heterogeneous group of agents working in concert.
 */

import { defineConfig } from '@agent-tars/interface';

export default defineConfig({
  /**
   * Defines the individual configurations for each agent in the system.
   * Each key represents a unique agent identifier.
   */
  agents: {
    /**
     * GPT-5: The Master Orchestrator
     * This agent acts as the "brains" of the operation. It is responsible for
     * high-level strategic planning, task decomposition, and synthesizing the
     * results from the other, more specialized agents.
     */
    gpt5_orchestrator: {
      model: {
        provider: 'openai',
        id: 'gpt-5', // Placeholder for the actual GPT-5 model identifier.
        apiKey: process.env.OPENAI_API_KEY, // The API key for the OpenAI service.
      },
      browser: {
        control: 'hybrid', // Allows the agent to both observe and control a browser.
      },
      /**
       * High-level instructions that define the core responsibilities of this agent.
       */
      instructions: [
        'Decompose the overall task into sub-tasks: Docker image hardening, Alibaba Cloud deployment, and revenue generation.',
        'Coordinate the execution of Claude 4.5, Z.ai GLM-4.6, and Kimi K2.',
        'Oversee the Alibaba Cloud deployment strategy, including service selection and resource allocation.',
        'Orchestrate the integration of automated revenue generation mechanisms, defining billing logic and payment gateway interactions.',
        'Synthesize results from all agents and prepare final reports or pull requests.',
      ],
    },

    /**
     * Claude 4.5: The Coding and Analysis Expert
     * This agent specializes in tasks that require deep reasoning, code generation,
     * and meticulous analysis. It handles the implementation details of the software components.
     */
    claude_coding_expert: {
      model: {
        provider: 'anthropic',
        id: 'claude-4.5', // Placeholder for the Claude 4.5 model.
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      browser: {
        control: 'hybrid',
      },
      instructions: [
        'Develop Dockerfiles for multi-stage builds, non-root user execution, and optimized layers for the CronJob image.',
        'Write code for `sovereigntyos_ai` functions, ensuring they are compatible with Alibaba Cloud SAE/FC.',
        'Implement in-function usage logging for revenue generation tracking.',
        'Develop functions for processing usage logs and interacting with payment gateway APIs (e.g., Stripe, PayPal).',
        'Implement access control logic based on user subscription status.',
      ],
    },

    /**
     * Z.ai GLM-4.6: The Tool-Calling Powerhouse
     * This agent is the "hands" of the operation, specialized in interacting with external
     * tools, APIs, and command-line interfaces. It executes the practical steps needed
     * to build, deploy, and manage the infrastructure.
     */
    zai_tool_caller: {
      model: {
        provider: 'google', // Placeholder provider for Z.ai.
        id: 'glm-4.6', // Placeholder for the Z.ai GLM-4.6 model.
        apiKey: process.env.GOOGLE_API_KEY, // Assumes a Google-provided API key.
      },
      browser: {
        control: 'hybrid',
      },
      instructions: [
        'Execute shell commands for building, testing, and pushing Docker images to Alibaba Cloud Container Registry (ACR).',
        'Interact with the GitHub repository using `gh` CLI for cloning, branching, committing, and creating pull requests.',
        'Execute Alibaba Cloud CLI commands for environment setup (e.g., `aliyun configure`, `aliyun cr CreateNamespace`).',
        'Execute Alibaba Cloud CLI commands for deploying and updating SAE applications and scheduled tasks.',
        'Configure Alibaba Cloud API Gateway to expose `sovereigntyos_ai` functions as monetized APIs.',
      ],
    },

    /**
     * Kimi K2: The Autonomous Workflow Executor
     * This agent specializes in running complex, multi-step processes from start to finish.
     * It monitors long-running tasks and ensures the seamless execution of the entire CI/CD pipeline.
     */
    kimi_workflow_executor: {
      model: {
        provider: 'google', // Placeholder provider for Kimi K2.
        id: 'kimi-k2', // Placeholder for the Kimi K2 model.
        apiKey: process.env.GOOGLE_API_KEY,
      },
      browser: {
        control: 'hybrid',
      },
      instructions: [
        'Automate complex, multi-step workflows for the entire CI/CD pipeline, from code commit to deployment.',
        'Monitor deployed functions and revenue streams for operational health and performance.',
        'Automate tasks related to subscription management, including activation, deactivation, and reminders.',
        'Ensure seamless orchestration of tasks between Claude 4.5 and Z.ai GLM-4.6 under GPT-5\'s guidance.',
      ],
    },
  },

  /**
   * Global browser control mode to be used if not specified per agent.
   * 'hybrid' mode allows the agent to both read the screen and control the browser.
   */
  browser: {
    control: 'hybrid',
  },
});