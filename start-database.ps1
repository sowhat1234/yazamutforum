# PowerShell script to start a docker container for a local development database
# This is the PowerShell equivalent of start-database.sh

# Check if Docker is installed and running
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker Desktop and try again."
    Write-Host "Docker Desktop for Windows: https://docs.docker.com/docker-for-windows/install/"
    exit 1
}

# Check if Docker daemon is running
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker daemon is not running. Please start Docker Desktop and try again."
    exit 1
}

# Read environment variables from .env file
if (-not (Test-Path ".env")) {
    Write-Error ".env file not found. Please make sure you're in the correct directory."
    exit 1
}

# Parse DATABASE_URL from .env file
$envContent = Get-Content ".env"
$databaseUrl = ($envContent | Where-Object { $_ -match "^DATABASE_URL=" }) -replace "DATABASE_URL=", "" -replace '"', ''

if (-not $databaseUrl) {
    Write-Error "DATABASE_URL not found in .env file."
    exit 1
}

# Parse database connection details from URL
# Format: postgresql://postgres:password@localhost:5432/yazamutforum
$uri = [System.Uri]$databaseUrl
$dbPassword = $uri.UserInfo.Split(':')[1]
$dbPort = $uri.Port
$dbName = $uri.Segments[1]
$dbContainerName = "$dbName-postgres"

Write-Host "Database details:"
Write-Host "  Name: $dbName"
Write-Host "  Port: $dbPort"
Write-Host "  Container: $dbContainerName"

# Check if port is already in use
$portInUse = Test-NetConnection -ComputerName localhost -Port $dbPort -InformationLevel Quiet
if ($portInUse) {
    Write-Warning "Port $dbPort is already in use."
    $continue = Read-Host "Do you want to continue anyway? [y/N]"
    if ($continue -notmatch "^[Yy]$") {
        Write-Host "Aborting."
        exit 1
    }
}

# Check if container is already running
$runningContainer = docker ps -q -f name=$dbContainerName
if ($runningContainer) {
    Write-Host "Database container '$dbContainerName' already running"
    exit 0
}

# Check if container exists but is stopped
$existingContainer = docker ps -q -a -f name=$dbContainerName
if ($existingContainer) {
    Write-Host "Starting existing database container '$dbContainerName'..."
    docker start $dbContainerName
    Write-Host "Existing database container '$dbContainerName' started"
    exit 0
}

# Warn about default password
if ($dbPassword -eq "password") {
    Write-Warning "You are using the default database password"
    $generatePassword = Read-Host "Should we generate a random password for you? [y/N]"
    if ($generatePassword -match "^[Yy]$") {
        # Generate a random URL-safe password
        $dbPassword = [System.Web.Security.Membership]::GeneratePassword(16, 0) -replace '[^a-zA-Z0-9]', ''
        $newDatabaseUrl = $databaseUrl -replace ":password@", ":$dbPassword@"
        
        # Update .env file
        $envContent = $envContent | ForEach-Object { 
            if ($_ -match "^DATABASE_URL=") {
                "DATABASE_URL=`"$newDatabaseUrl`""
            } else {
                $_
            }
        }
        $envContent | Set-Content ".env"
        Write-Host "Generated new password and updated .env file"
    }
}

# Create and start the container
Write-Host "Creating database container '$dbContainerName'..."
docker run -d `
  --name $dbContainerName `
  -e POSTGRES_USER="postgres" `
  -e POSTGRES_PASSWORD="$dbPassword" `
  -e POSTGRES_DB="$dbName" `
  -p "${dbPort}:5432" `
  postgres:15

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database container '$dbContainerName' was successfully created"
    Write-Host "Waiting for database to be ready..."
    Start-Sleep -Seconds 5
} else {
    Write-Error "Failed to create database container"
    exit 1
}
