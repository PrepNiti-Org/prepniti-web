import { api } from "@/lib/api";

export interface Post {
    id: string;
    title: string;
    content: string;
    tags: string[] | null;
    upvotes: number;
    created_at: string;
    media_url?: string;
    media_type?: string;
    user: {
        username: string;
    };
    comment_count?: number;
}

export interface CreatePostDTO {
    title: string;
    content: string;
    tags: string[];
    media_url?: string;
    media_type?: string;
}

interface GetPostsParams {
    pageParam?: number;
    tag?: string;
    search?: string;
    userId?: string;
    sort?: string;
}

interface FetchPostsResponse {
    data: Post[];
    nextPage: number | null;
}

export const getPosts = async ({
    pageParam = 1,
    tag,
    search,
    userId,
    sort,
}: GetPostsParams): Promise<FetchPostsResponse> => {
    let url = `/posts?page=${pageParam}&limit=10`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
    if (sort) url += `&sort=${encodeURIComponent(sort)}`;

    const res = await api.get(url);
    return {
        data: res.data.data || [],
        nextPage: res.data.next_page || null,
    };
};

export const getPostById = async (id: string): Promise<Post> => {
    const res = await api.get(`/posts/${id}`);
    return res.data.data;
};

export const createPost = async (data: CreatePostDTO) => {
    const res = await api.post("/posts", data);
    return res.data;
};

export const updatePost = async ({ id, data }: { id: string, data: Partial<CreatePostDTO> }) => {
    const res = await api.patch(`/posts/${id}`, data);
    return res.data;
};

export const deletePost = async (id: string) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
};

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    post_id: string;
    parent_id: string | null;
    upvotes: number;
    replies?: Comment[];
    user: {
        username: string;
    };
}

export const toggleLike = async (postId: string): Promise<{ message: string; upvotes: number }> => {
    const res = await api.post(`/posts/${postId}/like`);
    return res.data;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    const res = await api.get(`/posts/${postId}/comments`);
    return res.data.data;
};

export const createComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
    const res = await api.post(`/posts/${postId}/comments`, { content, parent_id: parentId });
    return res.data.data;
};

export const toggleCommentLike = async (commentId: string): Promise<{ message: string; upvotes: number }> => {
    const res = await api.post(`/comments/${commentId}/like`);
    return res.data;
};

export const toggleBookmark = async (postId: string): Promise<{ message: string; bookmarked: boolean }> => {
    const res = await api.post(`/posts/${postId}/bookmark`);
    return res.data;
};

export const getUserBookmarks = async (): Promise<string[]> => {
    const res = await api.get('/bookmarks');
    return res.data.data;
};

export const getUserLikes = async (): Promise<string[]> => {
    const res = await api.get('/likes');
    return res.data.data;
};

export const getBookmarkedPosts = async ({
    pageParam = 1,
}: GetPostsParams): Promise<FetchPostsResponse> => {
    const res = await api.get(`/posts/bookmarked?page=${pageParam}&limit=10`);
    return {
        data: res.data.data || [],
        nextPage: res.data.next_page || null,
    };
};

export const uploadMedia = async (file: File): Promise<{ url: string; type: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};
