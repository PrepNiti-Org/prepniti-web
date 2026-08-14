import { api } from "@/lib/api";

export interface ChatUser {
    id: string;
    username: string;
    avatar_url?: string;
    target_exam?: string;
    last_read_message_id?: number;
}

export interface ChatMessage {
    id: number;
    room_id: string;
    sender_id: string;
    content: string;
    media_url?: string;
    created_at: string;
    sender: ChatUser;
}

export interface RoomDetail {
    id: string;
    name?: string;
    is_group: boolean;
    members: ChatUser[];
    last_message?: ChatMessage;
    unread_count: number;
}

export interface CreateRoomInput {
    partner_username?: string;
    is_group: boolean;
    group_name?: string;
}

export const createChatRoom = async (input: CreateRoomInput): Promise<RoomDetail> => {
    const res = await api.post("/chat/rooms", input);
    return res.data.data;
};

export const getChatRooms = async (): Promise<RoomDetail[]> => {
    const res = await api.get("/chat/rooms");
    return res.data.data || [];
};

export const getRoomMessages = async (roomId: string, beforeId = 0, limit = 20): Promise<ChatMessage[]> => {
    const res = await api.get(`/chat/rooms/${roomId}/messages?before=${beforeId}&limit=${limit}`);
    return res.data.data || [];
};

export const markRoomAsRead = async (roomId: string): Promise<void> => {
    await api.post(`/chat/rooms/${roomId}/read`);
};
