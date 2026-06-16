"use client";

import { marked } from "marked";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  value: string;
  className?: string;
}

export function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function MarkdownPreview({ value, className = "" }: MarkdownPreviewProps) {
  const renderMarkdown = () => {
    if (!value) return "";
    const escaped = escapeHtml(value);
    const parsedHtml = marked.parse(escaped, { async: false }) as string;
    return parsedHtml;
  };

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed text-foreground/90 select-text " +
        "[&>h1]:text-xl [&>h1]:font-extrabold [&>h1]:mt-5 [&>h1]:mb-2 " +
        "[&>h2]:text-lg [&>h2]:font-extrabold [&>h2]:mt-4 [&>h2]:mb-2 " +
        "[&>h3]:text-base [&>h3]:font-extrabold [&>h3]:mt-3 [&>h3]:mb-1 " +
        "[&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ul_li]:my-1 " +
        "[&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2 [&>ol_li]:my-1 " +
        "[&>p]:my-2 [&>p]:leading-relaxed " +
        "[&>a]:text-primary [&>a]:font-semibold [&>a]:underline hover:[&>a]:text-primary/80 " +
        "[&>pre]:bg-muted [&>pre]:p-3.5 [&>pre]:rounded-xl [&>pre]:my-3 [&>pre]:border [&>pre]:font-mono [&>pre]:text-xs [&>pre]:overflow-x-auto " +
        "[&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>code]:border " +
        "[&>blockquote]:border-l-4 [&>blockquote]:border-primary/40 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-3 [&>blockquote]:text-muted-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderMarkdown() }}
    />
  );
}
