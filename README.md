# sovereigntyos_AI
Sovereigntyos_AI: Production-ready AI workflow automation platform with Manus API integration, parliamentary intelligence, crisis response, and seamless Sim.ai deployment. Complete Docker containerization with multi-stage builds, GitHub Actions CI/CD, webhook automation, and enterprise-grade security.


## Overview
This project implements an AI system using multiple specialized LLM agents orchestrated by GPT-5 as the lead coordinator.

## Architecture
- GPT-5: Lead orchestrator, request decomposer
- Claude 4.5: Coding and deep reasoning expert
- Z.ai GLM-4.6: Tool-calling powerhouse
- Kimi K2: Autonomous multi-step workflow executor

## Deployment
- CI/CD pipelines automate builds, testing, security scans, and deployments
- Docker containerized for flexibility
- Kubernetes manifests available in `/k8s`

## How to Run
1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Build: `npm run build`
4. Docker build: `npm run docker:build`
5. Deploy with: `kubectl apply -f k8s/deployment.yaml`

