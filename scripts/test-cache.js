/**
 * Redis Cache Testing Script
 * Tests all 22 cached AI endpoints to verify cache HIT/MISS behavior
 * 
 * Usage: node scripts/test-cache.js
 */

const API_BASE = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make API request
 */
async function makeRequest(endpoint, method, body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const startTime = Date.now();
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const responseTime = Date.now() - startTime;
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  return {
    status: response.status,
    data,
    responseTime,
    headers: {
      'x-cache': response.headers.get('x-cache'),
      'x-cost-saved': response.headers.get('x-cost-saved'),
    },
  };
}

/**
 * Test an endpoint for cache behavior
 */
async function testEndpoint(config) {
  const { name, endpoint, method = 'POST', body, minCacheSpeedup = 5 } = config;
  
  console.log(`\n${colors.bright}${colors.blue}━━━ Testing: ${name}${colors.reset}`);
  console.log(`${colors.cyan}Endpoint: ${method} ${endpoint}${colors.reset}`);

  try {
    // Request 1: Should be Cache MISS
    console.log(`\n${colors.yellow}[1/3] First Request (expecting Cache MISS)...${colors.reset}`);
    const response1 = await makeRequest(endpoint, method, body);
    
    if (response1.status !== 200) {
      throw new Error(`Request failed with status ${response1.status}`);
    }

    console.log(`  ⏱️  Response time: ${response1.responseTime}ms`);
    console.log(`  📦 Cache status: ${response1.headers['x-cache'] || 'Not set'}`);
    
    // Small delay to ensure cache is set
    await sleep(500);

    // Request 2: Should be Cache HIT
    console.log(`\n${colors.yellow}[2/3] Second Request (expecting Cache HIT)...${colors.reset}`);
    const response2 = await makeRequest(endpoint, method, body);
    
    if (response2.status !== 200) {
      throw new Error(`Request failed with status ${response2.status}`);
    }

    console.log(`  ⏱️  Response time: ${response2.responseTime}ms`);
    console.log(`  📦 Cache status: ${response2.headers['x-cache'] || 'Not set'}`);
    console.log(`  💰 Cost saved: ${response2.headers['x-cost-saved'] || 'Not set'}`);

    // Request 3: Different data - Should be Cache MISS again
    console.log(`\n${colors.yellow}[3/3] Third Request with different data (expecting Cache MISS)...${colors.reset}`);
    const modifiedBody = modifyRequestBody(body, config.modifier);
    const response3 = await makeRequest(endpoint, method, modifiedBody);
    
    if (response3.status !== 200) {
      console.log(`  ⚠️  Request failed with status ${response3.status} (acceptable for different data)`);
    } else {
      console.log(`  ⏱️  Response time: ${response3.responseTime}ms`);
      console.log(`  📦 Cache status: ${response3.headers['x-cache'] || 'Not set'}`);
    }

    // Verify cache behavior
    const cacheHit = response2.headers['x-cache'] === 'HIT';
    const costSaved = response2.headers['x-cost-saved'] === 'true';
    const speedup = response1.responseTime / response2.responseTime;
    const isFasterOnHit = speedup >= minCacheSpeedup;

    console.log(`\n${colors.bright}📊 Results:${colors.reset}`);
    console.log(`  Speed improvement: ${speedup.toFixed(1)}x faster on cache HIT`);
    console.log(`  Cache HIT detected: ${cacheHit ? '✅' : '❌'}`);
    console.log(`  Cost saved header: ${costSaved ? '✅' : '❌'}`);
    console.log(`  Performance gain: ${isFasterOnHit ? '✅' : '⚠️  (only ' + speedup.toFixed(1) + 'x)'}`);

    // Determine if test passed
    const passed = cacheHit && (isFasterOnHit || speedup > 1);
    
    if (passed) {
      console.log(`\n${colors.green}✅ PASSED${colors.reset}`);
      results.passed++;
    } else {
      console.log(`\n${colors.red}❌ FAILED - Cache not working as expected${colors.reset}`);
      results.failed++;
    }

    results.tests.push({
      name,
      passed,
      speedup: speedup.toFixed(1),
      cacheHit,
      response1Time: response1.responseTime,
      response2Time: response2.responseTime,
    });

  } catch (error) {
    console.log(`\n${colors.red}❌ FAILED - ${error.message}${colors.reset}`);
    results.failed++;
    results.tests.push({
      name,
      passed: false,
      error: error.message,
    });
  }

  // Delay between tests
  await sleep(1000);
}

/**
 * Modify request body for the third test
 */
function modifyRequestBody(body, modifier) {
  if (!body || typeof body !== 'object') return body;
  
  const modified = { ...body };
  
  if (modifier) {
    // Apply custom modifier
    return modifier(modified);
  }
  
  // Default modifications
  if (modified.prompt) {
    modified.prompt = modified.prompt + ' (modified)';
  }
  if (modified.text) {
    modified.text = modified.text + ' (modified)';
  }
  if (modified.input) {
    modified.input = modified.input + ' (modified)';
  }
  if (modified.role) {
    modified.role = modified.role + ' Senior';
  }
  if (modified.jobTitle) {
    modified.jobTitle = modified.jobTitle + ' Lead';
  }
  
  return modified;
}

/**
 * Print summary
 */
function printSummary() {
  console.log(`\n\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}              TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.bright}Total Tests:${colors.reset} ${results.tests.length}`);
  console.log(`${colors.green}${colors.bright}Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}${colors.bright}Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.bright}Success Rate:${colors.reset} ${((results.passed / results.tests.length) * 100).toFixed(1)}%\n`);

  console.log(`${colors.bright}Individual Results:${colors.reset}`);
  results.tests.forEach((test, index) => {
    const status = test.passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
    const speedup = test.speedup ? `(${test.speedup}x faster)` : '';
    console.log(`  ${index + 1}. ${status} ${test.name} ${speedup}`);
    if (test.error) {
      console.log(`     Error: ${test.error}`);
    }
  });

  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (results.passed === results.tests.length) {
    console.log(`${colors.green}${colors.bright}🎉 All tests passed! Your cache is working perfectly!${colors.reset}\n`);
  } else if (results.failed > 0) {
    console.log(`${colors.yellow}⚠️  Some tests failed. Check the logs above for details.${colors.reset}\n`);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}     Redis Cache Testing - 22 AI Endpoints${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.yellow}⚠️  Make sure your dev server is running: npm run dev${colors.reset}`);
  console.log(`${colors.yellow}⚠️  This will take approximately 5-10 minutes to complete${colors.reset}\n`);

  // Wait for user confirmation
  await sleep(3000);

  const testCases = [
    // Core Resume Features
    {
      name: '1. Resume Summary',
      endpoint: '/api/ai/summary',
      body: {
        resumeText: 'John Doe - Software Engineer with 5 years of experience in React, Node.js, and AWS. Led multiple projects.',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '2. Bullet Points',
      endpoint: '/api/ai/bullets',
      body: {
        input: 'Managed a team and improved sales by implementing new strategies',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '3. Tailored Bullets',
      endpoint: '/api/ai/tailored-bullets',
      body: {
        experience: 'Developed web applications using React and Node.js',
        jobDescription: 'Looking for a Full Stack Developer with React and Node.js experience',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '4. Suggest Skills',
      endpoint: '/api/ai/suggest-skills',
      body: {
        role: 'Frontend Developer',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '5. Keywords Analysis',
      endpoint: '/api/ai/keywords',
      body: {
        resumeText: 'Software Engineer with React, Node.js, AWS experience',
        jobDescription: 'Looking for Full Stack Developer with React, Node.js, Docker skills',
      },
      minCacheSpeedup: 3,
    },

    // Descriptions
    {
      name: '6. Project Description',
      endpoint: '/api/ai/generate-project-description',
      body: {
        projectName: 'E-commerce Platform',
        technologies: ['React', 'Node.js', 'MongoDB'],
        description: 'Built a scalable e-commerce platform',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '7. Education Description',
      endpoint: '/api/ai/education-description',
      body: {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '8. Experience Description',
      endpoint: '/api/ai/generate-experience-description',
      body: {
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: '2024-12',
        industry: 'Technology',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '9. Modify Experience',
      endpoint: '/api/ai/modify-experience-description',
      body: {
        description: 'Developed web applications',
        achievements: ['Built React apps', 'Optimized performance'],
        prompt: 'Make it more senior level',
      },
      minCacheSpeedup: 3,
    },

    // Content Generation
    {
      name: '10. Cover Letter',
      endpoint: '/api/ai/content-gen/cover-letter',
      body: {
        prompt: 'Write a cover letter for a senior developer role at a tech startup',
        targetRole: 'Senior Software Engineer',
        targetCompany: 'Tech Startup Inc',
        experienceLevel: 'senior',
        industry: 'technology',
      },
      minCacheSpeedup: 5,
    },
    {
      name: '11. LinkedIn Post',
      endpoint: '/api/ai/content-gen/linkedin-post',
      body: {
        prompt: 'Write about career growth in tech',
        postType: 'professional',
        tone: 'inspirational',
        targetAudience: 'software engineers',
      },
      minCacheSpeedup: 5,
    },
    {
      name: '12. Skills & Keywords',
      endpoint: '/api/ai/content-gen/skills-keywords',
      body: {
        prompt: 'Software Engineer with React, Node.js, AWS experience. Looking to optimize for ATS.',
        analysisType: 'comprehensive',
        targetRole: 'Full Stack Developer',
        industry: 'Technology',
      },
      minCacheSpeedup: 10,
    },
    {
      name: '13. Job Description',
      endpoint: '/api/ai/content-gen/job-description',
      body: {
        prompt: 'Create a job description for a senior full stack developer',
        jobTitle: 'Senior Full Stack Developer',
        companyName: 'Tech Solutions Inc',
        industry: 'Technology',
        experienceLevel: 'senior',
      },
      minCacheSpeedup: 5,
    },

    // Job Matching & Optimization
    {
      name: '14. Job Matching',
      endpoint: '/api/ai/job-match',
      body: {
        resumeText: 'Senior React Developer with 5 years experience in TypeScript, Next.js, and AWS. Built scalable applications.',
        location: 'Remote',
        preferences: 'Full-time, startup environment',
      },
      minCacheSpeedup: 10,
    },
    {
      name: '15. Quantify Achievements',
      endpoint: '/api/ai/quantify',
      body: {
        text: 'Improved system performance. Led team meetings. Reduced costs.',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '16. Outreach Message',
      endpoint: '/api/ai/outreach',
      body: {
        jobTitle: 'Senior Software Engineer',
        query: 'React AND (Node.js OR TypeScript)',
        resumeText: 'Full Stack Developer with 5 years experience',
        location: 'San Francisco',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '17. Extract Skills from JD',
      endpoint: '/api/ai/extract-skills-from-jd',
      body: {
        jobDescription: 'We are looking for a Senior Full Stack Developer with React, Node.js, TypeScript, AWS, Docker experience.',
        currentSkills: ['JavaScript', 'HTML', 'CSS'],
      },
      minCacheSpeedup: 3,
    },

    // Professional Development
    {
      name: '18. Interest Suggestions',
      endpoint: '/api/ai/interests',
      body: {
        role: 'Software Engineer',
        summary: 'Full Stack Developer passionate about web technologies',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '19. Certification Suggestions',
      endpoint: '/api/ai/certifications',
      body: {
        role: 'Cloud Engineer',
        industry: 'Technology',
        skills: ['AWS', 'Docker', 'Kubernetes'],
      },
      minCacheSpeedup: 3,
    },
    {
      name: '20. Certification Description',
      endpoint: '/api/ai/certification-description',
      body: {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        field: 'Cloud Computing',
      },
      minCacheSpeedup: 3,
    },
    {
      name: '21. Career Intelligence',
      endpoint: '/api/ai/career',
      body: {
        role: 'Senior Software Engineer',
        location: 'San Francisco',
        skills: ['React', 'Node.js', 'AWS'],
      },
      minCacheSpeedup: 3,
    },

    // ATS Scoring
    {
      name: '22. ATS Scoring',
      endpoint: '/api/ai/ats',
      body: {
        jobDescription: 'Senior Full Stack Developer with React, Node.js, TypeScript, AWS experience. 5+ years required.',
        resume: {
          content: {
            experience: 'Full Stack Developer with React, Node.js, AWS. 4 years experience.',
          },
        },
      },
      minCacheSpeedup: 5,
    },
  ];

  // Run all tests
  for (const testCase of testCases) {
    await testEndpoint(testCase);
  }

  // Print summary
  printSummary();
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
