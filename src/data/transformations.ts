import moment from "moment";
import { getDueDateInfo } from "../api/domain/dueDate";
import type { Project } from "../api/domain/project";
import type { TaskId } from "../api/domain/task";
import { SortingVariant } from "../query/query";
import type { Task } from "./task";

export const UnknownProject: Project = {
    id: "unknown-project-fake",
    parentId: null,
    name: "Unknown Project",
    order: Number.MAX_SAFE_INTEGER,
};

export type GroupedTasks = {
    project: Project,
    tasks: Task[],
};

export function groupByProject(tasks: Task[]): GroupedTasks[] {
    const projects = new Map<Project, Task[]>();

    for (const task of tasks) {
        const project = task.project ?? UnknownProject;

        if (!projects.has(project)) {
            projects.set(project, []);
        }

        const tasks = projects.get(project);
        tasks!.push(task);
    }

    return Array.from(projects.entries()).map(([project, tasks]) => { return { project: project, tasks: tasks }; })
}

export function sortTasks<T extends Task>(tasks: T[], sort: SortingVariant[]) {
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
function compareTask<T extends Task>(self: T, other: T, sorting: SortingVariant): number {
    switch (sorting) {
        case SortingVariant.Priority:
            // Note that priority in the API is reversed to that of in the app.
            return other.priority - self.priority;
        case SortingVariant.PriorityDescending:
            return self.priority - other.priority;
        case SortingVariant.Date:
            return compareTaskDate(self, other);
        case SortingVariant.DateDescending:
            return -compareTaskDate(self, other);
        case SortingVariant.Order:
            return self.order - other.order;
        case SortingVariant.DateAdded:
            return compareTaskDateAdded(self, other);
        case SortingVariant.DateAddedDescending:
            return -compareTaskDateAdded(self, other);
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

    const selfDate = selfInfo.m!;
    const otherDate = otherInfo.m!;

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

function compareTaskDateAdded<T extends Task>(self: T, other: T): number {
    const selfDate = moment(self.createdAt);
    const otherDate = moment(other.createdAt);

    if (selfDate === otherDate) {
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
        if (parent !== undefined) {
            const child = mapping.get(task.id);
            parent.children.push(child!)
        }
    }

    return roots.map(id => mapping.get(id)!);
}
