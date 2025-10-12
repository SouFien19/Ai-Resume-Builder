/**
 * Skill Suggestions Mapping
 * Maps skills to related skills for intelligent autocomplete suggestions
 */

export type SkillCategory = 
  | "frontend"
  | "backend"
  | "mobile"
  | "cloud"
  | "devops"
  | "data"
  | "design"
  | "soft-skills"
  | "other"

export interface SkillRelationship {
  category: SkillCategory
  related: string[]
}

export const skillRelationships: Record<string, SkillRelationship> = {
  // Frontend Development
  "React": {
    category: "frontend",
    related: ["Next.js", "Redux", "TypeScript", "Tailwind CSS", "React Router", "React Query", "Zustand", "Material-UI", "Styled Components", "Jest"]
  },
  "Vue.js": {
    category: "frontend",
    related: ["Nuxt.js", "Vuex", "Pinia", "Vue Router", "Quasar", "TypeScript", "Vite", "Vitest"]
  },
  "Angular": {
    category: "frontend",
    related: ["TypeScript", "RxJS", "NgRx", "Angular Material", "Jasmine", "Karma", "Protractor"]
  },
  "Next.js": {
    category: "frontend",
    related: ["React", "TypeScript", "Tailwind CSS", "Vercel", "Server Components", "API Routes", "SSR", "Static Generation"]
  },
  "TypeScript": {
    category: "frontend",
    related: ["JavaScript", "React", "Node.js", "Express", "Next.js", "Angular", "Type Guards", "Generics"]
  },
  "JavaScript": {
    category: "frontend",
    related: ["TypeScript", "React", "Node.js", "Express", "Vue.js", "jQuery", "ES6+", "Webpack", "Babel"]
  },
  "HTML": {
    category: "frontend",
    related: ["CSS", "JavaScript", "Responsive Design", "Accessibility", "SEO", "Semantic HTML"]
  },
  "CSS": {
    category: "frontend",
    related: ["HTML", "Sass", "Less", "Tailwind CSS", "Bootstrap", "Flexbox", "Grid", "Animations", "Responsive Design"]
  },
  "Tailwind CSS": {
    category: "frontend",
    related: ["React", "Next.js", "Vue.js", "PostCSS", "CSS", "Responsive Design", "UI/UX Design"]
  },

  // Backend Development
  "Node.js": {
    category: "backend",
    related: ["Express", "NestJS", "MongoDB", "PostgreSQL", "REST APIs", "GraphQL", "TypeScript", "JavaScript", "Socket.io", "Microservices"]
  },
  "Python": {
    category: "backend",
    related: ["Django", "Flask", "FastAPI", "Pandas", "NumPy", "PostgreSQL", "SQLAlchemy", "REST APIs", "Celery", "PyTest"]
  },
  "Django": {
    category: "backend",
    related: ["Python", "PostgreSQL", "REST APIs", "Django REST Framework", "Celery", "Redis", "Docker"]
  },
  "Flask": {
    category: "backend",
    related: ["Python", "SQLAlchemy", "REST APIs", "PostgreSQL", "Jinja2", "Docker"]
  },
  "FastAPI": {
    category: "backend",
    related: ["Python", "Pydantic", "REST APIs", "PostgreSQL", "Async/Await", "Docker", "OpenAPI"]
  },
  "Express": {
    category: "backend",
    related: ["Node.js", "MongoDB", "PostgreSQL", "REST APIs", "JWT", "Passport.js", "TypeScript"]
  },
  "NestJS": {
    category: "backend",
    related: ["Node.js", "TypeScript", "Express", "GraphQL", "PostgreSQL", "TypeORM", "Microservices"]
  },
  "Java": {
    category: "backend",
    related: ["Spring Boot", "Spring Framework", "Hibernate", "Maven", "JUnit", "PostgreSQL", "REST APIs", "Microservices"]
  },
  "Spring Boot": {
    category: "backend",
    related: ["Java", "Spring Framework", "Hibernate", "PostgreSQL", "REST APIs", "Maven", "Microservices"]
  },
  "PHP": {
    category: "backend",
    related: ["Laravel", "Symfony", "MySQL", "Composer", "REST APIs", "WordPress"]
  },
  "Ruby": {
    category: "backend",
    related: ["Ruby on Rails", "PostgreSQL", "RSpec", "Sidekiq", "REST APIs"]
  },
  "Go": {
    category: "backend",
    related: ["Gin", "Gorilla Mux", "PostgreSQL", "Docker", "Microservices", "gRPC", "REST APIs"]
  },

  // Mobile Development
  "React Native": {
    category: "mobile",
    related: ["React", "JavaScript", "TypeScript", "Expo", "Redux", "React Navigation", "iOS", "Android"]
  },
  "Flutter": {
    category: "mobile",
    related: ["Dart", "Firebase", "iOS", "Android", "Material Design", "Provider", "Bloc"]
  },
  "Swift": {
    category: "mobile",
    related: ["iOS", "Xcode", "UIKit", "SwiftUI", "Core Data", "Cocoa Touch"]
  },
  "Kotlin": {
    category: "mobile",
    related: ["Android", "Java", "Jetpack Compose", "Room", "Retrofit", "Coroutines"]
  },
  "iOS": {
    category: "mobile",
    related: ["Swift", "Objective-C", "Xcode", "UIKit", "SwiftUI", "Core Data"]
  },
  "Android": {
    category: "mobile",
    related: ["Kotlin", "Java", "Jetpack Compose", "Room", "Android Studio", "Material Design"]
  },

  // Cloud & Infrastructure
  "AWS": {
    category: "cloud",
    related: ["EC2", "S3", "Lambda", "RDS", "CloudFormation", "IAM", "DynamoDB", "CloudWatch", "Terraform", "Docker"]
  },
  "Azure": {
    category: "cloud",
    related: ["Azure Functions", "Azure DevOps", "Cosmos DB", "ARM Templates", "Docker", "Kubernetes"]
  },
  "Google Cloud": {
    category: "cloud",
    related: ["GCP", "BigQuery", "Cloud Functions", "Kubernetes Engine", "Cloud Storage", "Terraform"]
  },
  "Docker": {
    category: "devops",
    related: ["Kubernetes", "Docker Compose", "CI/CD", "AWS", "Azure", "Linux", "DevOps", "Microservices"]
  },
  "Kubernetes": {
    category: "devops",
    related: ["Docker", "Helm", "AWS EKS", "GKE", "Azure AKS", "DevOps", "Microservices", "CI/CD"]
  },
  "Terraform": {
    category: "devops",
    related: ["AWS", "Azure", "Google Cloud", "Infrastructure as Code", "DevOps", "CI/CD"]
  },

  // DevOps & CI/CD
  "Jenkins": {
    category: "devops",
    related: ["CI/CD", "Docker", "Kubernetes", "Git", "DevOps", "Automation"]
  },
  "GitHub Actions": {
    category: "devops",
    related: ["CI/CD", "Git", "Docker", "DevOps", "Automation", "YAML"]
  },
  "GitLab CI": {
    category: "devops",
    related: ["CI/CD", "Git", "Docker", "DevOps", "Kubernetes", "YAML"]
  },
  "Git": {
    category: "devops",
    related: ["GitHub", "GitLab", "Bitbucket", "Version Control", "CI/CD", "Pull Requests"]
  },

  // Databases
  "PostgreSQL": {
    category: "backend",
    related: ["SQL", "Database Design", "Sequelize", "TypeORM", "Prisma", "Docker"]
  },
  "MongoDB": {
    category: "backend",
    related: ["NoSQL", "Mongoose", "Node.js", "Express", "Database Design"]
  },
  "MySQL": {
    category: "backend",
    related: ["SQL", "Database Design", "PHP", "Laravel", "Sequelize"]
  },
  "Redis": {
    category: "backend",
    related: ["Caching", "Session Management", "Node.js", "Docker", "Queue Management"]
  },
  "GraphQL": {
    category: "backend",
    related: ["Apollo", "REST APIs", "Node.js", "TypeScript", "React", "API Design"]
  },

  // Data Science & ML
  "Pandas": {
    category: "data",
    related: ["Python", "NumPy", "Matplotlib", "Data Analysis", "Jupyter", "Scikit-learn"]
  },
  "NumPy": {
    category: "data",
    related: ["Python", "Pandas", "SciPy", "Machine Learning", "Data Analysis"]
  },
  "TensorFlow": {
    category: "data",
    related: ["Python", "Machine Learning", "Deep Learning", "Keras", "PyTorch", "Neural Networks"]
  },
  "PyTorch": {
    category: "data",
    related: ["Python", "Machine Learning", "Deep Learning", "Neural Networks", "TensorFlow"]
  },
  "Machine Learning": {
    category: "data",
    related: ["Python", "Scikit-learn", "TensorFlow", "PyTorch", "Data Analysis", "Statistics"]
  },

  // Design & UX
  "Figma": {
    category: "design",
    related: ["UI/UX Design", "Prototyping", "Wireframing", "Design Systems", "Adobe XD", "Sketch"]
  },
  "Adobe XD": {
    category: "design",
    related: ["UI/UX Design", "Prototyping", "Figma", "Wireframing", "Design Systems"]
  },
  "UI/UX Design": {
    category: "design",
    related: ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Usability Testing", "Design Systems"]
  },
  "Prototyping": {
    category: "design",
    related: ["Figma", "UI/UX Design", "Wireframing", "User Research", "Adobe XD"]
  },

  // Soft Skills
  "Agile": {
    category: "soft-skills",
    related: ["Scrum", "Kanban", "Project Management", "Team Collaboration", "Sprint Planning"]
  },
  "Scrum": {
    category: "soft-skills",
    related: ["Agile", "Sprint Planning", "Stand-ups", "Retrospectives", "Project Management"]
  },
  "Leadership": {
    category: "soft-skills",
    related: ["Team Management", "Communication", "Mentoring", "Project Management", "Agile"]
  },
  "Communication": {
    category: "soft-skills",
    related: ["Team Collaboration", "Presentation Skills", "Documentation", "Leadership"]
  }
}

/**
 * Get skill suggestions based on a list of existing skills
 * @param existingSkills - Array of skills the user already has
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggested skills
 */
export function getSuggestedSkills(
  existingSkills: string[],
  maxSuggestions: number = 10
): string[] {
  const suggestions = new Set<string>()
  const existingSkillsLower = existingSkills.map(s => s.toLowerCase())

  // For each existing skill, add related skills
  for (const skill of existingSkills) {
    const skillData = skillRelationships[skill]
    if (skillData) {
      skillData.related.forEach(relatedSkill => {
        // Don't suggest skills the user already has
        if (!existingSkillsLower.includes(relatedSkill.toLowerCase())) {
          suggestions.add(relatedSkill)
        }
      })
    }
  }

  // Convert Set to Array and limit to maxSuggestions
  return Array.from(suggestions).slice(0, maxSuggestions)
}

/**
 * Get all available skills for autocomplete
 * @returns Array of all skill names
 */
export function getAllSkills(): string[] {
  const allSkills = new Set<string>(Object.keys(skillRelationships))
  
  // Add all related skills as well
  Object.values(skillRelationships).forEach(data => {
    data.related.forEach(skill => allSkills.add(skill))
  })

  return Array.from(allSkills).sort()
}

/**
 * Search for skills matching a query
 * @param query - Search query
 * @param maxResults - Maximum number of results
 * @returns Array of matching skills
 */
export function searchSkills(query: string, maxResults: number = 10): string[] {
  if (!query) return []
  
  const queryLower = query.toLowerCase()
  const allSkills = getAllSkills()
  
  return allSkills
    .filter(skill => skill.toLowerCase().includes(queryLower))
    .slice(0, maxResults)
}
