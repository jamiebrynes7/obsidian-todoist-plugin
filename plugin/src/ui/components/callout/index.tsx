import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import classNames from "classnames";
import type React from "react";
import "./styles.scss";

export type Contents = string | { msg: string; children: Contents[] };

type Props = {
  title: string;
  className: string;
  iconId: string;
  contents?: Contents[];
};

const renderContents = (content: Contents): React.ReactNode => {
  if (typeof content === "string") {
    return <li key={content}>{content}</li>;
  }

  return (
    <li key={content.msg}>
      {content.msg}
      {content.children && content.children.length > 0 && (
        <ul>{content.children.map((child) => renderContents(child))}</ul>
      )}
    </li>
  );
};

export const Callout: React.FC<Props> = ({ title, contents, iconId, className }) => {
  return (
    <div className={classNames("todoist-callout", className)}>
      <div className="callout-header">
        <ObsidianIcon id={iconId} size="l" />
        <span>{title}</span>
      </div>
      {contents && (
        <ul className="callout-contents">{contents.map((content) => renderContents(content))}</ul>
      )}
    </div>
  );
};
