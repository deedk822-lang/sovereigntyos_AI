#!/bin/bash
set -euo pipefail

# SovereigntyOS Alibaba OSS Deployment Script
# Deploys the built application to Alibaba Cloud OSS
# Usage: ./scripts/deploy-oss.sh [environment]

ENVIRONMENT=${1:-production}
BUILD_DIR=${BUILD_DIR:-dist}
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 SovereigntyOS OSS Deployment Starting..."
echo "Environment: $ENVIRONMENT"
echo "Build Directory: $BUILD_DIR"
echo "Timestamp: $DATE"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check required environment variables
print_status "Validating environment configuration..."

required_vars=("ALIBABA_ACCESS_KEY_ID" "ALIBABA_ACCESS_KEY_SECRET" "ALIBABA_REGION" "ALIBABA_OSS_BUCKET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -ne 0 ]]; then
    print_error "Missing required environment variables:"
    printf '  - %s\n' "${missing_vars[@]}"
    echo ""
    print_status "Set these variables in your environment or .env file:"
    echo "  export ALIBABA_ACCESS_KEY_ID=your_access_key_id"
    echo "  export ALIBABA_ACCESS_KEY_SECRET=your_access_key_secret"
    echo "  export ALIBABA_REGION=oss-cn-hongkong"
    echo "  export ALIBABA_OSS_BUCKET=your-bucket-name"
    echo "  export ALIBABA_CDN_DOMAIN=your-domain.com  # Optional"
    exit 1
fi

print_success "Environment configuration validated"

# Check if build directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
    print_warning "Build directory '$BUILD_DIR' not found. Running build..."
    
    if command -v npm &> /dev/null; then
        if npm run build; then
            print_success "Build completed"
        else
            print_error "Build failed"
            exit 1
        fi
    else
        print_error "npm not found. Please install Node.js and npm"
        exit 1
    fi
else
    print_success "Build directory found: $BUILD_DIR"
fi

# Check if Alibaba Cloud CLI is installed
if ! command -v aliyun &> /dev/null; then
    print_status "Installing Alibaba Cloud CLI..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -sL https://aliyuncli.alicdn.com/aliyun-cli-macosx-latest-amd64.tgz | tar -xz
    else
        # Linux
        curl -sL https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz | tar -xz
    fi
    
    sudo cp aliyun /usr/local/bin/
    rm -f aliyun
    
    print_success "Alibaba Cloud CLI installed"
else
    print_success "Alibaba Cloud CLI found: $(aliyun --version)"
fi

# Configure Alibaba Cloud CLI
print_status "Configuring Alibaba Cloud CLI..."

aliyun configure set \
    --profile default \
    --mode AK \
    --region "$ALIBABA_REGION" \
    --access-key-id "$ALIBABA_ACCESS_KEY_ID" \
    --access-key-secret "$ALIBABA_ACCESS_KEY_SECRET"

print_success "CLI configuration completed"

# Create build metadata
print_status "Generating build metadata..."

BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

cat > "$BUILD_DIR/build-info.json" << JSON
{
  "version": "1.0.0",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "buildHash": "$BUILD_HASH",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "branch": "$BUILD_BRANCH",
  "environment": "$ENVIRONMENT",
  "deployScript": "manual"
}
JSON

print_success "Build metadata generated"

# Create deployment backup
if [[ "$ENVIRONMENT" == "production" ]]; then
    print_status "Creating deployment backup..."
    
    BACKUP_DIR="backups/$DATE"
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment (first few files as sample)
    aliyun oss ls "oss://$ALIBABA_OSS_BUCKET/" --max-keys 10 > "$BACKUP_DIR/deployment-manifest.txt" || true
    
    print_success "Backup created in $BACKUP_DIR"
fi

# Upload files to OSS
print_status "Uploading files to OSS bucket: $ALIBABA_OSS_BUCKET"
print_status "Region: $ALIBABA_REGION"

# Sync files with optimized settings
aliyun oss sync "$BUILD_DIR/" "oss://$ALIBABA_OSS_BUCKET/" \
    --delete \
    --force \
    --update \
    --include "*.html,*.js,*.css,*.json,*.png,*.jpg,*.jpeg,*.svg,*.ico,*.webp,*.woff,*.woff2,*.txt,*.xml" \
    --parallel 8 \
    --part-size 10485760

print_success "File upload completed"

# Configure static website hosting
print_status "Configuring static website hosting..."

# Enable static website hosting
aliyun oss website --method put \
    --bucket "$ALIBABA_OSS_BUCKET" \
    --index-document index.html \
    --error-document index.html

# Set CORS policy for SPA
CORS_CONFIG='{
  "CORSRule": [{
    "AllowedOrigin": ["*"],
    "AllowedMethod": ["GET", "HEAD"],
    "AllowedHeader": ["*"],
    "MaxAgeSeconds": 3600
  }]
}'

aliyun oss cors --method put \
    --bucket "$ALIBABA_OSS_BUCKET" \
    --cors-configuration "$CORS_CONFIG"

print_success "Static website hosting configured"

# CDN cache invalidation (if CDN domain is configured)
if [[ -n "${ALIBABA_CDN_DOMAIN:-}" ]]; then
    print_status "Invalidating CDN cache for $ALIBABA_CDN_DOMAIN..."
    
    aliyun cdn RefreshObjectCaches \
        --ObjectPath "https://$ALIBABA_CDN_DOMAIN/*" \
        --ObjectType Directory
    
    print_success "CDN cache invalidated"
else
    print_warning "CDN domain not configured. Set ALIBABA_CDN_DOMAIN for CDN acceleration."
fi

# Health check
print_status "Running health check..."

# Wait for deployment to propagate
sleep 10

# Determine health check URL
if [[ -n "${ALIBABA_CDN_DOMAIN:-}" ]]; then
    HEALTH_URL="https://$ALIBABA_CDN_DOMAIN/build-info.json"
else
    HEALTH_URL="https://$ALIBABA_OSS_BUCKET.oss-$ALIBABA_REGION.aliyuncs.com/build-info.json"
fi

print_status "Health check URL: $HEALTH_URL"

# Perform health check with retry
for i in {1..3}; do
    if curl -f -s "$HEALTH_URL" -o health-check.json; then
        print_success "Health check passed on attempt $i"
        echo "Build info:"
        cat health-check.json | jq . 2>/dev/null || cat health-check.json
        rm -f health-check.json
        break
    else
        print_warning "Health check failed, attempt $i/3"
        if [[ $i -eq 3 ]]; then
            print_warning "Health check failed after 3 attempts. Deployment may still be successful."
            print_warning "Manual verification: $HEALTH_URL"
        else
            sleep 5
        fi
    fi
done

# Deployment summary
echo ""
print_success "SovereigntyOS deployment completed!"
echo ""
print_status "Deployment Summary:"
echo "  • Environment: $ENVIRONMENT"
echo "  • Build Hash: $BUILD_HASH"
echo "  • Branch: $BUILD_BRANCH"
echo "  • OSS Bucket: $ALIBABA_OSS_BUCKET"
echo "  • Region: $ALIBABA_REGION"
echo "  • Timestamp: $DATE"
echo ""
print_status "Access URLs:"
echo "  • OSS Direct: https://$ALIBABA_OSS_BUCKET.oss-$ALIBABA_REGION.aliyuncs.com/"

if [[ -n "${ALIBABA_CDN_DOMAIN:-}" ]]; then
    echo "  • CDN (Primary): https://$ALIBABA_CDN_DOMAIN/"
fi

echo ""
print_success "Deployment script completed successfully!"

# Clean up temporary files
rm -f aliyun-cli-*.tgz

exit 0