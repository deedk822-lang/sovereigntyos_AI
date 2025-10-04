#!/bin/bash
# Alibaba Cloud SAE Deployment Script for SovereigntyOS AI
# This script automates the deployment of the SovereigntyOS AI functions to Serverless App Engine (SAE)

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
REGION="${ALIBABA_REGION:-cn-hangzhou}"
ACR_NAMESPACE="${ACR_NAMESPACE:-sovereigntyos-ai}"
IMAGE_NAME="${IMAGE_NAME:-sovereigntyos-cronjob}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
SAE_APP_NAME="${SAE_APP_NAME:-sovereigntyos-ai-cronjob}"
SAE_NAMESPACE_ID="${SAE_NAMESPACE_ID}"
CRON_EXPRESSION="${CRON_EXPRESSION:-0 2 1,15 * *}"  # Default: 1st and 15th at 02:00

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SovereigntyOS AI - SAE Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Alibaba Cloud CLI is installed
if ! command -v aliyun &> /dev/null; then
    log_error "Alibaba Cloud CLI (aliyun) is not installed."
    echo "Please install it from: https://www.alibabacloud.com/help/en/cli"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$SAE_NAMESPACE_ID" ]; then
    log_error "SAE_NAMESPACE_ID environment variable is not set."
    exit 1
fi

log_info "Step 1: Building Docker image..."
docker build -f Dockerfile.cronjob -t ${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} .

log_info "Step 2: Tagging image for ACR..."
ACR_REGISTRY="registry.${REGION}.aliyuncs.com"
docker tag ${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} ${ACR_REGISTRY}/${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}

log_info "Step 3: Logging into ACR..."
# Note: Ensure ACR credentials are configured via `docker login`
# docker login ${ACR_REGISTRY} -u <username> -p <password>

log_info "Step 4: Pushing image to ACR..."
docker push ${ACR_REGISTRY}/${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}

log_info "Step 5: Deploying to Alibaba Cloud SAE..."
# Check if SAE application exists
APP_EXISTS=$(aliyun sae DescribeApplication --AppId ${SAE_APP_NAME} --RegionId ${REGION} 2>&1 || echo "not_found")

if [[ "$APP_EXISTS" == *"not_found"* ]]; then
    log_info "Creating new SAE scheduled task application..."
    aliyun sae CreateApplication \
        --AppName ${SAE_APP_NAME} \
        --NamespaceId ${SAE_NAMESPACE_ID} \
        --ImageUrl ${ACR_REGISTRY}/${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} \
        --Memory 1024 \
        --Cpu 1 \
        --RegionId ${REGION} \
        --PackageType Image \
        --Replicas 1 \
        --AppSource ScheduledTask \
        --CronExpression "${CRON_EXPRESSION}"
    log_success "SAE application created successfully!"
else
    log_info "Updating existing SAE application..."
    aliyun sae UpdateApplication \
        --AppId ${SAE_APP_NAME} \
        --ImageUrl ${ACR_REGISTRY}/${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} \
        --RegionId ${REGION}
    log_success "SAE application updated successfully!"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Image: ${ACR_REGISTRY}/${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
echo -e "Region: ${REGION}"
echo -e "SAE Application: ${SAE_APP_NAME}"
echo -e "Cron Schedule: ${CRON_EXPRESSION}"
