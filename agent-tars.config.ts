import { defineConfig } from '@agent-tars/interface';

export default defineConfig({
  // Model configurations for each agent
  agents: {
    gpt5_orchestrator: {
      model: {
        provider: 'openai',
        id: 'gpt-5', // Placeholder for GPT-5
        apiKey: process.env.OPENAI_API_KEY, // Assuming OpenAI API key for GPT-5
      },
      browser: {
        control: 'hybrid',
      },
      instructions: [
        'Decompose the overall task into sub-tasks: Docker image hardening, Alibaba Cloud deployment, and revenue generation.',
        'Coordinate the execution of Claude 4.5, Z.ai GLM-4.6, and Kimi K2.',
        'Oversee the Alibaba Cloud deployment strategy, including service selection and resource allocation.',
        'Orchestrate the integration of automated revenue generation mechanisms, defining billing logic and payment gateway interactions.',
        'Synthesize results from all agents and prepare final reports or pull requests.',
      ],
    },
    claude_coding_expert: {
      model: {
        provider: 'anthropic',
        id: 'claude-4.5', // Placeholder for Claude 4.5
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
    zai_tool_caller: {
      model: {
        provider: 'google', // Placeholder provider for Z.ai GLM-4.6
        id: 'glm-4.6', // Placeholder for Z.ai GLM-4.6
        apiKey: process.env.GOOGLE_API_KEY, // Assuming Google API key
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
    kimi_workflow_executor: {
      model: {
        provider: 'google', // Placeholder provider for Kimi K2
        id: 'kimi-k2', // Placeholder for Kimi K2
        apiKey: process.env.GOOGLE_API_KEY, // Assuming Google API key
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

  // Global browser control mode if not specified per agent
  browser: {
    control: 'hybrid',
  },

  // ... other global configurations if needed
});

