import type { Task } from "@/data/task";
import { groupBy } from "@/data/transformations/grouping";
import { QueryContext } from "@/ui/context";
import { ListDisplay } from "@/ui/query/displays/ListDisplay";
import type React from "react";

type Props = {
  tasks: Task[];
};

export const GroupedDisplay: React.FC<Props> = ({ tasks }) => {
  const query = QueryContext.use();
  const groups = groupBy(tasks, query.groupBy);

  return (
    <>
      {groups.map((group) => (
        <div className="todoist-group" key={group.header}>
          <div className="todoist-group-title">{group.header}</div>
          <ListDisplay tasks={group.tasks} />
        </div>
      ))}
    </>
  );
};
