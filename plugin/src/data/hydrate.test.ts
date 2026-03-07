import { describe, expect, it } from "vitest";

import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";
import { type DataAccessor, hydrate } from "@/data/hydrate";
import { Repository } from "@/data/repository";
import { makeApiTask, makeLabel, makeProject, makeSection } from "@/factories/data";

const makeDataAccessor = (opts?: {
  projects?: Project[];
  sections?: Section[];
  labels?: Label[];
}): DataAccessor => {
  const projects = new Repository<string, Project>();
  const sections = new Repository<string, Section>();
  const labels = new Repository<string, Label>();
  if (opts?.projects) {
    projects.applyDiff(opts.projects);
  }
  if (opts?.sections) {
    sections.applyDiff(opts.sections);
  }
  if (opts?.labels) {
    labels.applyDiff(opts.labels);
  }
  return { projects, sections, labels };
};

describe("hydrate", () => {
  it("should map API task fields correctly to internal Task", () => {
    const apiTask = makeApiTask({
      id: "task-42",
      addedAt: "2024-06-15T10:30:00Z",
      content: "Buy groceries",
      description: "Milk, eggs, bread",
      priority: 3,
      childOrder: 7,
      due: { isRecurring: false, date: "2024-06-20" },
      duration: { amount: 30, unit: "minute" },
      deadline: { date: "2024-06-25" },
    });

    const task = hydrate(apiTask, makeDataAccessor());

    expect(task.id).toBe("task-42");
    expect(task.createdAt).toBe("2024-06-15T10:30:00Z");
    expect(task.content).toBe("Buy groceries");
    expect(task.description).toBe("Milk, eggs, bread");
    expect(task.priority).toBe(3);
    expect(task.order).toBe(7);
    expect(task.due).toEqual({ isRecurring: false, date: "2024-06-20" });
    expect(task.duration).toEqual({ amount: 30, unit: "minute" });
    expect(task.deadline).toEqual({ date: "2024-06-25" });
  });

  it("should resolve project from repository by projectId", () => {
    const project = makeProject("project-1", { name: "My Project" });
    const data = makeDataAccessor({ projects: [project] });

    const task = hydrate(makeApiTask({ projectId: "project-1" }), data);

    expect(task.project).toEqual(project);
  });

  it("should fall back to Unknown Project when project not found", () => {
    const task = hydrate(makeApiTask({ projectId: "missing-project" }), makeDataAccessor());

    expect(task.project.name).toBe("Unknown Project");
    expect(task.project.id).toBe("missing-project");
  });

  it("should resolve section from repository by sectionId", () => {
    const section = makeSection("section-1", { name: "My Section" });
    const data = makeDataAccessor({ sections: [section] });

    const task = hydrate(makeApiTask({ sectionId: "section-1" }), data);

    expect(task.section).toEqual(section);
  });

  it("should fall back to Unknown Section when section not found", () => {
    const task = hydrate(makeApiTask({ sectionId: "missing-section" }), makeDataAccessor());

    expect(task.section?.name).toBe("Unknown Section");
    expect(task.section?.id).toBe("missing-section");
  });

  it("should set section to undefined when sectionId is null", () => {
    const task = hydrate(makeApiTask({ sectionId: null }), makeDataAccessor());

    expect(task.section).toBeUndefined();
  });

  it("should resolve labels by name from repository", () => {
    const label = makeLabel("label-1", { name: "urgent" });
    const data = makeDataAccessor({ labels: [label] });

    const task = hydrate(makeApiTask({ labels: ["urgent"] }), data);

    expect(task.labels).toEqual([label]);
  });

  it("should fall back to Unknown Label when label not found", () => {
    const task = hydrate(makeApiTask({ labels: ["nonexistent"] }), makeDataAccessor());

    expect(task.labels).toEqual([
      { id: "unknown-label", name: "Unknown Label", color: "grey", isDeleted: false },
    ]);
  });

  it("should resolve mixed labels (some found, some not)", () => {
    const label = makeLabel("label-1", { name: "urgent" });
    const data = makeDataAccessor({ labels: [label] });

    const task = hydrate(makeApiTask({ labels: ["urgent", "nonexistent"] }), data);

    expect(task.labels).toEqual([
      label,
      { id: "unknown-label", name: "Unknown Label", color: "grey", isDeleted: false },
    ]);
  });

  it("should map parentId correctly", () => {
    const task = hydrate(makeApiTask({ parentId: "parent-1" }), makeDataAccessor());

    expect(task.parentId).toBe("parent-1");
  });

  it("should map null parentId to undefined", () => {
    const task = hydrate(makeApiTask({ parentId: null }), makeDataAccessor());

    expect(task.parentId).toBeUndefined();
  });
});
