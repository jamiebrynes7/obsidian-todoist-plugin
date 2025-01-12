import type { Task } from "@/data/task";
import { ShowMetadataVariant } from "@/query/query";
import Markdown from "@/ui/components/markdown";
import { QueryContext } from "@/ui/context";
import type React from "react";

type Props = {
  task: Task;
};

export const CompletedTask: React.FC<Props> = ({ task }) => {
  const query = QueryContext.use();

  const shouldRenderDescription =
    query.show.has(ShowMetadataVariant.Description) && task.description !== "";

  return (
    <div className="todoist-task completed">
      <div className="todoist-task-content">
        <Markdown content={task.content} />
        {shouldRenderDescription && (
          <div className="todoist-task-description">
            <Markdown content={task.description} />
          </div>
        )}
      </div>
    </div>
  );
};
