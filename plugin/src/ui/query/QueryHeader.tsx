import { type CommandId, fireCommand } from "@/commands";
import { type Settings, useSettingsStore } from "@/settings";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { MarkdownEditButtonContext, PluginContext } from "@/ui/context";
import classNames from "classnames";
import type React from "react";
import { Button } from "react-aria-components";

const getAddTaskCommandId = (settings: Settings): CommandId => {
  switch (settings.addTaskButtonAddsPageLink) {
    case "content":
      return "add-task-page-content";
    case "description":
      return "add-task-page-description";
    case "off":
      return "add-task";
  }
};

type Props = {
  title: string;
  isFetching: boolean;
  refresh: () => Promise<void>;
};

export const QueryHeader: React.FC<Props> = ({ title, isFetching, refresh }) => {
  const plugin = PluginContext.use();
  const { click: editBlock } = MarkdownEditButtonContext.use()();

  const settings = useSettingsStore();

  return (
    <div className="todoist-query-header">
      <span className="todoist-query-title">{title}</span>
      <div className="todoist-query-controls">
        <HeaderButton
          className="add-task"
          iconId="plus"
          action={() => fireCommand(getAddTaskCommandId(settings), plugin)}
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
