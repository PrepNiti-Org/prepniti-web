import {
    Search,
    Timer,
    PenSquare,
    SunMoon,
    Bell,
    Filter,
    LayoutDashboard,
    PlayCircle,
    SlidersHorizontal,
    PlusCircle,
    Users2,
    Activity,
    Sparkles,
    Swords,
    GraduationCap,
    Clock,
    BarChart3,
    Flame,
    PieChart,
    History,
    MessagesSquare,
    Tags,
    User
} from "lucide-react";
import { TourStep } from "./types";

export const TOUR_STEPS: TourStep[] = [
    {
        id: "search",
        route: "/",
        targetSelector: '[data-tour="navbar-search"]',
        title: "Universal Search & Real Board Transcripts",
        description: "Search authentic interview board transcripts, exam strategies, book notes, and subject doubts across UPSC, State PSC, and Banking exams.",
        icon: Search,
        placement: "bottom"
    },
    {
        id: "post-create",
        route: "/",
        targetSelector: '[data-tour="navbar-post"]',
        mobileTargetSelector: '[data-tour="navbar-profile"]',
        title: "Anonymous Knowledge Sharing",
        description: "Post your interview board experiences, subject doubts, or handwritten study notes freely without revealing your real identity.",
        icon: PenSquare,
        placement: "bottom"
    },
    {
        id: "theme-toggle",
        route: "/",
        targetSelector: '[data-tour="navbar-theme"]',
        title: "Day & Night Theming",
        description: "Switch between distraction-free deep dark mode for late-night study sessions and crisp light mode for daylight reading.",
        icon: SunMoon,
        placement: "bottom"
    },
    {
        id: "notifications",
        route: "/",
        targetSelector: '[data-tour="navbar-notifications"]',
        title: "Real-Time Alerts & Updates",
        description: "Receive instant updates on study buddy requests, pact milestones, comment replies, and new interview transcripts.",
        icon: Bell,
        placement: "bottom"
    },
    {
        id: "tracker-board",
        route: "/tracker",
        targetSelector: '[data-tour="tracker-board"]',
        mobileTargetSelector: '[data-tour="tracker-board"]',
        title: "Visual Kanban Topic Board",
        description: "Move topics from Not Started → In Progress → Revised as you complete study sessions to visualize your revision velocity.",
        icon: LayoutDashboard,
        placement: "bottom"
    },
    {
        id: "tracker-task-timer",
        route: "/tracker",
        targetSelector: '[data-tour="tracker-task-timer"]',
        mobileTargetSelector: '[data-tour="tracker-task-timer"]',
        title: "1-Click Study Timer on Any Target",
        description: "Hit the Play button on any syllabus card to start timing your revision instantly without opening dialogs.",
        icon: PlayCircle,
        placement: "bottom"
    },
    {
        id: "tracker-detail-panel",
        route: "/tracker",
        targetSelector: '[data-tour="tracker-detail-panel"]',
        mobileTargetSelector: '[data-tour="tracker-board"]',
        title: "Task Details & Full Timer Controls",
        description: "Click any topic to open its detail pane. Here you can start/pause sessions, edit syllabus notes, and log study duration with revision summaries.",
        icon: SlidersHorizontal,
        placement: "left"
    },
    {
        id: "navbar-timer",
        route: "/tracker",
        targetSelector: '[data-tour="navbar-timer"]',
        mobileTargetSelector: '[data-tour="navbar-timer"]',
        title: "Global Timer: Seamless App-Wide Tracking",
        description: "Your timer stays active in the top bar across the whole app! Switch pages, attempt mocks, or browse offline-come back anytime to log your hours with notes.",
        icon: Timer,
        placement: "bottom"
    },
    {
        id: "tracker-filters",
        route: "/tracker",
        targetSelector: '[data-tour="tracker-filters"]',
        mobileTargetSelector: '[data-tour="tracker-filters"]',
        title: "Syllabus Subject & Priority Filters",
        description: "Filter syllabus targets by subject (Polity, History, Economy, Reasoning) and filter by urgency priority from Low to High.",
        icon: Filter,
        placement: "bottom"
    },
    {
        id: "tracker-add",
        route: "/tracker",
        targetSelector: '[data-tour="tracker-add-btn"]',
        mobileTargetSelector: '[data-tour="tracker-add-btn"]',
        title: "Create Custom Study Targets",
        description: "Add new topics with deadlines, estimated study hours, and resource tags to build your personalized exam syllabus roadmap.",
        icon: PlusCircle,
        placement: "bottom"
    },
    {
        id: "buddies-match",
        route: "/buddies",
        targetSelector: '[data-tour="buddies-header"]',
        mobileTargetSelector: '[data-tour="buddies-header"]',
        title: "Target Exam Peer Matcher",
        description: "Discover fellow aspirants targeting your same exam, optional subject, and district. Form accountability pacts to stay consistent.",
        icon: Users2,
        placement: "bottom"
    },
    {
        id: "buddies-feed",
        route: "/buddies",
        targetSelector: '[data-tour="buddies-tabs"]',
        mobileTargetSelector: '[data-tour="buddies-tabs"]',
        title: "Buddy Activity Feed & Requests",
        description: "View your study partners' daily hour logs, celebrate streak milestones, and send private 1-on-1 study buddy requests.",
        icon: Activity,
        placement: "bottom"
    },
    {
        id: "buddies-recommendations",
        route: "/buddies",
        targetSelector: '[data-tour="buddies-recommendations"]',
        mobileTargetSelector: '[data-tour="buddies-recommendations"]',
        title: "Smart Peer Recommendations",
        description: "AI-matched aspirants based on your target exam, optional subject, and geographical proximity to find local study partners.",
        icon: Sparkles,
        placement: "left"
    },
    {
        id: "buddies-pacts",
        route: "/buddies",
        targetSelector: '[data-tour="buddies-pacts"]',
        mobileTargetSelector: '[data-tour="buddies-pacts"]',
        title: "Accountability Study Pacts",
        description: "Create binding study pacts with fellow aspirants to hit daily minimum hour targets and keep each other disciplined.",
        icon: Swords,
        placement: "bottom"
    },
    {
        id: "mock-tests",
        route: "/mock-tests",
        targetSelector: '[data-tour="mock-tests-container"]',
        mobileTargetSelector: '[data-tour="mock-tests-container"]',
        title: "Full Mock Tests & Test Series",
        description: "Attempt pattern-aligned question papers with countdown timers, sectional blueprints, and negative marking constraints.",
        icon: GraduationCap,
        placement: "bottom"
    },
    {
        id: "mock-tests-tabs",
        route: "/mock-tests",
        targetSelector: '[data-tour="mock-tests-tabs"]',
        mobileTargetSelector: '[data-tour="mock-tests-tabs"]',
        title: "Exam Modes & Sectional Filters",
        description: "Switch seamlessly between full-length 120-minute timed mock exams and rapid topic-wise practice papers.",
        icon: Clock,
        placement: "bottom"
    },
    {
        id: "insights",
        route: "/insights",
        targetSelector: '[data-tour="insights-container"]',
        mobileTargetSelector: '[data-tour="insights-container"]',
        title: "PrepInsights & AI Analytics",
        description: "Deep dive into your weekly & monthly study hour graphs, subject time allocations, and revision vs practice ratios.",
        icon: BarChart3,
        placement: "bottom"
    },
    {
        id: "insights-stats",
        route: "/insights",
        targetSelector: '[data-tour="insights-stats"]',
        mobileTargetSelector: '[data-tour="insights-stats"]',
        title: "Consistency Streaks & Study Hours",
        description: "Track your active preparation streak, total logged study hours, and overall syllabus completion percentage.",
        icon: Flame,
        placement: "bottom"
    },
    {
        id: "insights-charts",
        route: "/insights",
        targetSelector: '[data-tour="insights-charts"]',
        mobileTargetSelector: '[data-tour="insights-charts"]',
        title: "Interactive Analytics & Subject Balance",
        description: "View daily study velocity curves and subject distribution charts to ensure you balance revision with mock practice.",
        icon: PieChart,
        placement: "left"
    },
    {
        id: "insights-logs",
        route: "/insights",
        targetSelector: '[data-tour="insights-logs"]',
        mobileTargetSelector: '[data-tour="insights-logs"]',
        title: "Session Auditor & History",
        description: "Audit all your logged study sessions with timestamps, attached notes, and exact subject time breakdowns.",
        icon: History,
        placement: "left"
    },
    {
        id: "posts",
        route: "/posts",
        targetSelector: '[data-tour="posts-container"]',
        mobileTargetSelector: '[data-tour="posts-container"]',
        title: "Aspirant Community Threads",
        description: "Ask subject doubts, discuss exam cutoffs, share strategies, and bookmark valuable discussions for your revisions.",
        icon: MessagesSquare,
        placement: "bottom"
    },
    {
        id: "posts-tags",
        route: "/posts",
        targetSelector: '[data-tour="posts-tags"]',
        mobileTargetSelector: '[data-tour="posts-tags"]',
        title: "Subject Tags & Doubts Filtering",
        description: "Filter discussion feeds by exam tags (#UPSC, #History, #Polity, #MockTests, #Strategy) to quickly find relevant advice.",
        icon: Tags,
        placement: "bottom"
    },
    {
        id: "profile",
        route: "/profile",
        targetSelector: '[data-tour="profile-main-card"]',
        mobileTargetSelector: '[data-tour="profile-main-card"]',
        title: "Aspirant Profile & Tour Replay",
        description: "Configure your target exam, state & district to unlock smarter recommendations. You can re-open this walkthrough anytime from the top bar!",
        icon: User,
        placement: "bottom"
    }
];
