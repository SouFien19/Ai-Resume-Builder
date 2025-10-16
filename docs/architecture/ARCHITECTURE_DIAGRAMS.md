# AI Resume Builder - System Architecture Documentation

## Professional Mermaid Diagrams for Graduation Report

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[Next.js Frontend]
        B --> C[React Components]
        C --> D[Framer Motion Animations]
    end
    
    subgraph "Presentation Layer"
        B --> E[Landing Page]
        B --> F[Dashboard]
        B --> G[Resume Editor]
        B --> H[AI Studio]
    end
    
    subgraph "API Layer"
        I[Next.js API Routes] --> J[Authentication]
        I --> K[Resume Management]
        I --> L[AI Services]
        I --> M[Analytics]
    end
    
    subgraph "Business Logic Layer"
        N[Resume Builder] --> O[Template Engine]
        N --> P[PDF Generator]
        Q[AI Engine] --> R[Gemini AI]
        Q --> S[ATS Optimizer]
        Q --> T[Content Generator]
    end
    
    subgraph "Data Layer"
        U[(MongoDB)] --> V[Users Collection]
        U --> W[Resumes Collection]
        U --> X[Templates Collection]
        Y[(Upstash Redis)] --> Z[Cache Layer]
        Y --> AA[Rate Limiting]
    end
    
    subgraph "External Services"
        AB[Clerk Auth] --> J
        AC[Google Gemini API] --> R
        AD[Vercel Edge] --> I
    end
    
    B --> I
    I --> N
    I --> Q
    N --> U
    Q --> U
    I --> Y
    J --> AB
    R --> AC
    B --> AD
    
    style A fill:#e1f5ff
    style U fill:#ffe1e1
    style Y fill:#fff4e1
    style AB fill:#e1ffe1
    style AC fill:#f0e1ff
```

---

## 2. High-Level System Architecture

```mermaid
C4Context
    title System Context Diagram - AI Resume Builder

    Person(user, "Job Seeker", "Creates and optimizes resumes")
    Person(recruiter, "Recruiter", "Views shared resumes")
    
    System(resumeBuilder, "AI Resume Builder", "AI-powered platform for creating professional resumes")
    
    System_Ext(clerk, "Clerk", "Authentication & User Management")
    System_Ext(gemini, "Google Gemini", "AI Content Generation")
    System_Ext(mongodb, "MongoDB Atlas", "Database Storage")
    System_Ext(redis, "Upstash Redis", "Caching & Rate Limiting")
    System_Ext(vercel, "Vercel", "Hosting & CDN")
    
    Rel(user, resumeBuilder, "Creates resumes, Uses AI tools")
    Rel(recruiter, resumeBuilder, "Views resumes")
    Rel(resumeBuilder, clerk, "Authenticates users")
    Rel(resumeBuilder, gemini, "Generates AI content")
    Rel(resumeBuilder, mongodb, "Stores data")
    Rel(resumeBuilder, redis, "Caches responses")
    Rel(resumeBuilder, vercel, "Deployed on")
```

---

## 3. Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        A[App Shell] --> B[Landing Page]
        A --> C[Dashboard]
        A --> D[Resume Editor]
        A --> E[AI Studio]
        
        B --> B1[Hero]
        B --> B2[Features]
        B --> B3[Pricing]
        B --> B4[Testimonials]
        B --> B5[FAQ]
        
        C --> C1[Resume List]
        C --> C2[Analytics Dashboard]
        C --> C3[Quick Actions]
        
        D --> D1[Personal Info]
        D --> D2[Work Experience]
        D --> D3[Education]
        D --> D4[Skills]
        D --> D5[Projects]
        D --> D6[Live Preview]
        
        E --> E1[ATS Optimizer]
        E --> E2[Content Generator]
        E --> E3[Job Matcher]
        E --> E4[Career Coach]
    end
    
    subgraph "Shared Components"
        F[UI Library] --> F1[Buttons]
        F --> F2[Forms]
        F --> F3[Dialogs]
        F --> F4[Cards]
        G[Layout] --> G1[Header]
        G --> G2[Sidebar]
        G --> G3[Footer]
    end
    
    subgraph "Utilities"
        H[API Client]
        I[State Management]
        J[Error Handling]
        K[Analytics Tracker]
    end
    
    A --> F
    A --> G
    D --> H
    E --> H
    C --> I
    A --> J
    A --> K
    
    style A fill:#4A90E2
    style F fill:#7ED321
    style G fill:#F5A623
    style H fill:#BD10E0
```

---

## 4. Data Model - Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ RESUME : creates
    USER ||--o{ JOB_MATCH : performs
    USER ||--o{ ANALYTICS_EVENT : generates
    RESUME ||--|| TEMPLATE : uses
    RESUME ||--o{ RESUME_VERSION : has
    RESUME }o--|| PERSONAL_INFO : contains
    RESUME }o--o{ WORK_EXPERIENCE : contains
    RESUME }o--o{ EDUCATION : contains
    RESUME }o--o{ SKILL : contains
    RESUME }o--o{ PROJECT : contains
    RESUME }o--o{ CERTIFICATION : contains
    RESUME }o--o{ LANGUAGE : contains
    
    USER {
        string id PK
        string clerkId UK
        string email
        string name
        string avatar
        datetime createdAt
        datetime updatedAt
        string subscription
    }
    
    RESUME {
        string id PK
        string userId FK
        string title
        string templateId FK
        json content
        datetime createdAt
        datetime updatedAt
        boolean isPublic
        string shareToken
    }
    
    TEMPLATE {
        string id PK
        string name
        string category
        string previewUrl
        json structure
        boolean isPremium
    }
    
    PERSONAL_INFO {
        string fullName
        string email
        string phone
        string location
        string title
        string summary
        string photoUrl
        string linkedin
        string github
        string website
    }
    
    WORK_EXPERIENCE {
        string id PK
        string company
        string position
        string startDate
        string endDate
        string description
        array achievements
    }
    
    EDUCATION {
        string id PK
        string institution
        string degree
        string field
        string graduationDate
        string gpa
    }
    
    SKILL {
        string category
        array items
        string level
    }
    
    PROJECT {
        string id PK
        string name
        string description
        array technologies
        string link
        string github
    }
    
    CERTIFICATION {
        string id PK
        string name
        string issuer
        string date
        string credential
    }
    
    LANGUAGE {
        string name
        string level
    }
    
    JOB_MATCH {
        string id PK
        string userId FK
        string resumeId FK
        string jobDescription
        number score
        array suggestions
        datetime createdAt
    }
    
    ANALYTICS_EVENT {
        string id PK
        string userId FK
        string eventType
        json metadata
        datetime timestamp
    }
    
    RESUME_VERSION {
        string id PK
        string resumeId FK
        json content
        datetime createdAt
        string description
    }
```

---

## 5. User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS
    participant Clerk
    participant MongoDB
    participant Dashboard
    
    User->>Browser: Navigate to /sign-in
    Browser->>NextJS: Request sign-in page
    NextJS->>Clerk: Load Clerk component
    Clerk-->>Browser: Display sign-in form
    
    User->>Clerk: Enter credentials
    Clerk->>Clerk: Validate credentials
    
    alt Authentication Success
        Clerk->>Clerk: Generate session token
        Clerk->>Browser: Set session cookie
        Clerk->>NextJS: Webhook: user.created/updated
        NextJS->>MongoDB: Sync user data
        MongoDB-->>NextJS: User synced
        Browser->>NextJS: Request /dashboard
        NextJS->>Clerk: Verify session
        Clerk-->>NextJS: Session valid
        NextJS->>MongoDB: Fetch user data
        MongoDB-->>NextJS: User data
        NextJS-->>Dashboard: Render dashboard
        Dashboard-->>Browser: Display dashboard
        Browser-->>User: Show dashboard
    else Authentication Failed
        Clerk-->>Browser: Show error message
        Browser-->>User: Display error
    end
```

---

## 6. Resume Creation Workflow

```mermaid
sequenceDiagram
    actor User
    participant Editor
    participant API
    participant AI Service
    participant MongoDB
    participant Redis
    
    User->>Editor: Click "Create New Resume"
    Editor->>API: GET /api/templates
    API->>Redis: Check cache
    
    alt Cache Hit
        Redis-->>API: Return cached templates
    else Cache Miss
        API->>MongoDB: Fetch templates
        MongoDB-->>API: Templates data
        API->>Redis: Store in cache
    end
    
    API-->>Editor: Return templates
    Editor-->>User: Show template selection
    
    User->>Editor: Select template & fill info
    Editor->>Editor: Live preview update
    
    User->>Editor: Click "AI Enhance"
    Editor->>API: POST /api/ai/summary
    API->>Redis: Check rate limit
    Redis-->>API: Rate limit OK
    API->>AI Service: Request Gemini AI
    AI Service-->>API: Enhanced content
    API-->>Editor: Return AI suggestions
    Editor-->>User: Display suggestions
    
    User->>Editor: Accept changes & save
    Editor->>API: POST /api/resumes
    API->>MongoDB: Save resume
    MongoDB-->>API: Resume saved
    API->>Redis: Invalidate cache
    API-->>Editor: Success response
    Editor-->>User: Show success message
```

---

## 7. AI Content Generation Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant RateLimit
    participant Cache
    participant Gemini
    participant DB
    
    User->>Frontend: Request AI content
    Frontend->>API: POST /api/ai/*
    
    API->>RateLimit: Check rate limit
    alt Rate Limit Exceeded
        RateLimit-->>API: 429 Error
        API-->>Frontend: Rate limit error
        Frontend-->>User: "Too many requests"
    else Rate Limit OK
        RateLimit-->>API: Proceed
        
        API->>Cache: Check cache
        alt Cache Hit
            Cache-->>API: Cached result
            API-->>Frontend: Return cached data
        else Cache Miss
            Cache-->>API: No cache
            
            API->>Gemini: Generate content
            
            alt Success
                Gemini-->>API: AI response
                API->>Cache: Store in cache (TTL: 1h)
                API->>DB: Log analytics event
                API-->>Frontend: Return AI content
                Frontend-->>User: Display content
            else API Error
                Gemini-->>API: Error
                API-->>Frontend: Error response
                Frontend-->>User: Show error
            end
        end
    end
```

---

## 8. ATS Optimization Process

```mermaid
flowchart TD
    A[Start ATS Analysis] --> B{Resume Uploaded?}
    B -->|No| C[Use Current Resume]
    B -->|Yes| D[Parse Resume PDF]
    
    C --> E[Extract Resume Text]
    D --> E
    
    E --> F{Job Description Provided?}
    F -->|Yes| G[Analyze Job Description]
    F -->|No| H[General ATS Analysis]
    
    G --> I[Extract Keywords]
    I --> J[Identify Required Skills]
    J --> K[Calculate Match Score]
    
    H --> L[Check Formatting]
    L --> M[Analyze Structure]
    M --> N[Review Keywords]
    
    K --> O[Generate Score 0-100]
    N --> O
    
    O --> P{Score >= 70?}
    P -->|Yes| Q[Mark as ATS-Friendly]
    P -->|No| R[Mark as Needs Improvement]
    
    Q --> S[Generate Suggestions]
    R --> T[Generate Improvements]
    
    S --> U[Return Analysis]
    T --> U
    
    U --> V{User Accepts?}
    V -->|Yes| W[Apply Optimizations]
    V -->|No| X[Show Alternative Suggestions]
    
    W --> Y[Update Resume]
    X --> Z[User Reviews]
    Z --> V
    
    Y --> AA[Save Optimized Version]
    AA --> AB[End]
    
    style A fill:#4CAF50
    style AB fill:#4CAF50
    style Q fill:#8BC34A
    style R fill:#FFC107
    style O fill:#2196F3
```

---

## 9. State Machine - Resume Editor

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading : User opens editor
    Loading --> Editing : Data loaded
    Loading --> Error : Load failed
    
    Editing --> AutoSaving : Content changed
    AutoSaving --> Editing : Save success
    AutoSaving --> Error : Save failed
    
    Editing --> AIProcessing : User requests AI
    AIProcessing --> Editing : AI response received
    AIProcessing --> Error : AI request failed
    
    Editing --> Previewing : User clicks preview
    Previewing --> Editing : Close preview
    
    Editing --> Exporting : User exports resume
    Exporting --> Success : Export complete
    Exporting --> Error : Export failed
    
    Error --> Editing : User retries
    Error --> Idle : User cancels
    
    Success --> Editing : Continue editing
    Success --> [*] : Close editor
    
    Editing --> [*] : User closes
    
    note right of AutoSaving
        Debounced save
        every 2 seconds
    end note
    
    note right of AIProcessing
        Rate limited
        Max 10/minute
    end note
    
    note right of Exporting
        Supports PDF, DOCX
        ATS-optimized format
    end note
```

---

## 10. Class Diagram - Core Domain Models

```mermaid
classDiagram
    class User {
        +String id
        +String clerkId
        +String email
        +String name
        +String avatar
        +Date createdAt
        +Date updatedAt
        +String subscription
        +getResumes()
        +getAnalytics()
        +updateProfile()
    }
    
    class Resume {
        +String id
        +String userId
        +String title
        +String templateId
        +ResumeContent content
        +Date createdAt
        +Date updatedAt
        +Boolean isPublic
        +String shareToken
        +save()
        +duplicate()
        +export(format)
        +share()
        +analyzeATS()
    }
    
    class ResumeContent {
        +PersonalInfo personalInfo
        +WorkExperience[] workExperience
        +Education[] education
        +Skill[] skills
        +Project[] projects
        +Certification[] certifications
        +Language[] languages
        +String[] interests
        +validate()
        +toJSON()
    }
    
    class PersonalInfo {
        +String fullName
        +String email
        +String phone
        +String location
        +String title
        +String summary
        +String photoUrl
        +SocialProfile[] profiles
    }
    
    class WorkExperience {
        +String id
        +String company
        +String position
        +String startDate
        +String endDate
        +String description
        +String[] achievements
        +generateDescription()
        +optimizeForATS()
    }
    
    class Education {
        +String id
        +String institution
        +String degree
        +String field
        +String graduationDate
        +String gpa
        +String description
    }
    
    class Skill {
        +String category
        +String[] items
        +String level
        +addSkill(skill)
        +removeSkill(skill)
    }
    
    class Project {
        +String id
        +String name
        +String description
        +String[] technologies
        +String link
        +String github
        +Date date
    }
    
    class Template {
        +String id
        +String name
        +String category
        +String previewUrl
        +JSON structure
        +Boolean isPremium
        +render(content)
        +validate(content)
    }
    
    class AIService {
        <<service>>
        +generateSummary(data)
        +enhanceDescription(text)
        +optimizeATS(resume, jobDesc)
        +extractKeywords(jobDesc)
        +generateCoverLetter(resume, job)
        +suggestSkills(experience)
    }
    
    class PDFGenerator {
        <<service>>
        +generatePDF(resume, template)
        +exportDOCX(resume)
        +optimizeForATS(pdf)
    }
    
    class AnalyticsService {
        <<service>>
        +trackEvent(userId, event)
        +getResumeStats(resumeId)
        +getUserMetrics(userId)
        +logAIUsage(userId, type)
    }
    
    class CacheService {
        <<service>>
        +get(key)
        +set(key, value, ttl)
        +invalidate(pattern)
        +checkRateLimit(userId)
    }
    
    User "1" --> "0..*" Resume : owns
    Resume "1" --> "1" ResumeContent : contains
    Resume "1" --> "1" Template : uses
    ResumeContent "1" --> "1" PersonalInfo : has
    ResumeContent "1" --> "0..*" WorkExperience : has
    ResumeContent "1" --> "0..*" Education : has
    ResumeContent "1" --> "0..*" Skill : has
    ResumeContent "1" --> "0..*" Project : has
    Resume ..> AIService : uses
    Resume ..> PDFGenerator : uses
    Resume ..> AnalyticsService : tracked by
    AIService ..> CacheService : uses
```

---

## 11. API Layer Architecture

```mermaid
graph TB
    subgraph "Client Requests"
        A[Browser/Mobile] --> B[Next.js API Routes]
    end
    
    subgraph "Middleware Layer"
        B --> C[Authentication]
        B --> D[Rate Limiting]
        B --> E[Error Handling]
        B --> F[Request Validation]
    end
    
    subgraph "API Endpoints"
        G[/api/resumes] --> G1[GET List]
        G --> G2[POST Create]
        G --> G3[PUT Update]
        G --> G4[DELETE Remove]
        
        H[/api/ai] --> H1[Summary Generation]
        H --> H2[Description Enhancement]
        H --> H3[Skill Suggestions]
        H --> H4[Bullet Points]
        
        I[/api/ats] --> I1[Analyze Resume]
        I --> I2[Job Matcher]
        I --> I3[Optimize Content]
        
        J[/api/analytics] --> J1[Track Event]
        J --> J2[Get Stats]
        J --> J3[User Metrics]
        
        K[/api/templates] --> K1[List Templates]
        K --> K2[Get Template]
    end
    
    subgraph "Business Logic"
        L[Resume Service]
        M[AI Service]
        N[ATS Service]
        O[Analytics Service]
        P[Template Service]
    end
    
    subgraph "Data Access"
        Q[(MongoDB)]
        R[(Redis Cache)]
    end
    
    subgraph "External APIs"
        S[Google Gemini]
        T[Clerk Auth]
    end
    
    C --> T
    D --> R
    
    G1 --> L
    G2 --> L
    G3 --> L
    G4 --> L
    
    H1 --> M
    H2 --> M
    H3 --> M
    H4 --> M
    
    I1 --> N
    I2 --> N
    I3 --> N
    
    J1 --> O
    J2 --> O
    J3 --> O
    
    K1 --> P
    K2 --> P
    
    L --> Q
    M --> S
    M --> R
    N --> S
    O --> Q
    P --> Q
    P --> R
    
    style B fill:#4A90E2
    style Q fill:#E74C3C
    style R fill:#F39C12
    style S fill:#9B59B6
    style T fill:#1ABC9C
```

---

## 12. Deployment Architecture

```mermaid
graph TB
    subgraph "Users"
        A[Desktop Browser]
        B[Mobile Browser]
        C[Tablet Browser]
    end
    
    subgraph "CDN Layer - Vercel Edge"
        D[Edge Network]
        E[Static Assets]
        F[Image Optimization]
    end
    
    subgraph "Application Layer - Vercel"
        G[Next.js App]
        H[API Routes]
        I[Serverless Functions]
        J[Middleware]
    end
    
    subgraph "Authentication"
        K[Clerk Service]
    end
    
    subgraph "Database Layer"
        L[(MongoDB Atlas)]
        M[Primary Cluster]
        N[Read Replicas]
    end
    
    subgraph "Cache Layer"
        O[(Upstash Redis)]
        P[Rate Limiting]
        Q[Session Storage]
        R[API Cache]
    end
    
    subgraph "AI Services"
        S[Google Gemini API]
        T[Content Generation]
        U[ATS Analysis]
    end
    
    subgraph "Monitoring"
        V[Vercel Analytics]
        W[Error Tracking]
        X[Performance Monitoring]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    D --> F
    D --> G
    
    G --> H
    H --> I
    H --> J
    
    J --> K
    
    I --> L
    L --> M
    M --> N
    
    I --> O
    O --> P
    O --> Q
    O --> R
    
    I --> S
    S --> T
    S --> U
    
    G --> V
    G --> W
    G --> X
    
    style D fill:#00D9FF
    style G fill:#000000,color:#ffffff
    style K fill:#6C47FF
    style L fill:#00ED64
    style O fill:#00E9A3
    style S fill:#4285F4
```

---

## 13. Resume Export Process

```mermaid
flowchart TD
    A[User Clicks Export] --> B{Select Format}
    
    B -->|PDF| C[Prepare PDF Export]
    B -->|DOCX| D[Prepare DOCX Export]
    B -->|JSON| E[Prepare JSON Export]
    
    C --> F[Load Template]
    F --> G[Apply Resume Content]
    G --> H[Render React PDF]
    H --> I[Generate PDF Blob]
    I --> J{ATS Optimization?}
    
    J -->|Yes| K[Remove Images]
    J -->|No| L[Keep Formatting]
    
    K --> M[Flatten Layers]
    L --> M
    
    M --> N[Add Metadata]
    N --> O[Compress PDF]
    O --> P[Trigger Download]
    
    D --> Q[Convert to DOCX Structure]
    Q --> R[Apply Styles]
    R --> S[Generate DOCX Blob]
    S --> P
    
    E --> T[Serialize Resume Data]
    T --> U[Add Schema Version]
    U --> V[Generate JSON]
    V --> P
    
    P --> W[Track Export Event]
    W --> X[Update Analytics]
    X --> Y{Save to History?}
    
    Y -->|Yes| Z[Store in Database]
    Y -->|No| AA[End]
    
    Z --> AA
    
    style A fill:#4CAF50
    style P fill:#2196F3
    style AA fill:#4CAF50
    style J fill:#FF9800
```

---

## 14. Caching Strategy

```mermaid
flowchart LR
    A[API Request] --> B{Check Redis Cache}
    
    B -->|Cache Hit| C[Return Cached Data]
    B -->|Cache Miss| D[Query Database]
    
    D --> E[Process Data]
    E --> F[Store in Redis]
    F --> G[Set TTL]
    G --> H[Return Data]
    
    C --> I[Update Access Count]
    H --> I
    
    I --> J[End]
    
    subgraph "Cache Keys"
        K[user:123:resumes]
        L[template:classic:data]
        M[ai:summary:hash123]
    end
    
    subgraph "TTL Settings"
        N[User Data: 5 min]
        O[Templates: 1 hour]
        P[AI Results: 1 hour]
        Q[Analytics: 15 min]
    end
    
    subgraph "Invalidation"
        R[On Resume Update]
        S[On Template Change]
        T[Manual Clear]
    end
    
    style B fill:#FFC107
    style C fill:#4CAF50
    style D fill:#2196F3
    style F fill:#FF9800
```

---

## 15. Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        A[HTTPS Only]
        B[CSP Headers]
        C[XSS Protection]
        D[CSRF Tokens]
    end
    
    subgraph "Authentication Layer"
        E[Clerk Authentication]
        F[JWT Tokens]
        G[Session Management]
        H[2FA Support]
    end
    
    subgraph "API Security"
        I[Rate Limiting]
        J[Input Validation]
        K[SQL Injection Prevention]
        L[API Key Management]
    end
    
    subgraph "Data Security"
        M[Encryption at Rest]
        N[Encryption in Transit]
        O[Data Sanitization]
        P[Secure File Upload]
    end
    
    subgraph "Infrastructure Security"
        Q[Vercel Edge Protection]
        R[DDoS Mitigation]
        S[Environment Variables]
        T[Secret Management]
    end
    
    subgraph "Compliance"
        U[GDPR Compliance]
        V[Cookie Consent]
        W[Data Retention Policy]
        X[Privacy Policy]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> U
    R --> U
    S --> U
    T --> U
    
    style E fill:#6C47FF
    style I fill:#FF6B6B
    style M fill:#4ECDC4
    style Q fill:#00D9FF
    style U fill:#95E1D3
```

---

## 16. Analytics & Monitoring Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Analytics
    participant Database
    participant Monitoring
    participant Alerts
    
    User->>App: Perform Action
    App->>App: Execute Business Logic
    
    par Track Event
        App->>Analytics: Log User Event
        Analytics->>Database: Store Event Data
    and Monitor Performance
        App->>Monitoring: Send Metrics
        Monitoring->>Monitoring: Analyze Performance
    end
    
    alt Performance Issue Detected
        Monitoring->>Alerts: Trigger Alert
        Alerts->>Alerts: Notify Team
    end
    
    alt Error Occurs
        App->>Monitoring: Log Error
        Monitoring->>Database: Store Error Log
        Monitoring->>Alerts: Send Error Alert
    end
    
    App-->>User: Return Response
    
    Note over Analytics,Database: Daily aggregation<br/>runs at midnight
    
    Analytics->>Database: Aggregate Daily Stats
    Database-->>Analytics: Stats Calculated
```

---

## 17. Mobile Responsive Design System

```mermaid
graph TB
    subgraph "Responsive Breakpoints"
        A[Mobile: < 768px]
        B[Tablet: 768-1024px]
        C[Desktop: > 1024px]
    end
    
    subgraph "Layout Strategy"
        D[Fluid Grids]
        E[Flexible Images]
        F[Media Queries]
        G[Touch Optimization]
    end
    
    subgraph "Component Adaptation"
        H[Stack on Mobile]
        I[Side-by-side on Tablet]
        J[Multi-column on Desktop]
    end
    
    subgraph "Performance"
        K[Lazy Loading]
        L[Image Optimization]
        M[Code Splitting]
        N[Progressive Enhancement]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> H
    E --> H
    F --> I
    G --> J
    
    H --> K
    I --> L
    J --> M
    
    K --> N
    L --> N
    M --> N
    
    style A fill:#FF6B6B
    style B fill:#4ECDC4
    style C fill:#45B7D1
```

---

## 18. Feature Module Structure

```mermaid
graph TB
    subgraph "Core Features"
        A[Resume Builder] --> A1[Template Selection]
        A --> A2[Content Editor]
        A --> A3[Live Preview]
        A --> A4[PDF Export]
        
        B[AI Studio] --> B1[ATS Optimizer]
        B --> B2[Content Generator]
        B --> B3[Job Matcher]
        B --> B4[Career Coach]
        
        C[Dashboard] --> C1[Resume Management]
        C --> C2[Analytics View]
        C --> C3[Profile Settings]
        C --> C4[Billing]
    end
    
    subgraph "Supporting Features"
        D[Authentication]
        E[User Management]
        F[Template Library]
        G[File Storage]
    end
    
    subgraph "Cross-Cutting Concerns"
        H[Error Handling]
        I[Logging]
        J[Caching]
        K[Rate Limiting]
    end
    
    A --> D
    B --> D
    C --> D
    
    A --> F
    A --> G
    B --> J
    B --> K
    
    A --> H
    B --> H
    C --> H
    
    A --> I
    B --> I
    C --> I
    
    style A fill:#4A90E2
    style B fill:#7ED321
    style C fill:#F5A623
    style H fill:#E74C3C
```

This comprehensive set of Mermaid diagrams provides a professional, detailed view of your AI Resume Builder architecture suitable for a graduation report book. Each diagram focuses on different aspects of the system, from high-level architecture to specific workflows and technical details.
