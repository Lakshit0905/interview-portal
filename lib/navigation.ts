export interface NavItem {
  title: string;
  href: string;
  icon: string; // lucide icon name
  shortcut?: string;
  group: "Overview" | "Knowledge" | "Practice" | "Pipeline" | "AI";
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", shortcut: "G D", group: "Overview" },
  { title: "Knowledge Hub", href: "/knowledge", icon: "Brain", shortcut: "G K", group: "Knowledge" },
  { title: "Learning Roadmap", href: "/roadmap", icon: "Map", shortcut: "G L", group: "Knowledge" },
  { title: "Video Learning Hub", href: "/videos", icon: "Video", shortcut: "G W", group: "Knowledge" },
  { title: "Coding Tracker", href: "/coding", icon: "Code2", shortcut: "G C", group: "Practice" },
  { title: "Patterns", href: "/coding/patterns", icon: "Workflow", group: "Practice" },
  { title: "Question Bank", href: "/questions", icon: "HelpCircle", shortcut: "G Q", group: "Practice" },
  { title: "Flashcards", href: "/flashcards", icon: "Layers", shortcut: "G F", group: "Practice" },
  { title: "AI Quizzes", href: "/quizzes", icon: "CheckSquare", shortcut: "G U", group: "Practice" },
  { title: "Revision Center", href: "/revision", icon: "CalendarCheck", shortcut: "G V", group: "Practice" },
  { title: "Behavioral Stories", href: "/behavioral", icon: "MessagesSquare", shortcut: "G B", group: "Practice" },
  { title: "System Design", href: "/system-design", icon: "Workflow", shortcut: "G S", group: "Practice" },
  { title: "Interview Tracker", href: "/interviews", icon: "CalendarClock", shortcut: "G I", group: "Pipeline" },
  { title: "Company Prep Hub", href: "/companies", icon: "Building2", shortcut: "G P", group: "Pipeline" },
  { title: "Resume Manager", href: "/resumes", icon: "FileText", shortcut: "G R", group: "Pipeline" },
  { title: "Question Generator", href: "/ai/generator", icon: "Sparkles", group: "AI" },
  { title: "Mock Interview", href: "/ai/mock", icon: "Bot", group: "AI" },
  { title: "Resume Analyzer", href: "/ai/resume-analyzer", icon: "ScanSearch", group: "AI" },
];

export const NAV_GROUPS = ["Overview", "Knowledge", "Practice", "Pipeline", "AI"] as const;
