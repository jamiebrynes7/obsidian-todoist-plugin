import { RenderChildContext } from "@/ui/context";
import { MarkdownRenderer } from "obsidian";
import type React from "react";
import { useEffect, useRef } from "react";

interface MarkdownProps {
  content: string;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
  const renderChild = RenderChildContext.use();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMarkdown = async () => {
      if (ref.current === null) {
        return;
      }

      await MarkdownRenderer.renderMarkdown(content, ref.current, "", renderChild);

      if (ref.current.childElementCount > 1) {
        return;
      }

      const markdownContent = ref.current.querySelector("p");

      if (markdownContent !== null) {
        markdownContent.parentElement?.removeChild(markdownContent);
        ref.current.innerHTML = markdownContent.innerHTML;
      }
    };

    renderMarkdown();
  }, [content, renderChild]);

  return <div ref={ref} className={className} />;
};

export default Markdown;
