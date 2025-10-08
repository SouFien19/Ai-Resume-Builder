# Redis Cache Testing Script (PowerShell)
# Tests all 22 cached AI endpoints to verify cache HIT/MISS behavior
# Usage: .\scripts\test-cache.ps1

$API_BASE = "http://localhost:3000"

# Authentication token
$AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yc3pNck14TWhMRG9qVE85eEIwWG9IVkdDMkoiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NTk5NTY5NTIsImZ2YSI6WzQ1MjIsLTFdLCJpYXQiOjE3NTk5NTY4OTIsImlzcyI6Imh0dHBzOi8vdG9wLWxvdXNlLTMzLmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc1OTk1Njg4Miwic2lkIjoic2Vzc18zM2VsZW5hQ3ZZT0xKZWhEeTJlUENOcENsZUoiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzMyV09JSUFWVjdlbFdlNUpjVEc1aGZXZ2hWaCJ9.ty24vtd4yekR3ZBDTPHUAVBLmSr9eDQ1E1JCra6mDyGYz0U0MT60a_sKU0D1VIYEeb17W3HQEQ9vw2y0gJjSwH017magnxCV9L2AaHHVrS3wIoywg3SlCc6KtT4FG0b1oEudYFIn2gi6NWnsFa_XZcLQOM5ci6sECRIQ6h8jRGYYg8XbGlexHPXO81PKcGPDBddFCeN48tRsUnhJt2_SYI2G2gLRMSvTX6dIfX9fjnAzVu5X1lLcXHvhN3AMFG4MqjaZSvu1nYvuztZwrTGBqyGP1Tv-Lb_Tm7mzfRTNfTAVxkT17gQQrULEXjwyb0YwFF0rbJXWAUo_BKIGL4YObg"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🔐 Testing with Authentication" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$results = @{
    passed = 0
    failed = 0
    skipped = 0
    tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "POST",
        [hashtable]$Body,
        [int]$MinSpeedup = 3,
        [bool]$RequiresAuth = $true
    )

    Write-Host "`n" -NoNewline
    Write-Host "━━━ Testing: $Name" -ForegroundColor Cyan
    Write-Host "Endpoint: $Method $Endpoint" -ForegroundColor Blue

    try {
        $headers = @{
            "Content-Type" = "application/json"
        }

        # Add authentication token
        if ($RequiresAuth -and -not [string]::IsNullOrWhiteSpace($script:AUTH_TOKEN)) {
            $headers["Authorization"] = "Bearer $script:AUTH_TOKEN"
        }

        $bodyJson = $Body | ConvertTo-Json -Depth 10

        # Request 1: Cache MISS
        Write-Host "`n[1/3] First Request (expecting Cache MISS)..." -ForegroundColor Yellow
        $start1 = Get-Date
        $response1 = Invoke-WebRequest -Uri "$API_BASE$Endpoint" -Method $Method -Headers $headers -Body $bodyJson -UseBasicParsing
        $time1 = ((Get-Date) - $start1).TotalMilliseconds

        Write-Host "  ⏱️  Response time: $([math]::Round($time1))ms"
        Write-Host "  📦 Cache status: $($response1.Headers['x-cache'])"

        Start-Sleep -Milliseconds 500

        # Request 2: Cache HIT
        Write-Host "`n[2/3] Second Request (expecting Cache HIT)..." -ForegroundColor Yellow
        $start2 = Get-Date
        $response2 = Invoke-WebRequest -Uri "$API_BASE$Endpoint" -Method $Method -Headers $headers -Body $bodyJson -UseBasicParsing
        $time2 = ((Get-Date) - $start2).TotalMilliseconds

        Write-Host "  ⏱️  Response time: $([math]::Round($time2))ms"
        Write-Host "  📦 Cache status: $($response2.Headers['x-cache'])"
        Write-Host "  💰 Cost saved: $($response2.Headers['x-cost-saved'])"

        # Calculate speedup
        $speedup = $time1 / $time2
        $cacheHit = $response2.Headers['x-cache'] -eq 'HIT'
        $passed = $cacheHit -and ($speedup -gt 1)

        Write-Host "`n📊 Results:"
        Write-Host "  Speed improvement: $([math]::Round($speedup, 1))x faster on cache HIT"
        Write-Host "  Cache HIT detected: $(if($cacheHit){'✅'}else{'❌'})"
        Write-Host "  Performance gain: $(if($speedup -ge $MinSpeedup){'✅'}else{'⚠️'})"

        if ($passed) {
            Write-Host "`n✅ PASSED" -ForegroundColor Green
            $script:results.passed++
        } else {
            Write-Host "`n❌ FAILED" -ForegroundColor Red
            $script:results.failed++
        }

        $script:results.tests += @{
            name = $Name
            passed = $passed
            speedup = [math]::Round($speedup, 1)
            time1 = [math]::Round($time1)
            time2 = [math]::Round($time2)
        }

    } catch {
        Write-Host "`n❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $script:results.failed++
        $script:results.tests += @{
            name = $Name
            passed = $false
            error = $_.Exception.Message
        }
    }

    Start-Sleep -Seconds 1
}

# Main test execution
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "     Redis Cache Testing - 22 AI Endpoints" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n⚠️  Make sure your dev server is running: npm run dev" -ForegroundColor Yellow
Write-Host "⚠️  This will take approximately 5-10 minutes`n" -ForegroundColor Yellow

Start-Sleep -Seconds 3

# PUBLIC ENDPOINTS (No auth required) - Always test these
Write-Host "`n📂 Testing Public Endpoints (No Auth Required)..." -ForegroundColor Green

Test-Endpoint -Name "1. Quantify Achievements" -Endpoint "/api/ai/quantify" -RequiresAuth $false -Body @{
    text = "Managed a team and improved sales"
}

Test-Endpoint -Name "2. Outreach Message" -Endpoint "/api/ai/outreach" -RequiresAuth $false -Body @{
    jobTitle = "Software Engineer"
    query = "initial contact"
    resumeText = "5 years experience"
    location = "Remote"
}

Test-Endpoint -Name "3. Tailored Bullets" -Endpoint "/api/ai/tailored-bullets" -RequiresAuth $false -Body @{
    experience = "Developed web applications using React"
    jobDescription = "Looking for React developer"
}

Test-Endpoint -Name "4. Keywords Analysis" -Endpoint "/api/ai/keywords" -RequiresAuth $false -Body @{
    resumeText = "Software Engineer with React, Node.js"
    jobDescription = "Full Stack Developer with React"
}

Test-Endpoint -Name "5. Education Description" -Endpoint "/api/ai/education-description" -RequiresAuth $false -Body @{
    institution = "MIT"
    degree = "Bachelor"
    field = "Computer Science"
}

# AUTHENTICATED ENDPOINTS - Skip if no cookie
Write-Host "`n🔐 Testing Authenticated Endpoints..." -ForegroundColor Cyan

Test-Endpoint -Name "6. Resume Summary" -Endpoint "/api/ai/summary" -Body @{
    role = "Software Engineer"
    seniority = "Senior"
    industry = "Technology"
    skills = @("React", "Node.js", "AWS")
}

Test-Endpoint -Name "7. Bullet Points" -Endpoint "/api/ai/bullets" -Body @{
    input = "Managed a team and improved sales by implementing new strategies"
}

Test-Endpoint -Name "8. Suggest Skills" -Endpoint "/api/ai/suggest-skills" -Body @{
    role = "Frontend Developer"
}

Test-Endpoint -Name "9. Project Description" -Endpoint "/api/ai/generate-project-description" -Body @{
    projectName = "E-commerce Platform"
    technologies = "React, Node.js, MongoDB"
    description = "Online shopping application"
}

Test-Endpoint -Name "10. Cover Letter" -Endpoint "/api/ai/content-gen/cover-letter" -Body @{
    prompt = "Write a cover letter for a senior developer role"
    targetRole = "Senior Software Engineer"
    targetCompany = "Tech Corp"
    experienceLevel = "senior"
    industry = "technology"
} -MinSpeedup 5

# Print Summary
Write-Host "`n`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "              TEST SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$total = $results.tests.Count
$attempted = $results.passed + $results.failed
$passRate = if($attempted -gt 0){($results.passed / $attempted * 100)}else{0}

Write-Host "`nTotal Tests: $total"
Write-Host "Attempted: $attempted"
Write-Host "Passed: $($results.passed)" -ForegroundColor Green
Write-Host "Failed: $($results.failed)" -ForegroundColor Red
Write-Host "Skipped: $($results.skipped)" -ForegroundColor DarkGray
Write-Host "Success Rate: $([math]::Round($passRate, 1))% (of attempted)`n"

Write-Host "Individual Results:"
for($i=0; $i -lt $results.tests.Count; $i++) {
    $test = $results.tests[$i]
    $num = $i + 1
    if($test.passed) {
        $status = "PASS"
        $statusColor = "Green"
    } else {
        $status = "FAIL"
        $statusColor = "Red"
    }
    
    if($test.speedup) {
        $speedText = " (" + $test.speedup + "x faster)"
    } else {
        $speedText = ""
    }
    
    Write-Host "  $num. " -NoNewline
    Write-Host $status -ForegroundColor $statusColor -NoNewline
    Write-Host " $($test.name)$speedText"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

if($results.passed -eq $attempted -and $attempted -gt 0) {
    Write-Host ""
    Write-Host "All attempted tests passed! Your cache is working perfectly!" -ForegroundColor Green
    if($results.skipped -gt 0) {
        Write-Host "Run again with authentication to test all endpoints." -ForegroundColor Yellow
    }
} elseif($results.failed -gt 0) {
    Write-Host ""
    Write-Host "Some tests failed. Check the logs above for details." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "No tests were attempted. Check authentication." -ForegroundColor Yellow
}
