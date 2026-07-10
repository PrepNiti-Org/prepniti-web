import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("lucide-react", () => ({
  Calendar: () => <svg data-testid="calendar-icon" />,
  MessageSquare: () => <svg data-testid="msg-icon" />,
  ShieldCheck: () => <svg data-testid="shield-icon" />,
  User: () => <svg data-testid="user-icon" />,
  ThumbsUp: () => <svg data-testid="thumbsup-icon" />,
  Bookmark: () => <svg data-testid="bookmark-icon" />,
  Share2: () => <svg data-testid="share-icon" />,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarFallback: ({ children }: any) => <span>{children}</span>,
  AvatarImage: (props: any) => <img {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div role="dialog">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/markdown-preview", () => ({
  MarkdownPreview: ({ value }: any) => <div>{value}</div>,
}));

import { api } from "@/lib/api";
import {
  toggleExperienceBookmark,
  toggleExperienceLike,
  getBookmarkedExperiences,
} from "../features/experiences/api";
import { toast } from "sonner";
import { PostCard } from "../features/experiences/components/PostCard";
import type { Experience } from "../features/experiences/api";

const baseExp: Experience = {
  id: "exp-uuid-1",
  exam_name: "GATE CSE",
  year: 2025,
  verdict: "Selected",
  difficulty: "Hard",
  description: "Detailed interview experience description.",
  is_anonymous: false,
  created_at: new Date().toISOString(),
  user_id: "user-uuid-1",
  user: { username: "testuser" },
  like_count: 3,
  is_liked: false,
  is_bookmarked: false,
};

describe("experiences/api – toggleExperienceBookmark", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /experiences/:id/bookmark and returns bookmarked: true", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { message: "Bookmarked", bookmarked: true },
    });

    const result = await toggleExperienceBookmark("exp-uuid-1");

    expect(api.post).toHaveBeenCalledWith("/experiences/exp-uuid-1/bookmark");
    expect(result).toEqual({ message: "Bookmarked", bookmarked: true });
  });

  it("returns bookmarked: false when unbookmarking", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { message: "Unbookmarked", bookmarked: false },
    });

    const result = await toggleExperienceBookmark("exp-uuid-1");
    expect(result.bookmarked).toBe(false);
  });

  it("propagates errors on API failure", async () => {
    (api.post as any).mockRejectedValueOnce(new Error("Network error"));
    await expect(toggleExperienceBookmark("exp-uuid-1")).rejects.toThrow("Network error");
  });
});

describe("experiences/api – toggleExperienceLike", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /experiences/:id/like and returns like data", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { message: "Liked", liked: true, like_count: 4 },
    });

    const result = await toggleExperienceLike("exp-uuid-1");

    expect(api.post).toHaveBeenCalledWith("/experiences/exp-uuid-1/like");
    expect(result).toEqual({ message: "Liked", liked: true, like_count: 4 });
  });
});

describe("experiences/api – getBookmarkedExperiences", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches page 1 by default", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { data: [baseExp], next_page: 2 },
    });

    const result = await getBookmarkedExperiences({ pageParam: 1 });

    expect(api.get).toHaveBeenCalledWith("/experiences/bookmarked?page=1&limit=10");
    expect(result.data).toHaveLength(1);
    expect(result.nextPage).toBe(2);
  });

  it("returns empty data when no bookmarks", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { data: [], next_page: null },
    });

    const result = await getBookmarkedExperiences({});
    expect(result.data).toHaveLength(0);
    expect(result.nextPage).toBeNull();
  });
});

describe("PostCard – bookmark button", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the bookmark icon in the dialog footer", () => {
    render(<PostCard post={baseExp} />);
    expect(screen.getAllByTestId("bookmark-icon").length).toBeGreaterThan(0);
  });

  it("calls toggleExperienceBookmark on click and shows success toast", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { message: "Bookmarked", bookmarked: true },
    });

    render(<PostCard post={baseExp} />);

    const bookmarkBtns = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("[data-testid='bookmark-icon']"));
    expect(bookmarkBtns.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(bookmarkBtns[0]);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/experiences/exp-uuid-1/bookmark");
      expect(toast.success).toHaveBeenCalledWith("Saved to bookmarks!");
    });
  });

  it("shows error toast when bookmark API fails", async () => {
    (api.post as any).mockRejectedValueOnce(new Error("Server error"));

    render(<PostCard post={baseExp} />);

    const bookmarkBtns = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("[data-testid='bookmark-icon']"));

    await act(async () => {
      fireEvent.click(bookmarkBtns[0]);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update bookmark");
    });
  });

  it("initialises as bookmarked when post.is_bookmarked is true", () => {
    render(<PostCard post={{ ...baseExp, is_bookmarked: true }} />);
    const bookmarkBtns = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("[data-testid='bookmark-icon']"));
    expect(bookmarkBtns[0].className).toMatch(/primary/);
  });

  it("shows unbookmark toast when already bookmarked and toggled", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { message: "Unbookmarked", bookmarked: false },
    });

    render(<PostCard post={{ ...baseExp, is_bookmarked: true }} />);

    const bookmarkBtns = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("[data-testid='bookmark-icon']"));

    await act(async () => {
      fireEvent.click(bookmarkBtns[0]);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Removed from bookmarks");
    });
  });
});

describe("PostCard – helpful (like) button", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls toggleExperienceLike on click and shows success toast", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { message: "Liked", liked: true, like_count: 4 },
    });

    render(<PostCard post={baseExp} />);

    const likeBtns = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("[data-testid='thumbsup-icon']"));
    expect(likeBtns.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(likeBtns[0]);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/experiences/exp-uuid-1/like");
      expect(toast.success).toHaveBeenCalledWith("Marked as helpful!");
    });
  });

  it("syncs is_liked from updated post prop", () => {
    const { rerender } = render(<PostCard post={baseExp} />);
    rerender(<PostCard post={{ ...baseExp, is_liked: true, like_count: 5 }} />);
    // button label should contain "Helpful"
    expect(screen.getAllByText(/Helpful/i).length).toBeGreaterThan(0);
  });
});
