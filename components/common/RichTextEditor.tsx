"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Quote,
  Code,
  RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  required?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write detailed analysis, build quality, features, or add links and images...",
  label,
  required = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const isInternalUpdate = useRef(false);

  // Helper: Convert basic markdown to HTML if legacy markdown was passed
  const formatInitialValue = (val: string) => {
    if (!val) return "";
    // If it already looks like HTML, return as-is
    if (/<[a-z][\s\S]*>/i.test(val)) return val;

    // Convert markdown headings
    let html = val
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h2>$1</h2>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;" />')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;">$1</a>')
      .replace(/\n\n/gim, "<p><br/></p>");

    return html;
  };

  // Sync external value to contentEditable when not typing inside
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      const formatted = formatInitialValue(value);
      if (editorRef.current.innerHTML !== formatted) {
        editorRef.current.innerHTML = formatted;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt("Enter external URL (e.g. https://amazon.com/...):");
    if (!url) return;
    executeCommand("createLink", url);
  };

  const handleImage = () => {
    const url = prompt("Enter image URL (e.g. https://res.cloudinary.com/...):");
    if (!url) return;
    executeCommand("insertImage", url);
  };

  const handleHeading = (tag: "h2" | "h3") => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-fg">
            {label} {required && <span className="text-theme-danger">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-theme-muted hidden sm:inline">WYSIWYG Visual Editor</span>
            <button
              type="button"
              onClick={() => setShowSource(!showSource)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
                showSource
                  ? "bg-theme-primary text-theme-primary-fg border-theme-primary"
                  : "bg-theme-bg text-theme-muted border-theme-border hover:text-theme-fg"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>{showSource ? "Visual Mode" : "HTML Source"}</span>
            </button>
          </div>
        </div>
      )}

      <div className="border border-theme-border rounded-xl overflow-hidden card-surface focus-within:border-theme-primary transition-colors">
        {/* WYSIWYG Toolbar */}
        {!showSource && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-theme-bg/90 border-b border-theme-border text-xs">
            {/* Bold */}
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors font-bold"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors italic"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-theme-border mx-1" />

            {/* Heading 2 */}
            <button
              type="button"
              onClick={() => handleHeading("h2")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors flex items-center"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            {/* Heading 3 */}
            <button
              type="button"
              onClick={() => handleHeading("h3")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors flex items-center"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-theme-border mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-theme-border mx-1" />

            {/* Link */}
            <button
              type="button"
              onClick={handleLink}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors flex items-center gap-1"
              title="Insert Link"
            >
              <Link2 className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">Link</span>
            </button>

            {/* Image */}
            <button
              type="button"
              onClick={handleImage}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors flex items-center gap-1"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">Image</span>
            </button>

            <span className="w-px h-4 bg-theme-border mx-1" />

            {/* Quote */}
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<blockquote>")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-fg hover:text-theme-primary transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>

            {/* Remove formatting */}
            <button
              type="button"
              onClick={() => executeCommand("removeFormat")}
              className="p-1.5 rounded hover:bg-theme-surface text-theme-muted hover:text-theme-fg transition-colors"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Visual ContentEditable Area */}
        {!showSource ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            className="w-full min-h-[160px] p-4 text-xs sm:text-sm text-theme-fg leading-relaxed focus:outline-none overflow-y-auto max-h-[420px] font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-theme-muted/50 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-theme-primary [&>h2]:border-b [&>h2]:border-theme-border/40 [&>h2]:pb-1 [&>h2]:my-2 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-theme-fg [&>h3]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2 [&>blockquote]:border-l-4 [&>blockquote]:border-theme-primary [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-theme-muted [&>blockquote]:my-2 [&>a]:text-theme-primary [&>a]:underline [&>img]:rounded-lg [&>img]:my-2"
          />
        ) : (
          <textarea
            rows={8}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 font-mono text-xs text-theme-fg bg-transparent focus:outline-none resize-y"
            placeholder="Edit raw HTML source code here..."
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-theme-muted px-1">
        <span>Click <strong>B</strong> or press <strong>Ctrl+B</strong> to bold text immediately.</span>
        <span>{value ? value.replace(/<[^>]*>/g, "").length : 0} characters</span>
      </div>
    </div>
  );
};
