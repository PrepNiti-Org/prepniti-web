import { describe, it, expect, vi, beforeEach } from "vitest";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  getExperiences,
  getExperienceById,
} from "../features/experiences/api";
import {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
} from "../features/posts/api";

describe("Experience CRUD Operations API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createExperience calls POST /experiences with input data", async () => {
    const payload = {
      exam_name: "UPSC CSE 2025",
      year: 2025,
      verdict: "Selected",
      difficulty: "Hard",
      description: "My detailed interview strategy and questions...",
      is_anonymous: false,
    };

    (api.post as any).mockResolvedValueOnce({
      data: { data: { id: "exp-123", ...payload } },
    });

    const result = await createExperience(payload);
    expect(api.post).toHaveBeenCalledWith("/experiences", payload);
    expect(result.id).toBe("exp-123");
    expect(result.exam_name).toBe("UPSC CSE 2025");
  });

  it("getExperiences calls GET /experiences with filters and pagination", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        data: [{ id: "exp-123", exam_name: "UPSC CSE" }],
        next_page: 2,
      },
    });

    const result = await getExperiences({
      pageParam: 1,
      sort: "feed",
      examName: "UPSC",
      verdict: "Selected",
      difficulty: "Hard",
      search: "strategy",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/experiences?page=1&limit=10&sort=feed&exam_name=UPSC&verdict=Selected&difficulty=Hard&search=strategy"
    );
    expect(result.data).toHaveLength(1);
    expect(result.nextPage).toBe(2);
  });

  it("getExperienceById calls GET /experiences/:id", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { data: { id: "exp-123", exam_name: "UPSC CSE 2025" } },
    });

    const result = await getExperienceById("exp-123");
    expect(api.get).toHaveBeenCalledWith("/experiences/exp-123");
    expect(result.exam_name).toBe("UPSC CSE 2025");
  });

  it("updateExperience calls PATCH /experiences/:id with updated fields", async () => {
    const updatePayload = {
      description: "Updated description text here...",
      verdict: "Waitlist",
    };

    (api.patch as any).mockResolvedValueOnce({
      data: { data: { id: "exp-123", ...updatePayload } },
    });

    const result = await updateExperience({ id: "exp-123", data: updatePayload });
    expect(api.patch).toHaveBeenCalledWith("/experiences/exp-123", updatePayload);
    expect(result.data.verdict).toBe("Waitlist");
  });

  it("deleteExperience calls DELETE /experiences/:id", async () => {
    (api.delete as any).mockResolvedValueOnce({
      data: { message: "Experience deleted successfully" },
    });

    const result = await deleteExperience("exp-123");
    expect(api.delete).toHaveBeenCalledWith("/experiences/exp-123");
    expect(result.message).toBe("Experience deleted successfully");
  });
});

describe("Post (Discussion) CRUD Operations API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createPost calls POST /posts with payload", async () => {
    const postPayload = {
      title: "Best Mock Tests Strategy",
      content: "Here is how to approach mock test series...",
      tags: ["strategy", "mocks"],
    };

    (api.post as any).mockResolvedValueOnce({
      data: { id: "post-123", ...postPayload },
    });

    const result = await createPost(postPayload);
    expect(api.post).toHaveBeenCalledWith("/posts", postPayload);
    expect(result.id).toBe("post-123");
  });

  it("getPosts calls GET /posts with query parameters", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        data: [{ id: "post-123", title: "Strategy Post" }],
        next_page: null,
      },
    });

    const result = await getPosts({
      pageParam: 1,
      tag: "strategy",
      search: "mock",
      sort: "newest",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/posts?page=1&limit=10&tag=strategy&search=mock&sort=newest"
    );
    expect(result.data).toHaveLength(1);
    expect(result.nextPage).toBeNull();
  });

  it("getPostById calls GET /posts/:id", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { data: { id: "post-123", title: "Single Post Title" } },
    });

    const result = await getPostById("post-123");
    expect(api.get).toHaveBeenCalledWith("/posts/post-123");
    expect(result.title).toBe("Single Post Title");
  });

  it("updatePost calls PATCH /posts/:id with partial payload", async () => {
    const patchData = {
      title: "Updated Title for Strategy Post",
      tags: ["strategy", "upsc"],
    };

    (api.patch as any).mockResolvedValueOnce({
      data: { data: { id: "post-123", ...patchData } },
    });

    const result = await updatePost({ id: "post-123", data: patchData });
    expect(api.patch).toHaveBeenCalledWith("/posts/post-123", patchData);
    expect(result.data.title).toBe("Updated Title for Strategy Post");
  });

  it("deletePost calls DELETE /posts/:id", async () => {
    (api.delete as any).mockResolvedValueOnce({
      data: { message: "Post deleted successfully" },
    });

    const result = await deletePost("post-123");
    expect(api.delete).toHaveBeenCalledWith("/posts/post-123");
    expect(result.message).toBe("Post deleted successfully");
  });
});

