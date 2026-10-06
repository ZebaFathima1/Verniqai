export const LEVELS = ["basic", "intermediate", "pro"] as const;

export type VerniqLevel = (typeof LEVELS)[number];

export const levelDetails: Record<
  VerniqLevel,
  { name: string; subtitle: string; accent: string; next: VerniqLevel | null }
> = {
  basic: {
    name: "BASIC",
    subtitle: "Build Your Foundation",
    accent: "blue",
    next: "intermediate",
  },
  intermediate: {
    name: "INTERMEDIATE",
    subtitle: "Build Skills. Build Projects.",
    accent: "violet",
    next: "pro",
  },
  pro: {
    name: "PRO",
    subtitle: "Become Career Ready",
    accent: "indigo",
    next: null,
  },
};

export function normalizeLevel(value: unknown): VerniqLevel {
  return LEVELS.includes(value as VerniqLevel) ? (value as VerniqLevel) : "pro";
}

export function levelForEmail(email: string): VerniqLevel {
  const normalized = email.trim().toLowerCase();
  if (normalized === "aarav@verniq.ai") return "basic";
  if (normalized === "priya@verniq.ai") return "intermediate";
  return "pro";
}

export const demoAccounts = [
  {
    name: "Aarav",
    email: "aarav@verniq.ai",
    password: "basic1234",
    targetRole: "Software Developer",
    level: "basic" as const,
  },
  {
    name: "Priya",
    email: "priya@verniq.ai",
    password: "build1234",
    targetRole: "Full Stack Developer",
    level: "intermediate" as const,
  },
  {
    name: "Rahul Sharma",
    email: "rahul@verniq.ai",
    password: "demo1234",
    targetRole: "AI / ML Engineer",
    level: "pro" as const,
  },
];

export const levelNavigation: Record<VerniqLevel, { label: string; href: string }[]> = {
  basic: [
    { label: "Overview", href: "/dashboard" },
    { label: "AI Mentor", href: "/dashboard/mentor" },
    { label: "AI News", href: "/dashboard/news" },
    { label: "Career DNA", href: "/dashboard/career-dna" },
    { label: "Learning", href: "/dashboard/learning" },
    { label: "Practice", href: "/dashboard/practice" },
    { label: "Opportunities", href: "/dashboard/opportunities" },
  ],
  intermediate: [
    { label: "Overview", href: "/dashboard" },
    { label: "AI Mentor", href: "/dashboard/mentor" },
    { label: "AI News", href: "/dashboard/news" },
    { label: "Career DNA", href: "/dashboard/career-dna" },
    { label: "Learning", href: "/dashboard/learning" },
    { label: "Projects", href: "/dashboard/projects" },
    { label: "GitHub", href: "/dashboard/github" },
    { label: "Skill Gaps", href: "/dashboard/skill-gaps" },
    { label: "Opportunities", href: "/dashboard/opportunities" },
  ],
  pro: [
    { label: "Overview", href: "/dashboard" },
    { label: "AI Mentor", href: "/dashboard/mentor" },
    { label: "AI News", href: "/dashboard/news" },
    { label: "Career DNA", href: "/dashboard/career-dna" },
    { label: "Projects", href: "/dashboard/projects" },
    { label: "Resume", href: "/dashboard/resume" },
    { label: "Job Match", href: "/dashboard/jobs" },
    { label: "Interview", href: "/dashboard/interview" },
    { label: "Portfolio", href: "/dashboard/portfolio" },
    { label: "Career Report", href: "/dashboard/career-report" },
    { label: "Opportunities", href: "/dashboard/opportunities" },
  ],
};

export const learningPaths = [
  {
    id: "programming",
    title: "Programming foundations",
    skills: ["Variables", "Conditions", "Loops", "Functions", "Lists", "Dictionaries", "OOP"],
    levels: ["basic", "intermediate", "pro"] as VerniqLevel[],
  },
  {
    id: "web",
    title: "Web development",
    skills: ["HTML & CSS", "JavaScript", "React", "Node.js", "REST APIs", "Databases", "Deployment"],
    levels: ["basic", "intermediate", "pro"] as VerniqLevel[],
  },
  {
    id: "ai",
    title: "AI & machine learning",
    skills: ["Python", "Data preparation", "Statistics", "Machine learning", "Deep learning", "MLOps"],
    levels: ["basic", "intermediate", "pro"] as VerniqLevel[],
  },
  {
    id: "data",
    title: "Data science",
    skills: ["Spreadsheets", "SQL", "Python", "Visualization", "Statistics", "Data storytelling"],
    levels: ["basic", "intermediate", "pro"] as VerniqLevel[],
  },
  {
    id: "cyber",
    title: "Cybersecurity",
    skills: ["Security basics", "Networking", "Linux", "Threat modeling", "Web security", "Incident response"],
    levels: ["basic", "intermediate", "pro"] as VerniqLevel[],
  },
  {
    id: "cloud",
    title: "Cloud & databases",
    skills: ["Git & GitHub", "SQL databases", "Cloud concepts", "Containers", "CI/CD", "Monitoring"],
    levels: ["basic", "intermediate", "pro"] as VerniqLevel[],
  },
];

export const opportunities = [
  { id: "python-workshop", title: "Python Foundations Workshop", organization: "VERNIQ Learning", type: "Workshop", level: "basic" as const, duration: "4 weeks", skills: ["Python", "Programming"], relevance: 5, href: "https://www.python.org/about/gettingstarted/" },
  { id: "web-fundamentals", title: "Web Development Foundations", organization: "MDN Web Docs", type: "Course", level: "basic" as const, duration: "Self-paced", skills: ["HTML", "CSS", "JavaScript"], relevance: 5, href: "https://developer.mozilla.org/en-US/docs/Learn" },
  { id: "git-intro", title: "Git and GitHub Skills", organization: "GitHub Skills", type: "Course", level: "basic" as const, duration: "2 hours", skills: ["Git", "GitHub"], relevance: 4, href: "https://skills.github.com/" },
  { id: "hacktoberfest", title: "Open-source contribution starter", organization: "GitHub", type: "Open Source", level: "intermediate" as const, duration: "Self-paced", skills: ["Git", "Collaboration", "Documentation"], relevance: 5, href: "https://goodfirstissue.dev/" },
  { id: "build-api", title: "Build and deploy a production API", organization: "VERNIQ Projects", type: "Project Program", level: "intermediate" as const, duration: "3 weeks", skills: ["REST APIs", "Testing", "Deployment"], relevance: 5, href: "https://vercel.com/docs" },
  { id: "ml-cert", title: "Machine Learning learning resources", organization: "Google Developers", type: "Course", level: "intermediate" as const, duration: "Self-paced", skills: ["Python", "Machine Learning"], relevance: 4, href: "https://developers.google.com/machine-learning/crash-course" },
  { id: "internships", title: "Explore internship listings", organization: "Wellfound", type: "Internship", level: "pro" as const, duration: "Varies", skills: ["Portfolio", "Communication"], relevance: 5, href: "https://wellfound.com/jobs" },
  { id: "opensource", title: "Explore open-source programs", organization: "GitHub", type: "Open Source", level: "pro" as const, duration: "Varies", skills: ["Engineering", "Collaboration"], relevance: 4, href: "https://github.com/topics/good-first-issue" },
  { id: "jobs", title: "Explore technology roles", organization: "LinkedIn", type: "Jobs", level: "pro" as const, duration: "Ongoing", skills: ["Career readiness", "Networking"], relevance: 4, href: "https://www.linkedin.com/jobs/" },
];

export const newsBriefings = [
  {
    id: "ai-tooling",
    category: "Artificial Intelligence",
    title: "AI development tools are becoming part of everyday engineering",
    summary: "Teams increasingly use AI coding assistants alongside normal development workflows.",
    whyItMatters: "Knowing how to review generated code, test it, and explain trade-offs is becoming a practical engineering skill.",
    skills: ["AI", "Software Development", "Programming"],
    action: "Try an AI assistant on a small task, then review and test every change it suggests.",
    source: "VERNIQ evergreen briefing",
  },
  {
    id: "cloud-deployment",
    category: "Cloud",
    title: "Deployment literacy helps developers ship useful software",
    summary: "Cloud platforms continue to make deployment workflows available to small teams and individual builders.",
    whyItMatters: "A working deployment demonstrates more than code: configuration, reliability, and delivery.",
    skills: ["Cloud", "Software Development", "Web Development"],
    action: "Deploy one small project and document its setup, environment variables, and limitations.",
    source: "VERNIQ evergreen briefing",
  },
  {
    id: "data-literacy",
    category: "Data",
    title: "Data quality remains central to trustworthy AI",
    summary: "AI systems depend on data that is relevant, clean, and responsibly handled.",
    whyItMatters: "Data validation and clear evaluation make projects more credible than model choice alone.",
    skills: ["Data", "Machine Learning", "Artificial Intelligence"],
    action: "Add a data-quality check and a documented evaluation metric to your next project.",
    source: "VERNIQ evergreen briefing",
  },
  {
    id: "security-basics",
    category: "Cybersecurity",
    title: "Secure defaults matter even in small web applications",
    summary: "Secrets management, input validation, and least-privilege access reduce common application risks.",
    whyItMatters: "Security habits are useful from a first portfolio project through production software.",
    skills: ["Cybersecurity", "Web Development", "Software Development", "Cloud"],
    action: "Check that API keys stay server-side and validate untrusted input at every endpoint.",
    source: "VERNIQ evergreen briefing",
  },
  {
    id: "career-evidence",
    category: "Jobs & Careers",
    title: "Project evidence can make technical skills easier to evaluate",
    summary: "A clear README, a working demo, and specific decisions help others understand a project.",
    whyItMatters: "Employers can assess demonstrated work more easily when its purpose and results are explained.",
    skills: ["Jobs & Careers", "Startups", "Software Development"],
    action: "Improve one project README with a problem statement, screenshots, setup steps, and trade-offs.",
    source: "VERNIQ evergreen briefing",
  },
];
