/**
 * Action Verbs Library for Resume Writing
 * Categorized power words to help create impactful achievement statements
 */

export interface ActionVerbCategory {
  name: string;
  description: string;
  verbs: string[];
  color: string;
}

export const actionVerbCategories: ActionVerbCategory[] = [
  {
    name: "Leadership",
    description: "Leading teams, managing people, and directing initiatives",
    color: "cyan",
    verbs: [
      "Led", "Managed", "Directed", "Coordinated", "Supervised",
      "Oversaw", "Mentored", "Coached", "Guided", "Chaired",
      "Spearheaded", "Orchestrated", "Championed", "Facilitated", "Delegated"
    ]
  },
  {
    name: "Achievement",
    description: "Accomplishing goals and exceeding expectations",
    color: "green",
    verbs: [
      "Achieved", "Exceeded", "Delivered", "Accomplished", "Attained",
      "Surpassed", "Completed", "Fulfilled", "Secured", "Won",
      "Earned", "Reached", "Realized", "Obtained", "Succeeded"
    ]
  },
  {
    name: "Technical",
    description: "Building, developing, and creating solutions",
    color: "blue",
    verbs: [
      "Developed", "Built", "Designed", "Engineered", "Implemented",
      "Created", "Programmed", "Architected", "Coded", "Integrated",
      "Deployed", "Configured", "Automated", "Optimized", "Refactored"
    ]
  },
  {
    name: "Impact",
    description: "Making measurable improvements and changes",
    color: "purple",
    verbs: [
      "Increased", "Reduced", "Improved", "Enhanced", "Optimized",
      "Streamlined", "Accelerated", "Strengthened", "Boosted", "Elevated",
      "Maximized", "Minimized", "Transformed", "Revolutionized", "Modernized"
    ]
  },
  {
    name: "Analytical",
    description: "Researching, analyzing, and solving problems",
    color: "indigo",
    verbs: [
      "Analyzed", "Evaluated", "Assessed", "Researched", "Investigated",
      "Examined", "Studied", "Reviewed", "Diagnosed", "Identified",
      "Measured", "Calculated", "Forecasted", "Interpreted", "Solved"
    ]
  },
  {
    name: "Communication",
    description: "Presenting, writing, and collaborating",
    color: "pink",
    verbs: [
      "Presented", "Communicated", "Collaborated", "Negotiated", "Consulted",
      "Documented", "Reported", "Articulated", "Conveyed", "Persuaded",
      "Advocated", "Influenced", "Engaged", "Liaised", "Partnered"
    ]
  },
  {
    name: "Innovation",
    description: "Creating new solutions and pioneering change",
    color: "amber",
    verbs: [
      "Innovated", "Pioneered", "Launched", "Initiated", "Introduced",
      "Established", "Founded", "Originated", "Devised", "Conceived",
      "Invented", "Proposed", "Reimagined", "Disrupted", "Transformed"
    ]
  },
  {
    name: "Strategy",
    description: "Planning, strategizing, and driving vision",
    color: "teal",
    verbs: [
      "Strategized", "Planned", "Formulated", "Defined", "Envisioned",
      "Conceptualized", "Shaped", "Structured", "Outlined", "Designed",
      "Mapped", "Aligned", "Prioritized", "Positioned", "Drove"
    ]
  }
];

/**
 * Get all action verbs as a flat array
 */
export function getAllActionVerbs(): string[] {
  return actionVerbCategories.flatMap(cat => cat.verbs);
}

/**
 * Search for action verbs matching a query
 */
export function searchActionVerbs(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  return getAllActionVerbs().filter(verb => 
    verb.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get random action verb from a category
 */
export function getRandomVerbFromCategory(categoryName: string): string {
  const category = actionVerbCategories.find(c => c.name === categoryName);
  if (!category || category.verbs.length === 0) return "";
  return category.verbs[Math.floor(Math.random() * category.verbs.length)];
}

/**
 * Get suggested action verbs based on role
 */
export function getSuggestedVerbsForRole(role: string): ActionVerbCategory[] {
  const roleLower = role.toLowerCase();
  
  // Technical roles: prioritize Technical, Analytical, Innovation
  if (roleLower.includes("engineer") || roleLower.includes("developer") || roleLower.includes("architect")) {
    return [
      actionVerbCategories.find(c => c.name === "Technical")!,
      actionVerbCategories.find(c => c.name === "Impact")!,
      actionVerbCategories.find(c => c.name === "Analytical")!,
      actionVerbCategories.find(c => c.name === "Innovation")!,
    ];
  }
  
  // Management roles: prioritize Leadership, Strategy, Communication
  if (roleLower.includes("manager") || roleLower.includes("director") || roleLower.includes("lead")) {
    return [
      actionVerbCategories.find(c => c.name === "Leadership")!,
      actionVerbCategories.find(c => c.name === "Strategy")!,
      actionVerbCategories.find(c => c.name === "Achievement")!,
      actionVerbCategories.find(c => c.name === "Communication")!,
    ];
  }
  
  // Product roles: prioritize Strategy, Innovation, Communication
  if (roleLower.includes("product")) {
    return [
      actionVerbCategories.find(c => c.name === "Strategy")!,
      actionVerbCategories.find(c => c.name === "Innovation")!,
      actionVerbCategories.find(c => c.name === "Communication")!,
      actionVerbCategories.find(c => c.name === "Analytical")!,
    ];
  }
  
  // Design roles: prioritize Innovation, Impact, Technical
  if (roleLower.includes("design")) {
    return [
      actionVerbCategories.find(c => c.name === "Innovation")!,
      actionVerbCategories.find(c => c.name === "Impact")!,
      actionVerbCategories.find(c => c.name === "Technical")!,
      actionVerbCategories.find(c => c.name === "Communication")!,
    ];
  }
  
  // Sales/Marketing roles: prioritize Achievement, Communication, Impact
  if (roleLower.includes("sales") || roleLower.includes("marketing")) {
    return [
      actionVerbCategories.find(c => c.name === "Achievement")!,
      actionVerbCategories.find(c => c.name === "Communication")!,
      actionVerbCategories.find(c => c.name === "Impact")!,
      actionVerbCategories.find(c => c.name === "Strategy")!,
    ];
  }
  
  // Default: return balanced mix
  return [
    actionVerbCategories.find(c => c.name === "Achievement")!,
    actionVerbCategories.find(c => c.name === "Impact")!,
    actionVerbCategories.find(c => c.name === "Communication")!,
    actionVerbCategories.find(c => c.name === "Leadership")!,
  ];
}
