import { api } from "@/lib/api";

export interface Post {
    id: string;
    title: string;
    content: string;
    tags: string[] | null;
    upvotes: number;
    created_at: string;
    user: {
        username: string;
    };
}

export interface CreatePostDTO {
    title: string;
    content: string;
    tags: string[];
}

interface GetPostsParams {
    pageParam?: number;
}

interface FetchPostsResponse {
    data: Post[];
    nextPage: number | null;
}

export const getPosts = async ({
    pageParam = 1,
}: GetPostsParams): Promise<FetchPostsResponse> => {
    const res = await api.get(`/posts?page=${pageParam}&limit=10`);
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
