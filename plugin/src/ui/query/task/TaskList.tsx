import { AnimatePresence } from "motion/react";
import type React from "react";

import type { TaskTree } from "@/data/transformations/relationships";
import { Task } from "@/ui/query/task/Task";

type Props = {
  trees: TaskTree[];
};

export const TaskList: React.FC<Props> = ({ trees }) => {
  return (
    <div className="todoist-tasks-list">
      <AnimatePresence>
        {trees.map((tree) => (
          <Task key={tree.id} tree={tree} />
        ))}
      </AnimatePresence>
    </div>
  );
};
