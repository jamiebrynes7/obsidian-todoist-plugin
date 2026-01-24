import type React from "react";

import type { SubscriptionResult } from "@/data";
import type { TaskQuery } from "@/query/schema/tasks";
import { QueryContext } from "@/ui/context";
import { Displays } from "@/ui/query/displays";

type Props = {
  result: SubscriptionResult;
  query: TaskQuery;
};

export const QueryResponseHandler: React.FC<Props> = ({ result, query }) => {
  if (result.type === "error") {
    return <Displays.Error kind={result.kind} />;
  }

  if (result.type === "not-ready") {
    return <Displays.NotReady />;
  }

  const tasks = result.tasks;
  if (tasks.length === 0) {
    if (query.view?.hideNoTasks) {
      return null;
    }
    return <Displays.Empty message={query.view?.noTasksMessage} />;
  }

  if (query.groupBy !== undefined) {
    return (
      <QueryContext.Provider value={query}>
        <Displays.Grouped tasks={tasks} />
      </QueryContext.Provider>
    );
  }

  return (
    <QueryContext.Provider value={query}>
      <Displays.List tasks={tasks} />
    </QueryContext.Provider>
  );
};
