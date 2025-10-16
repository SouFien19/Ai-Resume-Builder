# Setup Favicons from Generated Icons
# This script copies your generated icons to the correct locations

Write-Host "🎨 Setting up favicons for all browsers..." -ForegroundColor Cyan

# Create backup of existing favicon if it exists
if (Test-Path "public\favicon.ico") {
    Copy-Item "public\favicon.ico" "public\favicon.ico.backup" -Force
    Write-Host "✅ Backed up existing favicon.ico" -ForegroundColor Green
}

# Copy 16x16 icon for favicon (smallest iOS icon)
if (Test-Path "public\icons\ios\16.png") {
    Copy-Item "public\icons\ios\16.png" "public\favicon-16x16.png" -Force
    Write-Host "✅ Copied favicon-16x16.png" -ForegroundColor Green
}

# Copy 32x32 icon for favicon
if (Test-Path "public\icons\ios\32.png") {
    Copy-Item "public\icons\ios\32.png" "public\favicon-32x32.png" -Force
    Write-Host "✅ Copied favicon-32x32.png" -ForegroundColor Green
}

# Copy 180x180 for Apple Touch Icon
if (Test-Path "public\icons\ios\180.png") {
    Copy-Item "public\icons\ios\180.png" "public\apple-touch-icon.png" -Force
    Write-Host "✅ Copied apple-touch-icon.png (180x180)" -ForegroundColor Green
}

# Copy 192x192 for Android
if (Test-Path "public\icons\android\android-launchericon-192-192.png") {
    Copy-Item "public\icons\android\android-launchericon-192-192.png" "public\icon-192x192.png" -Force
    Write-Host "✅ Copied icon-192x192.png" -ForegroundColor Green
}

# Copy 512x512 for Android
if (Test-Path "public\icons\android\android-launchericon-512-512.png") {
    Copy-Item "public\icons\android\android-launchericon-512-512.png" "public\icon-512x512.png" -Force
    Write-Host "✅ Copied icon-512x512.png" -ForegroundColor Green
}

# Copy 32x32 to src/app for Next.js App Router icon convention
$appDir = "src\app"
if (Test-Path "public\icons\ios\32.png") {
    Copy-Item "public\icons\ios\32.png" "$appDir\icon.png" -Force
    Write-Host "✅ Copied icon.png to app directory (Next.js convention)" -ForegroundColor Green
}

# Copy apple touch icon to app directory too
if (Test-Path "public\icons\ios\180.png") {
    Copy-Item "public\icons\ios\180.png" "$appDir\apple-icon.png" -Force
    Write-Host "✅ Copied apple-icon.png to app directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Icon setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Convert favicon-32x32.png to favicon.ico using:" -ForegroundColor White
Write-Host "   https://convertio.co/png-ico/" -ForegroundColor Cyan
Write-Host "2. Or use ImageMagick: convert favicon-32x32.png favicon.ico" -ForegroundColor Cyan
Write-Host "3. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "4. Restart dev server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Files created:" -ForegroundColor Yellow
Get-ChildItem "public\favicon-*.png", "public\apple-touch-icon.png", "public\icon-*.png" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  OK $($_.Name)" -ForegroundColor Green
}
Get-ChildItem "$appDir\icon.png", "$appDir\apple-icon.png" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  OK app/$($_.Name)" -ForegroundColor Green
}
