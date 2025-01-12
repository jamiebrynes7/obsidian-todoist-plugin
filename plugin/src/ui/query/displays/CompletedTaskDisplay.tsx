import type { Task } from "@/data/task";
import { CompletedTask } from "@/ui/query/task/CompletedTask";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";


type Props = {
  tasks: Task[];
};

export const CompletedTaskDisplay: React.FC<Props> = ({ tasks }) => {
  return (
    <div className="todoist-tasks-list">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            className="todoist-task-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <CompletedTask task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
