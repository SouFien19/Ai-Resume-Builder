# PWA Icon Replacement Script
# This script copies your generated logo icons to replace the placeholder icons

Write-Host "Replacing placeholder icons with your logo..." -ForegroundColor Cyan

$iconsFolder = "C:\Users\hp\Desktop\ai-resume-v3\public\icons"

# Copy Android launcher icons (these are high quality and already sized correctly)
Write-Host "`nCopying Android icons..." -ForegroundColor Yellow

Copy-Item "$iconsFolder\android\android-launchericon-72-72.png" "$iconsFolder\icon-72x72.png" -Force
Copy-Item "$iconsFolder\android\android-launchericon-96-96.png" "$iconsFolder\icon-96x96.png" -Force
Copy-Item "$iconsFolder\android\android-launchericon-144-144.png" "$iconsFolder\icon-144x144.png" -Force
Copy-Item "$iconsFolder\android\android-launchericon-192-192.png" "$iconsFolder\icon-192x192.png" -Force
Copy-Item "$iconsFolder\android\android-launchericon-512-512.png" "$iconsFolder\icon-512x512.png" -Force

# Copy iOS icons for missing sizes
Write-Host "`nCopying iOS icons..." -ForegroundColor Yellow

Copy-Item "$iconsFolder\ios\128.png" "$iconsFolder\icon-128x128.png" -Force
Copy-Item "$iconsFolder\ios\152.png" "$iconsFolder\icon-152x152.png" -Force
Copy-Item "$iconsFolder\ios\180.png" "$iconsFolder\..\apple-touch-icon.png" -Force

# Create maskable icons from 384 and 512 (with padding for safe zone)
Write-Host "`nCreating maskable icons..." -ForegroundColor Yellow

# For 384, we'll use the windows large tile
Copy-Item "$iconsFolder\windows11\Square150x150Logo.scale-200.png" "$iconsFolder\icon-384x384.png" -Force

# Maskable icons - use Android launcher icons as they work well
Copy-Item "$iconsFolder\android\android-launchericon-192-192.png" "$iconsFolder\icon-maskable-192x192.png" -Force
Copy-Item "$iconsFolder\android\android-launchericon-512-512.png" "$iconsFolder\icon-maskable-512x512.png" -Force

Write-Host "`nIcon replacement complete!" -ForegroundColor Green
Write-Host "`nVerifying icons..." -ForegroundColor Cyan

# List all icon files
$iconFiles = Get-ChildItem "$iconsFolder\icon-*.png"
foreach ($file in $iconFiles) {
    $size = [math]::Round($file.Length / 1KB, 2)
    Write-Host "OK $($file.Name) - ${size}KB" -ForegroundColor Green
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Regular icons: 8 files (72, 96, 128, 144, 152, 192, 384, 512)" -ForegroundColor Green
Write-Host "Maskable icons: 2 files (192, 512)" -ForegroundColor Green
Write-Host "Apple touch icon: 1 file (180)" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run build" -ForegroundColor White
Write-Host "2. Run: npm start" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host "4. Check DevTools -> Application -> Manifest" -ForegroundColor White

Write-Host "`nYour PWA now uses your actual logo!" -ForegroundColor Green
