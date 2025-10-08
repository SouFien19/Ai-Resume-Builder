# ============================================
# Remove Console Logs Script
# Removes console.log, console.warn, console.debug
# Keeps console.error for production debugging
# ============================================

$rootPath = "c:\Users\hp\Desktop\ai-resume-v3\src"
$filesProcessed = 0
$logsRemoved = 0

Write-Host "🧹 Starting console.log cleanup..." -ForegroundColor Cyan
Write-Host "📂 Scanning: $rootPath" -ForegroundColor Yellow

# Get all TypeScript and JavaScript files
$files = Get-ChildItem -Path $rootPath -Include *.ts,*.tsx,*.js,*.jsx -Recurse -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log statements
    $content = $content -replace "console\.log\([^;]*\);?", ""
    
    # Remove console.warn statements  
    $content = $content -replace "console\.warn\([^;]*\);?", ""
    
    # Remove console.debug statements
    $content = $content -replace "console\.debug\([^;]*\);?", ""
    
    # Clean up extra blank lines
    $content = $content -replace "(?m)^\s*$\r?\n\s*$\r?\n", "`r`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesProcessed++
        $logsRemoved += (($originalContent -split "console\.log").Length - 1)
        $logsRemoved += (($originalContent -split "console\.warn").Length - 1)
        $logsRemoved += (($originalContent -split "console\.debug").Length - 1)
        Write-Host "✅ Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n📊 Cleanup Complete!" -ForegroundColor Cyan
Write-Host "Files Processed: $filesProcessed" -ForegroundColor Green
Write-Host "Console Logs Removed: ~$logsRemoved" -ForegroundColor Green
Write-Host "✅ console.error statements preserved for debugging" -ForegroundColor Yellow
