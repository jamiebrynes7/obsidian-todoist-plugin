import type React from "react";
import { useState } from "react";

import type { Task } from "@/data/task";
import { groupBy } from "@/data/transformations/grouping";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { QueryContext } from "@/ui/context";
import { ListDisplay } from "@/ui/query/displays/ListDisplay";

type Props = {
  tasks: Task[];
};

export const GroupedDisplay: React.FC<Props> = ({ tasks }) => {
  const query = QueryContext.use();
  const groups = groupBy(tasks, query.groupBy);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupHeader: string) => {
    setCollapsedGroups((prev) => {
      const newState = { ...prev };
      if (newState[groupHeader]) {
        delete newState[groupHeader];
      } else {
        newState[groupHeader] = true;
      }
      return newState;
    });
  };

  return (
    <>
      {groups.map((group) => {
        const isCollapsed = group.header in collapsedGroups;
        return (
          <div className="todoist-group" key={group.header}>
            {/* biome-ignore lint/a11y/useSemanticElements: Keeping as div to preserve CSS styling */}
            <div
              className={`todoist-group-title ${isCollapsed ? "collapsed" : ""}`}
              onClick={() => toggleGroup(group.header)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleGroup(group.header);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span>{group.header}</span>
              <ObsidianIcon
                size="s"
                id={isCollapsed ? "chevron-right" : "chevron-down"}
                className="todoist-group-collapse-icon"
              />
            </div>
            {!isCollapsed && <ListDisplay tasks={group.tasks} />}
          </div>
        );
      })}
    </>
  );
};
