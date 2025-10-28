# SovereigntyOS AI

SovereigntyOS AI is a production-ready, AI-powered workflow automation platform. It is designed for enterprise-grade security, scalability, and seamless integration with various services. The platform leverages a multi-agent architecture to handle complex tasks, from code generation and data analysis to crisis response and parliamentary intelligence.

This repository provides the core application, along with CI/CD pipelines and deployment scripts for Alibaba Cloud's Container Registry (ACR) and Kubernetes (K8s).

## Core Features

- **Multi-Agent AI Architecture**: Utilizes a suite of specialized LLM agents, orchestrated by a lead coordinator, to achieve complex goals.
- **Production-Ready Deployment**: Includes Docker containerization, Kubernetes manifests, and automated CI/CD pipelines for Day-1 deployment.
- **Enterprise-Grade Security**: Features branch protection, automated security scanning (CodeQL), dependency updates (Dependabot), and secure secret management.
- **Extensible and Customizable**: Easily integrate with external services like Airtable, WhatsApp, and various APIs through a flexible cognitive architecture.

## Architecture

The system is built around a cognitive architecture where a lead AI orchestrator delegates tasks to specialized agents. This allows for a modular and powerful approach to problem-solving.

- **Lead Orchestrator (GPT-5)**: Decomposes high-level requests into smaller, actionable tasks for the specialist agents.
- **Specialist Agents**:
    - **Claude 4.5**: Expert in coding, complex reasoning, and data analysis.
    - **Z.ai GLM-4.6**: Powerhouse for tool-calling and API interactions.
    - **Kimi K2**: Executes autonomous, multi-step workflows and processes.

## Getting Started

Follow these instructions to set up the project for local development and testing.

### Prerequisites

- [Node.js](httpss://nodejs.org/en/) (v20 or later)
- [Docker](httpss://www.docker.com/get-started)
- [kubectl](httpss://kubernetes.io/docs/tasks/tools/install-kubectl/) (for deployment)
- [Alibaba Cloud Account](httpss://www.alibabacloud.com/) (for ACR and K8s deployment)

### Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/sovereigntyos_ai.git
    cd sovereigntyos_ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Copy the `.env.template` file (as referenced in the launch pack) to a new `.env` file and fill in the required values. These variables are essential for connecting to various services and APIs.
    ```bash
    cp .env.template .env
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

5.  **Run tests:**
    To ensure everything is working correctly, run the test suite:
    ```bash
    npm test
    ```

## Configuration

The application requires several environment variables to be set for full functionality. These are managed in a `.env` file for local development and as GitHub Actions secrets for production deployment.

Key variables include:
- `ACR_REGISTRY`, `ACR_USERNAME`, `ACR_PASSWORD`: For Alibaba Cloud Container Registry access.
- `KUBE_CONFIG`: Base64 encoded Kubernetes configuration file.
- `KUBE_NAMESPACE`, `K8S_DEPLOYMENT`, `K8S_CONTAINER`: Kubernetes deployment targets.
- API keys for various services (`GEMINI_API_KEY`, `PAYSTACK_SECRET_KEY`, etc.).

Refer to the `SOW_ONBOARDING.md` and `docs/production_setup.json` from the launch pack for a complete list and setup guide.

## Deployment

The project is designed for automated CI/CD deployment to a Kubernetes cluster.

### CI/CD Pipeline

The GitHub Actions workflows located in `.github/workflows/` automate the following process:
1.  **CI (`ci-build-test-push.yml`)**:
    - On every push to `main`, the pipeline triggers.
    - **CodeQL Analysis**: Scans the code for security vulnerabilities.
    - **Build and Test**: Installs dependencies, runs tests, and builds the application.
    - **Docker Build and Push**: Builds a Docker image, tags it with the commit SHA, and pushes it to Alibaba Cloud Container Registry (ACR).
    - An artifact `build-info.json` is created containing the image name and tag.

2.  **CD (`deploy-k8s.yml`)**:
    - This workflow is triggered manually (`workflow_dispatch`) or by pushes with tags following the `deploy-*` pattern.
    - **Deploy to Kubernetes**:
        - Downloads the `build-info.json` artifact.
        - Updates the specified Kubernetes deployment with the new container image from ACR.
        - Monitors the deployment rollout status.

### Manual Deployment

You can also deploy the application manually using the `deploy.sh` script. This is useful for testing or for deployments outside the CI/CD pipeline.

1.  **Ensure your environment is configured:**
    Export the required environment variables (`ACR_REGISTRY`, `ACR_USERNAME`, `ACR_PASSWORD`, `KUBE_CONFIG`, etc.).

2.  **Run the script:**
    ```bash
    ./deploy.sh [tag]
    ```
    - The script will build the Docker image, push it to ACR, and update the Kubernetes deployment.
    - If no `tag` is provided, it will generate one automatically (e.g., `YYYYMMDDHHMM-local`).

## 🛡️ Security Hardening

Security is a top priority for this project. The following measures are in place:

-   **Branch Protection**: The `main` branch is protected, requiring pull request reviews and passing status checks before merging.
-   **Automated Security Scanning**: CodeQL is integrated into the CI pipeline to automatically scan for vulnerabilities on every push.
-   **Dependency Management**: Dependabot is configured to create pull requests for weekly dependency updates, ensuring packages stay current and secure.
-   **Secret Management**: All sensitive information, such as API keys and credentials, is managed using GitHub Actions secrets and should not be hardcoded.
-   **Container Security**: The Docker build process is optimized for security, and images are stored in a private container registry.

For a detailed guide on security setup and best practices, see `SECURITY.md` and the `docs/production_setup.json` guide.