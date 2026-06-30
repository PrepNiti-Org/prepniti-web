import { api } from "@/lib/api";

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    bio?: string;
    target_exam?: string;
    joined_at: string;
    role: string;
    is_public?: boolean;
}

export interface PerformanceStat {
    id: string;
    exam_name: string;
    score: number;
    max_score: number;
    percentage: number;
    month: string;
    attempted_at: string;
}

export interface UpdateProfileDTO {
    username: string;
    bio: string;
    target_exam: string;
    is_public?: boolean;
}

export interface ActivityData {
    streak: number;
    contributions: {
        id: number;
        title: string;
        details: string;
    }[];
}

export interface UserExperience {
    id: number;
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    description: string;
    created_at: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
    const res = await api.get("/users/me");
    return res.data.data || res.data;
};

export const getUserStats = async (): Promise<PerformanceStat[]> => {
    const res = await api.get("/users/me/stats");
    const chartData = res.data?.data;
    return Array.isArray(chartData) ? chartData : [];
};

export const updateUserProfile = async (data: UpdateProfileDTO) => {
    const res = await api.patch("/users/me", data);
    return res.data;
};

export const getUserActivity = async (): Promise<ActivityData> => {
    const res = await api.get("/users/me/activity");
    return res.data.data;
};

export const getUserExperiences = async (): Promise<UserExperience[]> => {
    const res = await api.get("/experiences/me");
    return res.data.data || [];
};

export interface MockTestTrendEntry {
    exam_name: string;
    percentage: number;
    score: number;
    max_score: number;
    attempted_at: string;
}

export interface MockTestPerPaper {
    exam_name: string;
    attempts: number;
    best_pct: number;
    avg_pct: number;
    last_attempted_at: string;
}

export interface MockTestInsights {
    total_attempts: number;
    avg_score_pct: number;
    best_score_pct: number;
    total_papers_attempted: number;
    recent_trend: MockTestTrendEntry[];
    per_paper: MockTestPerPaper[];
}

export const getMockTestInsights = async (): Promise<MockTestInsights> => {
    const res = await api.get("/users/me/stats/insights");
    return res.data;
};

export interface PublicProfileData extends UserProfile {
    streak: number;
    contributions: {
        id: number;
        title: string;
        details: string;
    }[];
    mock_count: number;
    best_score: number;
    stats: PerformanceStat[];
    buddy_status: "none" | "requested" | "accepted" | "blocked" | "sent" | "received";
    connection_id?: string;
}

export const getPublicProfile = async (username: string): Promise<PublicProfileData> => {
    const res = await api.get(`/users/profile/${username}`);
    return res.data.data;
};

export const sendBuddyRequest = async (target: string): Promise<{ message: string }> => {
    const res = await api.post("/buddies/request", { target });
    return res.data;
};

export const respondBuddyRequest = async (connectionId: string, accept: boolean): Promise<{ message: string }> => {
    const res = await api.post("/buddies/respond", { connection_id: connectionId, accept });
    return res.data;
};

export const removeBuddy = async (buddyId: string): Promise<{ message: string }> => {
    const res = await api.delete(`/buddies/${buddyId}`);
    return res.data;
};

export const blockUser = async (targetUserId: string): Promise<{ message: string }> => {
    const res = await api.post("/buddies/block", { target_user_id: targetUserId });
    return res.data;
};

export const unblockUser = async (targetUserId: string): Promise<{ message: string }> => {
    const res = await api.post("/buddies/unblock", { target_user_id: targetUserId });
    return res.data;
};


export const getBuddies = async (): Promise<UserProfile[]> => {
    const res = await api.get("/buddies");
    return res.data.data || [];
};

export interface BuddyRequest {
    connection_id: string;
    peer_id: string;
    peer_username: string;
    peer_bio?: string;
    peer_target?: string;
    created_at: string;
}

export interface PendingRequests {
    incoming: BuddyRequest[];
    outgoing: BuddyRequest[];
}

export const getPendingRequests = async (): Promise<PendingRequests> => {
    const res = await api.get("/buddies/requests");
    return res.data.data || { incoming: [], outgoing: [] };
};

export const getMutualBuddies = async (targetUserId: string): Promise<UserProfile[]> => {
    const res = await api.get(`/buddies/mutual/${targetUserId}`);
    return res.data.data || [];
};

export interface BuddyRecommendation {
    id: string;
    username: string;
    bio?: string;
    target_exam?: string;
    mutual_count: number;
}

export const getBuddyRecommendations = async (): Promise<BuddyRecommendation[]> => {
    const res = await api.get("/buddies/recommendations");
    return res.data.data || [];
};

export interface BuddyFeedItem {
    type: "test_attempt" | "task_completed" | "time_logged";
    timestamp: string;
    username: string;
    user_id: string;
    title: string;
    details: string;
    score?: number;
    max_score?: number;
    percentage?: number;
    duration?: number;
    task_name?: string;
}

export const getBuddyProgressFeed = async (): Promise<BuddyFeedItem[]> => {
    const res = await api.get("/buddies/feed");
    return res.data.data || [];
};

export interface DailyStudyEntry {
    day: string;      // "YYYY-MM-DD"
    minutes: number;
}

export interface DailyMockEntry {
    day: string;
    avg_pct: number;
}

export interface BuddyComparisonUser {
    user_id: string;
    username: string;
    streak: number;
    study: DailyStudyEntry[];
    mock: DailyMockEntry[];
}

export interface BuddyComparison {
    me: BuddyComparisonUser;
    buddy: BuddyComparisonUser;
}

export const getBuddyComparison = async (buddyUsername: string): Promise<BuddyComparison> => {
    const res = await api.get(`/buddies/compare/${buddyUsername}`);
    return res.data.data;
};

export interface SearchedUser {
    id: string;
    username: string;
    bio?: string;
    target_exam?: string;
}

export const searchUsers = async (query: string): Promise<SearchedUser[]> => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data.data || [];
};