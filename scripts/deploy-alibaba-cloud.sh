#!/bin/bash

# SovereigntyOS AI - Alibaba Cloud Deployment Script
# Automated deployment to Alibaba Container Service for Kubernetes (ACK)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sovereigntyos-ai"
NAMESPACE="sovereigntyos-ai"
REGION="cn-hangzhou"
CLUSTER_NAME="sovereigntyos-ack-cluster"
REGISTRY="registry.cn-hangzhou.aliyuncs.com"
IMAGE_REPO="$REGISTRY/sovereigntyos/ai"
IMAGE_TAG="latest"

# Functions
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

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check if required tools are installed
    local deps=("kubectl" "docker" "aliyun")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep is not installed. Please install it first."
            exit 1
        fi
    done
    
    # Check if authenticated with Alibaba Cloud
    if ! aliyun sts GetCallerIdentity &> /dev/null; then
        log_error "Not authenticated with Alibaba Cloud. Run 'aliyun configure' first."
        exit 1
    fi
    
    log_success "All dependencies are satisfied"
}

setup_kubectl_context() {
    log_info "Setting up kubectl context for ACK cluster..."
    
    # Get ACK cluster credentials
    aliyun cs GET /clusters/$CLUSTER_NAME/user_config --region $REGION > ~/.kube/config-ack
    
    # Merge with existing kubeconfig
    export KUBECONFIG=~/.kube/config:~/.kube/config-ack
    kubectl config use-context $CLUSTER_NAME
    
    # Verify connection
    if kubectl cluster-info &> /dev/null; then
        log_success "Connected to ACK cluster: $CLUSTER_NAME"
    else
        log_error "Failed to connect to ACK cluster"
        exit 1
    fi
}

build_and_push_image() {
    log_info "Building and pushing Docker image..."
    
    # Login to Alibaba Container Registry
    docker login --username=$ALIBABA_REGISTRY_USERNAME --password=$ALIBABA_REGISTRY_PASSWORD $REGISTRY
    
    # Build the image
    log_info "Building Docker image: $IMAGE_REPO:$IMAGE_TAG"
    docker build -t $IMAGE_REPO:$IMAGE_TAG .
    
    # Tag with commit SHA for versioning
    local commit_sha=$(git rev-parse --short HEAD)
    docker tag $IMAGE_REPO:$IMAGE_TAG $IMAGE_REPO:$commit_sha
    
    # Push images
    log_info "Pushing images to Alibaba Container Registry..."
    docker push $IMAGE_REPO:$IMAGE_TAG
    docker push $IMAGE_REPO:$commit_sha
    
    log_success "Image pushed successfully: $IMAGE_REPO:$IMAGE_TAG"
}

setup_namespace() {
    log_info "Setting up Kubernetes namespace..."
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_info "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f k8s/alibaba-cloud-deployment.yaml
        log_success "Namespace $NAMESPACE created"
    fi
}

setup_secrets() {
    log_info "Setting up secrets..."
    
    # Check if secrets exist
    if kubectl get secret sovereigntyos-ai-secrets -n $NAMESPACE &> /dev/null; then
        log_warning "Secrets already exist. Use --update-secrets to update them."
        return
    fi
    
    # Create secrets from environment variables
    kubectl create secret generic sovereigntyos-ai-secrets -n $NAMESPACE \
        --from-literal=DATABASE_URL="$DATABASE_URL" \
        --from-literal=REDIS_URL="$REDIS_URL" \
        --from-literal=OSS_ACCESS_KEY_ID="$OSS_ACCESS_KEY_ID" \
        --from-literal=OSS_ACCESS_KEY_SECRET="$OSS_ACCESS_KEY_SECRET" \
        --from-literal=GPT5_API_KEY="$GPT5_API_KEY" \
        --from-literal=CLAUDE_API_KEY="$CLAUDE_API_KEY" \
        --from-literal=ZAI_API_KEY="$ZAI_API_KEY" \
        --from-literal=KIMI_API_KEY="$KIMI_API_KEY"
    
    log_success "Secrets created successfully"
}

deploy_application() {
    log_info "Deploying application to ACK..."
    
    # Apply the deployment configuration
    kubectl apply -f k8s/alibaba-cloud-deployment.yaml
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment/sovereigntyos-ai -n $NAMESPACE
    
    # Get the external IP
    log_info "Getting service details..."
    kubectl get services -n $NAMESPACE
    
    log_success "Application deployed successfully!"
}

setup_monitoring() {
    log_info "Setting up monitoring and observability..."
    
    # Apply monitoring configuration if it exists
    if [ -f "k8s/monitoring.yaml" ]; then
        kubectl apply -f k8s/monitoring.yaml
        log_success "Monitoring configured"
    else
        log_warning "Monitoring configuration not found. Skipping..."
    fi
}

run_health_check() {
    log_info "Running health checks..."
    
    # Get the service endpoint
    local service_ip=$(kubectl get service sovereigntyos-ai-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$service_ip" ]; then
        log_warning "External IP not yet assigned. Health check skipped."
        return
    fi
    
    # Wait for service to be ready
    log_info "Waiting for service to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://$service_ip/health" &> /dev/null; then
            log_success "Health check passed! Service is running at http://$service_ip"
            return
        fi
        
        log_info "Attempt $attempt/$max_attempts: Service not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    exit 1
}

cleanup_old_deployments() {
    log_info "Cleaning up old deployments..."
    
    # Keep only the last 3 replica sets
    kubectl patch deployment sovereigntyos-ai -n $NAMESPACE -p '{"spec":{"revisionHistoryLimit":3}}'
    
    # Clean up old images (optional)
    if [ "$CLEANUP_OLD_IMAGES" = "true" ]; then
        log_info "Cleaning up old images from registry..."
        # Implement image cleanup logic here
    fi
    
    log_success "Cleanup completed"
}

show_deployment_info() {
    log_info "Deployment Information:"
    echo "==========================================="
    echo "Application: $APP_NAME"
    echo "Namespace: $NAMESPACE"
    echo "Region: $REGION"
    echo "Cluster: $CLUSTER_NAME"
    echo "Image: $IMAGE_REPO:$IMAGE_TAG"
    echo "==========================================="
    
    log_info "Pods:"
    kubectl get pods -n $NAMESPACE
    
    log_info "Services:"
    kubectl get services -n $NAMESPACE
    
    log_info "Ingress:"
    kubectl get ingress -n $NAMESPACE
}

# Parse command line arguments
UPDATE_SECRETS=false
SKIP_BUILD=false
CLEANUP_OLD_IMAGES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --update-secrets)
            UPDATE_SECRETS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --cleanup-images)
            CLEANUP_OLD_IMAGES=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --update-secrets   Update existing secrets"
            echo "  --skip-build       Skip building and pushing the image"
            echo "  --cleanup-images   Clean up old images from registry"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main deployment flow
main() {
    log_info "Starting SovereigntyOS AI deployment to Alibaba Cloud..."
    
    check_dependencies
    setup_kubectl_context
    
    if [ "$SKIP_BUILD" != "true" ]; then
        build_and_push_image
    fi
    
    setup_namespace
    
    if [ "$UPDATE_SECRETS" = "true" ] || ! kubectl get secret sovereigntyos-ai-secrets -n $NAMESPACE &> /dev/null; then
        setup_secrets
    fi
    
    deploy_application
    setup_monitoring
    run_health_check
    cleanup_old_deployments
    show_deployment_info
    
    log_success "🎉 SovereigntyOS AI has been successfully deployed to Alibaba Cloud!"
    log_info "You can access the application at the LoadBalancer IP shown above."
}

# Check if running directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi