"use client";

import React from "react";
import { Bold, Italic, Code as CodeIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageInputProps {
    editorRef: React.RefObject<HTMLDivElement | null>;
    isEditorEmpty: boolean;
    editorTextLength: number;
    activeFormats: { bold: boolean; italic: boolean; code: boolean };
    applyFormat: (style: "bold" | "italic" | "code") => void;
    handleInput: (e: React.FormEvent<HTMLDivElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    sendMessage: (e: React.SyntheticEvent) => void;
}

export function ChatMessageInput({
    editorRef,
    isEditorEmpty,
    editorTextLength,
    activeFormats,
    applyFormat,
    handleInput,
    handleKeyDown,
    sendMessage
}: ChatMessageInputProps) {
    return (
        <div className="border-t border-border bg-card p-4">
            {/* Rich input toolbar wrapper */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2 px-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat("bold"); }}
                        className={`h-7 w-7 rounded-lg transition-colors ${activeFormats.bold ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                        title="Bold"
                    >
                        <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat("italic"); }}
                        className={`h-7 w-7 rounded-lg transition-colors ${activeFormats.italic ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                        title="Italic"
                    >
                        <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat("code"); }}
                        className={`h-7 w-7 rounded-lg transition-colors ${activeFormats.code ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                        title="Code"
                    >
                        <CodeIcon className="h-3.5 w-3.5" />
                    </Button>

                    <div className="flex-1" />
                    <span className="text-[10px] text-muted-foreground font-semibold">
                        {editorTextLength}/1000
                    </span>
                </div>

                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        data-placeholder="Send accountability update or message..."
                        className="flex-1 bg-muted/40 border border-border/80 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/60 text-xs p-2.5 min-h-[40px] max-h-32 overflow-y-auto rounded-xl outline-none transition-all focus:ring-1 focus:ring-primary/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 select-text"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isEditorEmpty}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 rounded-xl shrink-0 transition-all shadow-sm"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
