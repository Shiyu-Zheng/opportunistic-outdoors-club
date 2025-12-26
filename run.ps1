# Build and run the dev server with hot-reloading
$imageName = "opportunisticoutdoors.club"
$containerName = "opportunisticoutdoorsclub-dev"

# Stop and remove existing containers if running
docker rm -f $containerName opportunisticoutdoorsclub-dev-preview 2>$null

# Build the image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t $imageName .

# Run the container with volume mount for hot-reloading
Write-Host "Starting dev server with hot-reloading..." -ForegroundColor Cyan
docker run -d --name $containerName -p 5173:5173 -v "${PSScriptRoot}:/app" -v /app/node_modules $imageName

Write-Host "`nDev server available at: http://localhost:5173" -ForegroundColor Green
Write-Host "Hot-reloading enabled - edit files and see changes instantly" -ForegroundColor Cyan
Write-Host "To stop: docker rm -f $containerName" -ForegroundColor Yellow
