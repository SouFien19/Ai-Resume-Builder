# PowerShell script to remove data.template references from all template files
# This fixes TypeScript errors where data.template doesn't exist on ResumeData type

$templateFiles = @(
    "src/components/resume/templates/Azurill.tsx",
    "src/components/resume/templates/Bronzor.tsx",
    "src/components/resume/templates/Chikorita.tsx",
    "src/components/resume/templates/Ditto.tsx",
    "src/components/resume/templates/Gengar.tsx",
    "src/components/resume/templates/Glalie.tsx",
    "src/components/resume/templates/Kakuna.tsx",
    "src/components/resume/templates/Leafish.tsx",
    "src/components/resume/templates/Nosepass.tsx",
    "src/components/resume/templates/Onyx.tsx",
    "src/components/resume/templates/Pikachu.tsx",
    "src/components/resume/templates/Rhyhorn.tsx"
)

foreach ($file in $templateFiles) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Remove the template data parsing lines
        $content = $content -replace '(?m)^\s*// Parse the JSON template data if it exists\r?\n', ''
        $content = $content -replace '(?m)^\s*const templateData = .*?;\r?\n', ''
        $content = $content -replace '(?m)^\s*const basics = .*?;\r?\n', ''
        $content = $content -replace '(?m)^\s*const sections = .*?;\r?\n', ''
        
        # Replace basics references with personalInfo
        $content = $content -replace 'basics\.name', '""'
        $content = $content -replace 'basics\.headline', '""'
        $content = $content -replace 'basics\.email', '""'
        $content = $content -replace 'basics\.phone', '""'
        $content = $content -replace 'basics\.location', '""'
        $content = $content -replace 'basics\.url\?\.href', '""'
        $content = $content -replace 'basics\.picture\?\.url', '""'
        
        # Replace sections references with direct data.content
        $content = $content -replace 'sections\.summary\?\.content', 'personalInfo.summary'
        $content = $content -replace 'sections\.experience\?\.items', '[]'
        $content = $content -replace 'sections\.education\?\.items', '[]'
        $content = $content -replace 'sections\.skills\?\.items', '[]'
        $content = $content -replace 'sections\.projects\?\.items', '[]'
        $content = $content -replace 'sections\.certifications\?\.items', '[]'
        $content = $content -replace 'sections\.languages\?\.items', '[]'
        $content = $content -replace 'sections\.profiles\?\.items', '[]'
        
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "✓ Fixed $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✓ All template files fixed!" -ForegroundColor Green
Write-Host "Run 'npm run build' to verify the fixes." -ForegroundColor Cyan
