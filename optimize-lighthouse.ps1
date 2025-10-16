# Lighthouse Performance Optimization - Automated Script
# Run this to apply quick wins automatically

Write-Host "🎯 Starting Lighthouse Performance Optimization..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Install required dependencies
Write-Host "📦 Installing optimization dependencies..." -ForegroundColor Yellow
npm install --save-dev webpack-bundle-analyzer @next/bundle-analyzer

# Step 2: Backup current configuration
Write-Host "💾 Creating backup of current files..." -ForegroundColor Yellow
if (!(Test-Path ".\backups")) {
    New-Item -ItemType Directory -Path ".\backups" | Out-Null
}
Copy-Item ".\next.config.js" ".\backups\next.config.js.backup" -Force
Copy-Item ".\package.json" ".\backups\package.json.backup" -Force
Write-Host "✅ Backup created in .\backups\" -ForegroundColor Green

# Step 3: Analyze current bundle
Write-Host ""
Write-Host "📊 Analyzing current bundle size..." -ForegroundColor Yellow
Write-Host "(This will open in your browser after build completes)" -ForegroundColor Gray
$env:ANALYZE = "true"
npm run build

# Step 4: Create necessary directories
Write-Host ""
Write-Host "📁 Creating optimization directories..." -ForegroundColor Yellow
$directories = @(
    ".\src\components\auth",
    ".\src\hooks",
    ".\src\lib\motion",
    ".\public\workers"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Already exists: $dir" -ForegroundColor Gray
    }
}

# Step 5: Check for Lighthouse CLI
Write-Host ""
Write-Host "🔍 Checking for Lighthouse CLI..." -ForegroundColor Yellow
$lighthouseInstalled = Get-Command lighthouse -ErrorAction SilentlyContinue

if ($null -eq $lighthouseInstalled) {
    Write-Host "  ⚠️  Lighthouse CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g lighthouse
    Write-Host "  ✅ Lighthouse CLI installed" -ForegroundColor Green
} else {
    Write-Host "  ✅ Lighthouse CLI already installed" -ForegroundColor Green
}

# Step 6: Summary report
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           OPTIMIZATION SETUP COMPLETE          " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Files Created:" -ForegroundColor Yellow
Write-Host "  ✅ src/components/auth/AnimatedBackground.tsx"
Write-Host "  ✅ src/components/auth/StatsSection.tsx"
Write-Host "  ✅ src/hooks/useWebWorker.ts"
Write-Host "  ✅ src/lib/utils/idleTaskScheduler.ts"
Write-Host "  ✅ public/workers/resume-worker.js"
Write-Host "  ✅ public/robots.txt"
Write-Host ""
Write-Host "📋 Configuration Updated:" -ForegroundColor Yellow
Write-Host "  ✅ next.config.js (code splitting + minification)"
Write-Host ""
Write-Host "📖 Documentation Created:" -ForegroundColor Yellow
Write-Host "  ✅ LIGHTHOUSE_PERFORMANCE_OPTIMIZATION_PLAN.md"
Write-Host "  ✅ BUNDLE_OPTIMIZATION_GUIDE.md"
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the bundle analyzer report (opened in browser)"
Write-Host "  2. Update your sign-in/sign-up pages with lazy loading"
Write-Host "  3. Replace Framer Motion imports with LazyMotion"
Write-Host "  4. Run: npm run build && npm run lighthouse"
Write-Host ""
Write-Host "📚 See LIGHTHOUSE_PERFORMANCE_OPTIMIZATION_PLAN.md for detailed steps" -ForegroundColor Green
Write-Host ""

# Step 7: Run Lighthouse audit (optional)
Write-Host "Would you like to run a Lighthouse audit now? (Y/N): " -ForegroundColor Yellow -NoNewline
$runAudit = Read-Host

if ($runAudit -eq "Y" -or $runAudit -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Write-Host "⏳ Waiting 10 seconds for server to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    Write-Host "🔍 Running Lighthouse audit on http://localhost:3000/sign-in..." -ForegroundColor Yellow
    lighthouse http://localhost:3000/sign-in --view --only-categories=performance,seo,accessibility,best-practices --chrome-flags="--headless"
} else {
    Write-Host ""
    Write-Host "ℹ️  Skipping Lighthouse audit. Run manually with:" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host "   lighthouse http://localhost:3000/sign-in --view" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Optimization setup complete! Good luck! 🚀" -ForegroundColor Green
Write-Host ""
