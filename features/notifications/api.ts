import { api } from "@/lib/api";

export interface NotificationUser {
    id: string;
    username: string;
    avatar_url?: string;
}

export interface NotificationPost {
    id: string;
    content: string;
}

export interface NotificationComment {
    id: string;
    content: string;
}

export interface Notification {
    id: string;
    user_id: string;
    actor_id: string;
    type: "like_post" | "comment_post" | "like_comment" | "reply_comment" | "welcome" | "buddy_request" | "buddy_accepted";
    post_id?: string;
    comment_id?: string;
    is_read: boolean;
    created_at: string;
    actor: NotificationUser;
    post?: NotificationPost;
    comment?: NotificationComment;
}

interface GetNotificationsParams {
    pageParam?: number;
}

export interface FetchNotificationsResponse {
    data: Notification[];
    nextPage: number | null;
    unreadCount: number;
}

export const getNotifications = async ({
    pageParam = 1,
}: GetNotificationsParams): Promise<FetchNotificationsResponse> => {
    const res = await api.get(`/notifications?page=${pageParam}&limit=10`);
    return {
        data: res.data.data || [],
        nextPage: res.data.next_page || null,
        unreadCount: res.data.unread_count || 0,
    };
};

export const markNotificationsAsRead = async (): Promise<void> => {
    await api.post("/notifications/read");
};

export const markSingleNotificationAsRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};

