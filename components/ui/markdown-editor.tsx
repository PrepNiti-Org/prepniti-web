"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Heading, Link as LinkIcon, Code, List, Eye, Edit2 } from "lucide-react";
import { Button } from "./button";

import { MarkdownPreview } from "./markdown-preview";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = "", className = "" }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    onChange(text.substring(0, start) + replacement + text.substring(end));

    // Refocus and set cursor selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className={`border rounded-xl bg-card overflow-hidden transition-all ${className}`}>
      <div className="flex justify-between items-center bg-muted/30 border-b border-border/40 p-2">
        <div className="flex gap-1">
          <Button
            type="button"
            variant={activeTab === "write" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("write")}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Write
          </Button>
          <Button
            type="button"
            variant={activeTab === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("preview")}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
        </div>

        {activeTab === "write" && (
          <div className="flex items-center gap-1.5 border-l border-border/60 pl-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Bold"
              onClick={() => insertText("**", "**")}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Italic"
              onClick={() => insertText("*", "*")}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Heading"
              onClick={() => insertText("### ")}
            >
              <Heading className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Link"
              onClick={() => insertText("[", "](url)")}
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Code Block"
              onClick={() => insertText("```\n", "\n```")}
            >
              <Code className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="List"
              onClick={() => insertText("- ")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 bg-background">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[200px] max-h-[500px] bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-y text-base font-normal leading-relaxed"
          />
        ) : (
          <div className="w-full min-h-[200px] max-h-[500px] overflow-y-auto">
            <MarkdownPreview value={value} />
          </div>
        )}
      </div>
    </div>
  );
}
