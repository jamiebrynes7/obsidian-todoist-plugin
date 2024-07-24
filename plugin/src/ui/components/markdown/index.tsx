import { RenderChildContext } from "@/ui/context";
import { MarkdownRenderer, Component } from "obsidian";
import React, { useEffect, useRef } from "react";

interface MarkdownProps {
  content: string;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
  const renderChild = RenderChildContext.use();
  const ref = useRef<HTMLDivElement>(null);
  let componentRef = useRef<Component | null>(null);

  useEffect(() => {
    const renderMarkdown = async () => {
      if (ref.current === null) {
        return;
      }

      // Create a new component or use existing one
      if (componentRef.current === null) {
        componentRef.current = new Component();
      }

      // Attach renderChild to the component
      componentRef.current.addChild(renderChild);

      // Render markdown content
      await MarkdownRenderer.renderMarkdown(content, ref.current, "", componentRef.current);

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
