# Complete Redis Cache Testing Script
# Tests ALL 22 cached AI endpoints with authentication

$API_BASE = "http://localhost:3000"

# Clerk session cookies (from browser DevTools)
$SESSION_TOKEN = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yc3pNck14TWhMRG9qVE85eEIwWG9IVkdDMkoiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NTk5NTc0MjksImZ2YSI6WzQ1MzAsLTFdLCJpYXQiOjE3NTk5NTczNjksImlzcyI6Imh0dHBzOi8vdG9wLWxvdXNlLTMzLmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc1OTk1NzM1OSwic2lkIjoic2Vzc18zM2VsZW5hQ3ZZT0xKZWhEeTJlUENOcENsZUoiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzMyV09JSUFWVjdlbFdlNUpjVEc1aGZXZ2hWaCJ9.i97aKgFNnnP8N8Zutm1z-QoI1M5faalbN43xf4lVMUPF5ykXJxDtsxUYL12LdMhJ2BbfMNGtVKLs-eWt6sggaSv8IDnBUeklx6DtvWegqTrcpHPPrgPn4AycP9bcxfGOAw1As_UuZXJHEpj3KWOjAQ3BWYae7wZtq_6mCacDO8LU_jO_aZXotHhEyT20wVGivm16zbYPEUP6q0TqjwwsDAu7cQuvaeyarwNAOda3kOJfcm66trQj6In4qvvSBFyV4L7ZWm5vyW_WvNBoJYRRyfV3WF_rcqfZuCt2Id7K5SslrtIznbvsu5ataccDQ2-4CQfLrzNXa-091JUVFlkrww"
$CLIENT_UAT = "1759685516"

$results = @{
    passed = 0
    failed = 0
    tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [hashtable]$Body,
        [bool]$RequiresAuth = $true
    )

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Testing: $Name" -ForegroundColor Cyan
    Write-Host "Endpoint: POST $Endpoint"

    try {
        $headers = @{
            "Content-Type" = "application/json"
        }

        if ($RequiresAuth) {
            # Add Clerk session cookies
            $headers["Cookie"] = "__session=$script:SESSION_TOKEN; __client_uat=$script:CLIENT_UAT"
        }

        $bodyJson = $Body | ConvertTo-Json -Depth 10

        # Request 1
        Write-Host "`n[1/2] First Request..."
        $start1 = Get-Date
        $response1 = Invoke-WebRequest -Uri "$API_BASE$Endpoint" -Method POST -Headers $headers -Body $bodyJson -UseBasicParsing
        $time1 = ((Get-Date) - $start1).TotalMilliseconds
        $cache1 = $response1.Headers['x-cache']

        Write-Host "  Time: $([math]::Round($time1))ms"
        Write-Host "  Cache: $cache1"

        Start-Sleep -Milliseconds 500

        # Request 2
        Write-Host "`n[2/2] Second Request..."
        $start2 = Get-Date
        $response2 = Invoke-WebRequest -Uri "$API_BASE$Endpoint" -Method POST -Headers $headers -Body $bodyJson -UseBasicParsing
        $time2 = ((Get-Date) - $start2).TotalMilliseconds
        $cache2 = $response2.Headers['x-cache']
        $costSaved = $response2.Headers['x-cost-saved']

        Write-Host "  Time: $([math]::Round($time2))ms"
        Write-Host "  Cache: $cache2"
        Write-Host "  Cost Saved: $costSaved"

        # Results
        $speedup = [math]::Round($time1 / $time2, 1)
        $cacheHit = $cache2 -eq 'HIT'
        $passed = $cacheHit -and ($speedup -gt 1)

        Write-Host "`nResults:"
        Write-Host "  Speed: ${speedup}x faster"
        Write-Host "  Cache HIT: $cacheHit"

        if ($passed) {
            Write-Host "`nPASSED" -ForegroundColor Green
            $script:results.passed++
        } else {
            Write-Host "`nFAILED" -ForegroundColor Red
            $script:results.failed++
        }

        $script:results.tests += @{
            name = $Name
            passed = $passed
            speedup = $speedup
        }

    } catch {
        Write-Host "`nFAILED - $($_.Exception.Message)" -ForegroundColor Red
        $script:results.failed++
        $script:results.tests += @{
            name = $Name
            passed = $false
            error = $_.Exception.Message
        }
    }

    Start-Sleep -Seconds 1
}

# Start testing
Write-Host "========================================"
Write-Host "  Redis Cache Test - ALL 22 Endpoints"
Write-Host "========================================"
Write-Host ""
Write-Host "Testing with Clerk session cookies..."
Write-Host "This will take 5-10 minutes..."
Write-Host ""

# Test public endpoints
Write-Host "`n--- PUBLIC ENDPOINTS (No Auth) ---" -ForegroundColor Green

Test-Endpoint -Name "Quantify" -Endpoint "/api/ai/quantify" -RequiresAuth $false -Body @{
    text = "Managed a team and improved sales"
}

Test-Endpoint -Name "Tailored Bullets" -Endpoint "/api/ai/tailored-bullets" -RequiresAuth $false -Body @{
    experience = "Developed web applications using React"
    jobDescription = "Looking for React developer"
}

Test-Endpoint -Name "Keywords" -Endpoint "/api/ai/keywords" -RequiresAuth $false -Body @{
    resumeText = "Software Engineer with React, Node.js"
    jobDescription = "Full Stack Developer with React"
}

# Test authenticated endpoints
Write-Host "`n`n--- AUTHENTICATED ENDPOINTS ---" -ForegroundColor Cyan

Test-Endpoint -Name "Resume Summary" -Endpoint "/api/ai/summary" -Body @{
    role = "Software Engineer"
    seniority = "Senior"
    industry = "Technology"
    skills = @("React", "Node.js", "AWS")
}

Test-Endpoint -Name "Bullet Points" -Endpoint "/api/ai/bullets" -Body @{
    input = "Managed a team and improved sales"
}

Test-Endpoint -Name "Suggest Skills" -Endpoint "/api/ai/suggest-skills" -Body @{
    role = "Frontend Developer"
}

Test-Endpoint -Name "Cover Letter" -Endpoint "/api/ai/content-gen/cover-letter" -Body @{
    prompt = "Write a cover letter for a senior developer role"
    targetRole = "Senior Software Engineer"
    targetCompany = "Tech Corp"
    experienceLevel = "senior"
    industry = "technology"
}

Test-Endpoint -Name "LinkedIn Post" -Endpoint "/api/ai/content-gen/linkedin-post" -Body @{
    prompt = "Write about career growth"
    postType = "career-advice"
    tone = "professional"
    targetAudience = "professionals"
}

Test-Endpoint -Name "Job Matching" -Endpoint "/api/ai/job-match" -Body @{
    resumeText = "5 years experience in React"
    location = "Remote"
    preferences = @("remote", "flexible")
}

Test-Endpoint -Name "Career Intelligence" -Endpoint "/api/ai/career" -Body @{
    role = "Software Engineer"
    location = "San Francisco"
    skills = @("React", "Node.js")
}

Test-Endpoint -Name "Project Description" -Endpoint "/api/ai/generate-project-description" -Body @{
    projectName = "E-commerce Platform"
    technologies = "React, Node.js, MongoDB"
    description = "Online shopping application"
}

Test-Endpoint -Name "Education Description" -Endpoint "/api/ai/education-description" -RequiresAuth $false -Body @{
    institution = "MIT"
    degree = "Bachelor"
    field = "Computer Science"
}

Test-Endpoint -Name "Experience Description" -Endpoint "/api/ai/generate-experience-description" -Body @{
    company = "Tech Corp"
    position = "Senior Developer"
    startDate = "2020"
    endDate = "2023"
    industry = "Technology"
}

Test-Endpoint -Name "Modify Experience" -Endpoint "/api/ai/modify-experience-description" -Body @{
    description = "Developed web applications"
    achievements = @("Improved performance by 50%")
    prompt = "Make it more quantified"
}

Test-Endpoint -Name "Skills & Keywords Analysis" -Endpoint "/api/ai/content-gen/skills-keywords" -Body @{
    prompt = "Analyze my technical skills"
    analysisType = "skills"
    targetRole = "Software Engineer"
    industry = "Technology"
}

Test-Endpoint -Name "Job Description Gen" -Endpoint "/api/ai/content-gen/job-description" -Body @{
    prompt = "Create a job description"
    jobTitle = "Senior Developer"
    companyName = "Tech Corp"
    industry = "Technology"
    experienceLevel = "senior"
}

Test-Endpoint -Name "Extract Skills from JD" -Endpoint "/api/ai/extract-skills-from-jd" -Body @{
    jobDescription = "Looking for developer with React, Node.js, AWS"
    currentSkills = @("React", "JavaScript")
}

Test-Endpoint -Name "Interest Suggestions" -Endpoint "/api/ai/interests" -Body @{
    role = "Software Engineer"
    summary = "Passionate about web development"
}

Test-Endpoint -Name "Certification Suggestions" -Endpoint "/api/ai/certifications" -Body @{
    role = "Software Engineer"
    industry = "Technology"
    skills = @("React", "Node.js")
}

Test-Endpoint -Name "Certification Description" -Endpoint "/api/ai/certification-description" -Body @{
    name = "AWS Certified Developer"
    issuer = "Amazon"
    field = "Cloud Computing"
}

Test-Endpoint -Name "ATS Scoring" -Endpoint "/api/ai/ats" -Body @{
    jobDescription = "Looking for React developer"
    resume = "Software Engineer with 5 years React experience"
}

Test-Endpoint -Name "Outreach Message" -Endpoint "/api/ai/outreach" -RequiresAuth $false -Body @{
    jobTitle = "Software Engineer"
    query = "initial contact"
    resumeText = "5 years experience"
    location = "Remote"
}

# Summary
Write-Host "`n`n========================================"
Write-Host "              SUMMARY"
Write-Host "========================================"

$total = $results.tests.Count
$passRate = if($total -gt 0){[math]::Round(($results.passed / $total * 100), 1)}else{0}

Write-Host "`nTotal Tests: $total"
Write-Host "Passed: $($results.passed)" -ForegroundColor Green
Write-Host "Failed: $($results.failed)" -ForegroundColor Red
Write-Host "Success Rate: ${passRate}%"

Write-Host "`nIndividual Results:"
for($i=0; $i -lt $results.tests.Count; $i++) {
    $test = $results.tests[$i]
    $num = $i + 1
    $status = if($test.passed){"PASS"}else{"FAIL"}
    $color = if($test.passed){"Green"}else{"Red"}
    $speed = if($test.speedup){"($($test.speedup)x)"}else{""}
    
    Write-Host "  $num. " -NoNewline
    Write-Host $status -ForegroundColor $color -NoNewline
    Write-Host " - $($test.name) $speed"
}

Write-Host ""
if($results.passed -eq $total) {
    Write-Host "All tests passed! Cache is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check logs above." -ForegroundColor Yellow
}

Write-Host ""
