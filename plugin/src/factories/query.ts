import type { TaskQuery } from "@/query/schema/tasks";

export function makeQuery(opts?: Partial<TaskQuery>): TaskQuery {
  return {
    name: opts?.name,
    filter: opts?.filter ?? "",
    autorefresh: opts?.autorefresh,
    sorting: opts?.sorting,
    show: opts?.show,
    groupBy: opts?.groupBy,
    view: opts?.view,
  };
}
