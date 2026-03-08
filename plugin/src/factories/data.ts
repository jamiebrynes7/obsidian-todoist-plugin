import type { DueDate } from "@/api/domain/dueDate";
import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";
import type { Task as ApiTask } from "@/api/domain/task";
import type { Task } from "@/data/task";

export function makeTask(id: string, opts?: Partial<Task>): Task {
  return {
    id,
    createdAt: opts?.createdAt ?? "1970-01-01",
    parentId: opts?.parentId,
    content: opts?.content ?? "",
    description: "",
    labels: opts?.labels ?? [],
    priority: opts?.priority ?? 1,
    order: opts?.order ?? 0,

    project: opts?.project ?? {
      id: "foobar",
      name: "Foobar",
      childOrder: 1,
      parentId: null,
      inboxProject: false,
      color: "grey",
      isDeleted: false,
      isArchived: false,
    },
    section: opts?.section,

    due: opts?.due,
    duration: opts?.duration,
    deadline: opts?.deadline,
  };
}

export function makeProject(id: string, opts?: Partial<Project>): Project {
  return {
    id,
    parentId: opts?.parentId ?? null,
    name: opts?.name ?? "Project",
    childOrder: opts?.childOrder ?? 1,
    inboxProject: false,
    color: "grey",
    isDeleted: false,
    isArchived: false,
  };
}

export function makeSection(id: string, opts?: Partial<Section>): Section {
  return {
    id,
    projectId: opts?.projectId ?? "project-1",
    name: opts?.name ?? "Section",
    sectionOrder: opts?.sectionOrder ?? 1,
    isDeleted: false,
    isArchived: false,
  };
}

export function makeLabel(id: string, opts?: Partial<Label>): Label {
  return {
    id,
    name: opts?.name ?? id,
    color: opts?.color ?? "grey",
    isDeleted: false,
  };
}

export function makeDueDate(date: string): DueDate {
  return {
    isRecurring: false,
    date,
  };
}

export const makeApiTask = (overrides?: Partial<ApiTask>): ApiTask => ({
  id: "task-1",
  addedAt: "2024-01-01T00:00:00Z",
  content: "Test task",
  description: "A test description",
  projectId: "project-1",
  sectionId: null,
  parentId: null,
  labels: [],
  priority: 1,
  due: null,
  duration: null,
  deadline: null,
  childOrder: 5,
  ...overrides,
});

export const makeDate = (
  year: number,
  month: number,
  day: number,
  hours?: number,
  minutes?: number,
): Date => new Date(Date.UTC(year, month, day, hours ?? 0, minutes ?? 0));
