import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import classNames from "classnames";
import React from "react";
import "./styles.scss";

type Props = {
  title: string;
  className: string;
  iconId: string;
  contents?: string[];
};

export const Callout: React.FC<Props> = ({ title, contents, iconId, className }) => {
  return (
    <div className={classNames("todoist-callout", className)}>
      <div className="callout-header">
        <ObsidianIcon id={iconId} size={24} />
        <span>{title}</span>
      </div>
      {contents && (
        <ul className="callout-contents">
          {contents.map((content) => (
            <li>{content}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
