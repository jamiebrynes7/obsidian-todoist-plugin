import type { TaskId } from "@/api/domain/task";
import type { Task } from "@/data/task";

export type TaskTree = Task & { children: TaskTree[] };

// Builds a task tree, preserving the sorting order.
export function buildTaskTree(tasks: Task[]): TaskTree[] {
  const mapping = new Map<TaskId, TaskTree>();
  const roots: TaskId[] = [];

  for (const task of tasks) {
    mapping.set(task.id, { ...task, children: [] });
  }

  for (const task of tasks) {
    if (task.parentId === undefined || !mapping.has(task.parentId)) {
      roots.push(task.id);
      continue;
    }

    const parent = mapping.get(task.parentId);
    if (parent !== undefined) {
      const child = mapping.get(task.id);
      if (child === undefined) {
        throw Error("Expected to find task in map");
      }
      parent.children.push(child);
    }
  }

  return roots.map((id) => {
    const tree = mapping.get(id);
    if (tree === undefined) {
      throw Error("Expected to find task in map");
    }
    return tree;
  });
}
