# PowerShell script to fix all template files efficiently
# Removes data.template references that don't exist on ResumeData type

$files = @(
    "Ditto.tsx",
    "Gengar.tsx",
    "Glalie.tsx",
    "Kakuna.tsx",
    "Leafish.tsx",
    "Nosepass.tsx",
    "Onyx.tsx",
    "Pikachu.tsx",
    "Rhyhorn.tsx"
)

$basePath = "src/components/resume/templates"

foreach ($file in $files) {
    $filePath = Join-Path $basePath $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Remove template data lines
        $content = $content -replace '(?ms)  const templateData = data\.template \|\| \{\};.*?  const sections = templateData\.sections \|\| \{\};', '  // Use only data.content'
        
        # Fix all basics references
        $content = $content -replace '\|\| basics\.name \|\| ""', '|| ""'
        $content = $content -replace '\|\| basics\.headline \|\| ""', '|| ""'
        $content = $content -replace '\|\| basics\.email \|\| ""', '|| ""'
        $content = $content -replace '\|\| basics\.phone \|\| ""', '|| ""'
        $content = $content -replace '\|\| basics\.location \|\| ""', '|| ""'
        $content = $content -replace '\|\| basics\.url\?\.href \|\| ""', '|| ""'
        $content = $content -replace '\|\| basics\.picture\?\.url \|\| ""', '|| ""'
        
        # Fix sections references  
        $content = $content -replace 'sections\.summary\?\.content \|\| ""', 'personalInfo.summary || ""'
        $content = $content -replace 'sections\.experience\?\.items \|\| workExperience', 'workExperience'
        $content = $content -replace 'sections\.education\?\.items \|\| education', 'education'
        $content = $content -replace 'skills\.length > 0 \? skills : sections\.skills\?\.items \|\| \[\]', 'skills'
        $content = $content -replace 'sections\.projects\?\.items \|\| projects', 'projects'
        $content = $content -replace 'sections\.certifications\?\.items \|\| certifications', 'certifications'
        $content = $content -replace 'sections\.languages\?\.items \|\| languages', 'languages'
        $content = $content -replace 'sections\.profiles\?\.items \|\| \[\]', 'personalInfo.profiles || []'
        
        # Fix style.colors access
        $content = $content -replace 'style\?\.colors\?\.', '(style as any)?.colors?.'
        
        Set-Content $filePath -Value $content -NoNewline
        
        Write-Host "Fixed $file" -ForegroundColor Green
    }
}

Write-Host "All template files fixed!" -ForegroundColor Green
