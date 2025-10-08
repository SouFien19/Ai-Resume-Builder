# PowerShell script to clear all resumes from the database
# Usage: .\scripts\clear-resumes.ps1

Write-Host "Starting Resume Database Cleanup" -ForegroundColor Cyan
Write-Host ""

# Check if node is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if the JavaScript script exists
$scriptPath = Join-Path $PSScriptRoot "clear-resumes.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: Script not found: $scriptPath" -ForegroundColor Red
    exit 1
}

# Load environment variables from .env.local if it exists
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from $envFile" -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  Loaded: $name" -ForegroundColor Green
        }
    }
    Write-Host ""
}

# Run the Node.js script
Write-Host "Executing cleanup script..." -ForegroundColor Cyan
Write-Host ""

node $scriptPath

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Cleanup completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Cleanup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
