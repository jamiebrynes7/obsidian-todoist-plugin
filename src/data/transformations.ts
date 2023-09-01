import { getDueDateInfo } from "../api/domain/dueDate";
import type { Project } from "../api/domain/project";
import type { TaskId } from "../api/domain/task";
import type { Task } from "./task";

export type GroupedTasks = {
    project: Project,
    tasks: Task[],
};

const UnknownProject: Project = {
    id: "unknown-project-fake",
    parentId: null,
    name: "Unknown Project",
    order: Number.MAX_SAFE_INTEGER,
};

export function groupByProject(tasks: Task[]): GroupedTasks[] {
    const projects = new Map<Project, Task[]>();

    for (const task of tasks) {
        const project = task.project ?? UnknownProject;

        if (!projects.has(project)) {
            projects.set(project, []);
        }

        const tasks = projects.get(project);
        tasks.push(task);
    }

    return Array.from(projects.entries()).map(([project, tasks]) => { return { project: project, tasks: tasks }; })
}

export type Sort = "priority" | "date" | "dateAscending" | "dateDescending" | "order";

export function sortTasks<T extends Task>(tasks: T[], sort: Sort[]) {
    tasks.sort((first, second) => {
        for (const sorting of sort) {
            const cmp = compareTask(first, second, sorting);
            if (cmp == 0) {
                continue;
            }

            return cmp;
        }

        return 0;
    })
}


// Result of "LT zero" means that self is before other,
// Result of '0' means that they are equal
// Result of "GT zero" means that self is after other
function compareTask<T extends Task>(self: T, other: T, sorting: Sort): number {
    switch (sorting) {
        case "priority":
            // Note that priority in the API is reversed to that of in the app.
            return other.priority - this.priority;
        case "date":
        case "dateAscending":
            return compareTaskDate(self, other);
        case "dateDescending":
            return -compareTaskDate(self, other);
        case "order":
            return self.order - other.order;
        default:
            throw new Error(`Unexpected sorting type: '${sorting}'`)
    }
}

function compareTaskDate<T extends Task>(self: T, other: T): number {
    // We will sort items using the following algorithm:
    // 1. Any items without a due date are always after those with.
    // 2. Any items on the same day, but without time are always sorted after those with time.

    const selfInfo = getDueDateInfo(self.due);
    const otherInfo = getDueDateInfo(other.due);

    // First lets check for presence of due date
    if (selfInfo.hasDate && !otherInfo.hasDate) {
        return -1;
    } else if (!selfInfo.hasDate && otherInfo.hasDate) {
        return 1;
    } else if (!selfInfo.hasDate && !otherInfo.hasDate) {
        return 0;
    }

    const selfDate = selfInfo.m;
    const otherDate = otherInfo.m;

    // Then lets check if we are the same day, if not
    // sort just based on the day.
    if (!selfDate.isSame(otherDate, "day")) {
        return selfDate.isBefore(otherDate, "day") ? -1 : 1;
    }

    if (selfInfo.hasTime && !otherInfo.hasTime) {
        return -1;
    } else if (!selfInfo.hasTime && otherInfo.hasTime) {
        return 1;
    } else if (!selfInfo.hasTime && !otherInfo.hasTime) {
        return 0;
    }

    return selfDate.isBefore(otherDate) ? -1 : 1;
}


export type TaskTree = Task & { children: TaskTree[] };

// Builds a task tree, preserving the sorting order.
export function buildTaskTree(tasks: Task[]): TaskTree[] {
    const mapping = new Map<TaskId, TaskTree>();
    const roots: TaskId[] = [];

    for (const task of tasks) {
        mapping.set(task.id, { ...task, children: [] });
    }

    for (const task of tasks) {
        if (task.parentId == undefined || !mapping.has(task.parentId)) {
            roots.push(task.id);
            continue;
        }

        const parent = mapping.get(task.parentId);
        const child = mapping.get(task.id);
        parent.children.push(child)
    }

    return roots.map(id => mapping.get(id));
}
