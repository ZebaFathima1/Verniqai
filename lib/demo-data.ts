export const demoProfile = {
  name: "Rahul Sharma",
  targetRole: "AI / ML Engineer",
  readiness: 76,
  readinessChange: 8,
  headline: "Good morning, Rahul.",
  subheadline: "Here's where your career stands today.",
};

export const careerSkills = [
  { name: "Python", score: 82, level: "Advanced", trend: "+6", gap: "None" },
  { name: "AI/ML", score: 74, level: "Advanced", trend: "+9", gap: "Model deployment" },
  { name: "DSA", score: 61, level: "Intermediate", trend: "+4", gap: "Graphs & DP" },
  { name: "Projects", score: 78, level: "Strong", trend: "+7", gap: "Testing" },
  { name: "Cloud", score: 43, level: "Beginner", trend: "+6", gap: "AWS deployment" },
  { name: "Interview", score: 68, level: "Intermediate", trend: "+5", gap: "Structuring answers" },
  { name: "Communication", score: 76, level: "Strong", trend: "+8", gap: "Technical storytelling" },
];

export const careerDNA = [
  { category: "Technical", score: 82 },
  { category: "Soft Skills", score: 76 },
  { category: "Projects", score: 78 },
  { category: "Problem Solving", score: 61 },
  { category: "Communication", score: 76 },
  { category: "Resume", score: 78 },
  { category: "Interview", score: 68 },
  { category: "Industry", score: 74 },
];

export const nextAction = {
  title: "Complete Docker fundamentals",
  description:
    "Docker is one of the largest gaps between your current profile and your target role.",
  reason: "This is currently your highest-impact skill gap.",
  duration: "45 min",
};

export const roadmapItems = [
  { label: "Python", status: "done", score: 82, time: "Completed", project: "FastAPI service" },
  { label: "NumPy", status: "done", score: 85, time: "Completed", project: "Data pipeline" },
  { label: "Pandas", status: "done", score: 81, time: "Completed", project: "EDA dashboard" },
  { label: "Machine Learning", status: "active", score: 74, time: "2 weeks", project: "Model tuning" },
  { label: "Deep Learning", status: "next", score: 52, time: "2 weeks", project: "CNN project" },
  { label: "MLOps", status: "next", score: 46, time: "3 weeks", project: "CI/CD pipeline" },
  { label: "Career Ready", status: "target", score: 90, time: "4 weeks", project: "Interview prep" },
];

export const dashboardInsights = [
  "Your AI/ML projects are strong, but deployment and Docker skills are still limiting your readiness.",
  "Resume impact statements would make your profile more convincing to recruiters.",
  "You are close to interview-ready; improve structured problem-solving responses in the next 2 weeks.",
];

export const weeklyMomentum = {
  learning: "4h 32m",
  projects: 2,
  problems: 18,
  interviews: 1,
};

export const projectCards = [
  {
    title: "AI Resume Analyzer",
    level: "Advanced",
    impact: 91,
    tags: "Python · NLP · LLM · FastAPI",
    duration: "3 weeks",
  },
  {
    title: "Fraud Detection System",
    level: "Intermediate",
    impact: 82,
    tags: "XGBoost · Feature Engineering · Python",
    duration: "2 weeks",
  },
  {
    title: "Weather Intelligence Dashboard",
    level: "Intermediate",
    impact: 78,
    tags: "React · APIs · Visualization",
    duration: "1 week",
  },
];

export const resumeMetrics = [
  { label: "ATS", score: 82 },
  { label: "Skills", score: 86 },
  { label: "Projects", score: 71 },
  { label: "Impact", score: 62 },
  { label: "Keywords", score: 79 },
  { label: "Clarity", score: 84 },
];

export const jobMatch = {
  company: "Google",
  role: "Software Engineer",
  match: 74,
  strengths: [
    { name: "Python", status: true },
    { name: "DSA", status: true },
    { name: "System Design", status: false },
    { name: "AWS", status: false },
    { name: "Docker", status: false },
    { name: "Git", status: true },
  ],
};

export const interviewMetrics = [
  { label: "Technical Accuracy", score: 84 },
  { label: "Communication", score: 78 },
  { label: "Clarity", score: 81 },
  { label: "Structure", score: 69 },
  { label: "Confidence", score: 73 },
];

export const techRadar = [
  { name: "AI Agents", trend: "Trending ↑", relevance: 5, description: "Highly relevant to your AI Engineer target role." },
  { name: "MLOps", trend: "Rising ↑", relevance: 4, description: "Deployment and pipeline automation remains critical." },
  { name: "Docker", trend: "Essential ↑", relevance: 5, description: "Strong signal for backend and deployment readiness." },
  { name: "System Design", trend: "Core ↓", relevance: 4, description: "Continue to invest in architecture communication skills." },
];

export const institutionMetrics = {
  students: 2480,
  careerReady: 61,
  avgSkillScore: 68,
  projectsCompleted: 1842,
  interviewReady: 54,
};

export const institutionHeatmap = [
  { label: "DSA", score: 72 },
  { label: "Cloud", score: 43 },
  { label: "AI/ML", score: 58 },
  { label: "Communication", score: 67 },
  { label: "System Design", score: 39 },
];

export const commandPaletteItems = [
  { label: "Go to Dashboard", href: "/dashboard" },
  { label: "Career DNA", href: "/dashboard/career-dna" },
  { label: "Roadmap", href: "/dashboard/roadmap" },
  { label: "Next Action", href: "/dashboard/next-action" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Resume", href: "/dashboard/resume" },
  { label: "Job Match", href: "/dashboard/jobs" },
  { label: "Interview", href: "/dashboard/interview" },
  { label: "Tech Radar", href: "/dashboard/tech-radar" },
  { label: "Ask VERNIQ", href: "/dashboard/mentor" },
];

export const demoProjectMilestones = [
  "Setup",
  "Database",
  "Backend",
  "AI Model",
  "Frontend",
  "Testing",
  "Deployment",
];
