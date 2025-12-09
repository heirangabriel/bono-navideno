#!/bin/bash

# Build and Push Docker Image to Docker Hub
# Usage: ./build-and-push.sh [tag]

set -e

# Default values
DOCKER_USERNAME=${DOCKER_USERNAME:-"your-dockerhub-username"}
IMAGE_NAME="bono-navideno"
TAG=${1:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building and Pushing Bono Navideño Docker Image${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if user is logged in to Docker Hub
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to Docker Hub first:${NC}"
    echo "docker login"
    exit 1
fi

# Build the Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG} .

# Tag as latest if not already
if [ "$TAG" != "latest" ]; then
    echo -e "${BLUE}🏷️  Tagging as latest...${NC}"
    docker tag ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG} ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
fi

# Push the image
echo -e "${BLUE}📤 Pushing image to Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}

if [ "$TAG" != "latest" ]; then
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
fi

echo -e "${GREEN}✅ Successfully built and pushed ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}${NC}"
echo -e "${GREEN}🌐 Image available at: https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}${NC}"
echo ""
echo -e "${YELLOW}📋 To run the container locally:${NC}"
echo "docker run -d -p 8080:80 --name bono-navideno ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"
echo ""
echo -e "${YELLOW}📋 Or using docker-compose:${NC}"
echo "docker-compose up -d"
