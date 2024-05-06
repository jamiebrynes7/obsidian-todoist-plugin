import { fireCommand } from "@/commands";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { MarkdownEditButtonContext, PluginContext } from "@/ui/context";
import classNames from "classnames";
import React from "react";
import { Button } from "react-aria-components";

type Props = {
  title: string;
  isFetching: boolean;
  refresh: () => Promise<void>;
};

export const QueryHeader: React.FC<Props> = ({ title, isFetching, refresh }) => {
  const plugin = PluginContext.use();
  const { click: editBlock } = MarkdownEditButtonContext.use()();

  return (
    <div className="todoist-query-header">
      <span className="todoist-query-title">{title}</span>
      <div className="todoist-query-controls">
        <HeaderButton
          className="add-task"
          iconId="plus"
          action={() => fireCommand("add-task-page-content", plugin)}
        />
        <HeaderButton
          className={classNames("refresh-query", { "is-refreshing": isFetching })}
          iconId="refresh-ccw"
          action={async () => {
            await refresh();
          }}
        />
        <HeaderButton
          className="edit-query"
          iconId="lucide-code-2"
          action={() => {
            editBlock();
          }}
        />
      </div>
    </div>
  );
};

type ButtonProps = {
  iconId: string;
  action: () => Promise<void> | void;
  className: string;
};

const HeaderButton: React.FC<ButtonProps> = ({ iconId, action, className }) => {
  const handler = async () => {
    const result = action();

    if (result instanceof Promise) {
      await result;
    }
  };

  return (
    <Button className={classNames("todoist-query-control-button", className)} onPress={handler}>
      <ObsidianIcon id={iconId} size={14} />
    </Button>
  );
};
