#!/bin/bash

# Build and run the dev server with hot-reloading
IMAGE_NAME="opportunisticoutdoors.club"
CONTAINER_NAME="opportunisticoutdoorsclub-dev"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Stop and remove existing containers if running
docker rm -f $CONTAINER_NAME opportunisticoutdoorsclub-dev-preview 2>/dev/null

# Build the image
echo -e "\033[36mBuilding Docker image...\033[0m"
docker build -t $IMAGE_NAME .

# Run the container with volume mount for hot-reloading
echo -e "\033[36mStarting dev server with hot-reloading...\033[0m"
docker run -d --name $CONTAINER_NAME -p 5173:5173 -v "$SCRIPT_DIR:/app" -v /app/node_modules $IMAGE_NAME

echo -e "\n\033[32mDev server available at: http://localhost:5173\033[0m"
echo -e "\033[36mHot-reloading enabled - edit files and see changes instantly\033[0m"
echo -e "\033[33mTo stop: docker rm -f $CONTAINER_NAME\033[0m"
