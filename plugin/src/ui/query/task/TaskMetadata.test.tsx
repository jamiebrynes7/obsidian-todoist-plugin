import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeLabel, makeSection, makeTask } from "@/factories/data";
import { makeQuery } from "@/factories/query";
import { makeSettings } from "@/factories/settings";
import type { ShowMetadataKey } from "@/query/schema/show";

import { TaskMetadata } from "./TaskMetadata";

const showOnly = (...keys: ShowMetadataKey[]) =>
  makeQuery({ show: new Set<ShowMetadataKey>(keys) });

describe("TaskMetadata", () => {
  describe("project metadata", () => {
    it("should render project name when show includes 'project'", () => {
      const task = makeTask("1", {
        project: {
          id: "p1",
          name: "My Project",
          childOrder: 1,
          parentId: null,
          inboxProject: false,
          color: "grey",
          isDeleted: false,
          isArchived: false,
        },
      });

      render(<TaskMetadata query={showOnly("project")} task={task} settings={makeSettings()} />);

      expect(screen.getByText("My Project")).toBeInTheDocument();
    });

    it("should render 'project / section' when task has section and show includes 'project'", () => {
      const task = makeTask("1", {
        project: {
          id: "p1",
          name: "Work",
          childOrder: 1,
          parentId: null,
          inboxProject: false,
          color: "grey",
          isDeleted: false,
          isArchived: false,
        },
        section: makeSection("s1", { name: "Backend" }),
      });

      render(<TaskMetadata query={showOnly("project")} task={task} settings={makeSettings()} />);

      expect(screen.getByText("Work / Backend")).toBeInTheDocument();
    });

    it("should set data-project-color attribute", () => {
      const task = makeTask("1", {
        project: {
          id: "p1",
          name: "Colored",
          childOrder: 1,
          parentId: null,
          inboxProject: false,
          color: "berry_red",
          isDeleted: false,
          isArchived: false,
        },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("project")} task={task} settings={makeSettings()} />,
      );

      const projectItem = container.querySelector("[data-task-metadata-kind='project']");
      expect(projectItem).toHaveAttribute("data-project-color", "berry-red");
    });
  });

  describe("section metadata", () => {
    it("should render section alone when show has 'section' but not 'project'", () => {
      const task = makeTask("1", {
        section: makeSection("s1", { name: "Frontend" }),
      });

      render(<TaskMetadata query={showOnly("section")} task={task} settings={makeSettings()} />);

      expect(screen.getByText("Frontend")).toBeInTheDocument();
    });

    it("should hide section when show has both 'project' and 'section'", () => {
      const task = makeTask("1", {
        section: makeSection("s1", { name: "Hidden Section" }),
      });

      render(
        <TaskMetadata
          query={showOnly("project", "section")}
          task={task}
          settings={makeSettings()}
        />,
      );

      expect(screen.getByText("Foobar / Hidden Section")).toBeInTheDocument();
      const sectionItems = document.querySelectorAll("[data-task-metadata-kind='section']");
      expect(sectionItems).toHaveLength(0);
    });
  });

  describe("due date metadata", () => {
    it("should render due date when show includes 'due' and task has due", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15", isRecurring: false },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("due")} task={task} settings={makeSettings()} />,
      );

      const dueItem = container.querySelector("[data-task-metadata-kind='due']");
      expect(dueItem).toBeInTheDocument();
    });

    it("should render recurring icon when due is recurring", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15", isRecurring: true },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("due")} task={task} settings={makeSettings()} />,
      );

      const dueItem = container.querySelector("[data-task-metadata-kind='due']");
      expect(dueItem).toBeInTheDocument();
      // Recurring due dates have 2 icons: calendar (before) + refresh-cw (after)
      const icons = dueItem?.querySelectorAll(".obsidian-icon");
      expect(icons).toHaveLength(2);
    });

    it("should not render recurring icon when due is not recurring", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15", isRecurring: false },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("due")} task={task} settings={makeSettings()} />,
      );

      const dueItem = container.querySelector("[data-task-metadata-kind='due']");
      expect(dueItem).toBeInTheDocument();
      // Non-recurring due dates only have 1 icon: calendar (before)
      const icons = dueItem?.querySelectorAll(".obsidian-icon");
      expect(icons).toHaveLength(1);
    });
  });

  describe("deadline metadata", () => {
    it("should render deadline when show includes 'deadline' and task has deadline", () => {
      const task = makeTask("1", {
        deadline: { date: "2025-03-01" },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("deadline")} task={task} settings={makeSettings()} />,
      );

      const deadlineItem = container.querySelector("[data-task-metadata-kind='deadline']");
      expect(deadlineItem).toBeInTheDocument();
    });

    it("should not render deadline when task has no deadline", () => {
      const task = makeTask("1");

      const { container } = render(
        <TaskMetadata query={showOnly("deadline")} task={task} settings={makeSettings()} />,
      );

      const deadlineItem = container.querySelector("[data-task-metadata-kind='deadline']");
      expect(deadlineItem).toBeNull();
    });
  });

  describe("time metadata", () => {
    it("should render time when 'time' is shown but 'due' is not, and task has due with time", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15T10:30:00", isRecurring: false },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("time")} task={task} settings={makeSettings()} />,
      );

      const timeItem = container.querySelector("[data-task-metadata-kind='time']");
      expect(timeItem).toBeInTheDocument();
    });

    it("should not render time when 'due' is also shown", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15T10:30:00", isRecurring: false },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("due", "time")} task={task} settings={makeSettings()} />,
      );

      const timeItem = container.querySelector("[data-task-metadata-kind='time']");
      expect(timeItem).toBeNull();
    });

    it("should not render time when due has no time component", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15", isRecurring: false },
      });

      const { container } = render(
        <TaskMetadata query={showOnly("time")} task={task} settings={makeSettings()} />,
      );

      const timeItem = container.querySelector("[data-task-metadata-kind='time']");
      expect(timeItem).toBeNull();
    });
  });

  describe("labels metadata", () => {
    it("should render labels when show includes 'labels' and task has labels", () => {
      const task = makeTask("1", {
        labels: [makeLabel("l1", { name: "urgent" }), makeLabel("l2", { name: "bug" })],
      });

      render(<TaskMetadata query={showOnly("labels")} task={task} settings={makeSettings()} />);

      expect(screen.getByText("urgent")).toBeInTheDocument();
      expect(screen.getByText("bug")).toBeInTheDocument();
    });

    it("should set data-label-color attribute", () => {
      const task = makeTask("1", {
        labels: [makeLabel("l1", { name: "test", color: "olive_green" })],
      });

      const { container } = render(
        <TaskMetadata query={showOnly("labels")} task={task} settings={makeSettings()} />,
      );

      const labelItem = container.querySelector("[data-task-metadata-kind='labels']");
      expect(labelItem).toHaveAttribute("data-label-color", "olive-green");
    });
  });

  describe("icon settings", () => {
    it("should hide project icon when renderProjectIcon is false", () => {
      const task = makeTask("1");

      const { container } = render(
        <TaskMetadata
          query={showOnly("project")}
          task={task}
          settings={makeSettings({ renderProjectIcon: false })}
        />,
      );

      const projectItem = container.querySelector("[data-task-metadata-kind='project']");
      expect(projectItem).toBeInTheDocument();
      const icons = projectItem?.querySelectorAll(".obsidian-icon");
      expect(icons).toHaveLength(0);
    });

    it("should render project icon when renderProjectIcon is true", () => {
      const task = makeTask("1");

      const { container } = render(
        <TaskMetadata
          query={showOnly("project")}
          task={task}
          settings={makeSettings({ renderProjectIcon: true })}
        />,
      );

      const projectItem = container.querySelector("[data-task-metadata-kind='project']");
      expect(projectItem).toBeInTheDocument();
      const icons = projectItem?.querySelectorAll(".obsidian-icon");
      expect(icons?.length).toBeGreaterThan(0);
    });

    it("should hide date icon when renderDateIcon is false", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15", isRecurring: false },
      });

      const { container } = render(
        <TaskMetadata
          query={showOnly("due")}
          task={task}
          settings={makeSettings({ renderDateIcon: false })}
        />,
      );

      const dueItem = container.querySelector("[data-task-metadata-kind='due']");
      expect(dueItem).toBeInTheDocument();
      const icons = dueItem?.querySelectorAll(".obsidian-icon");
      expect(icons).toHaveLength(0);
    });

    it("should hide deadline icon when renderDateIcon is false", () => {
      const task = makeTask("1", {
        deadline: { date: "2025-03-01" },
      });

      const { container } = render(
        <TaskMetadata
          query={showOnly("deadline")}
          task={task}
          settings={makeSettings({ renderDateIcon: false })}
        />,
      );

      const deadlineItem = container.querySelector("[data-task-metadata-kind='deadline']");
      expect(deadlineItem).toBeInTheDocument();
      const icons = deadlineItem?.querySelectorAll(".obsidian-icon");
      expect(icons).toHaveLength(0);
    });

    it("should hide labels icon when renderLabelsIcon is false", () => {
      const task = makeTask("1", {
        labels: [makeLabel("l1", { name: "test" })],
      });

      const { container } = render(
        <TaskMetadata
          query={showOnly("labels")}
          task={task}
          settings={makeSettings({ renderLabelsIcon: false })}
        />,
      );

      const labelItems = container.querySelectorAll("[data-task-metadata-kind='labels']");
      expect(labelItems.length).toBeGreaterThan(0);
      const icons = labelItems[0]?.querySelectorAll(".obsidian-icon");
      expect(icons).toHaveLength(0);
    });
  });

  describe("default show set", () => {
    it("should render default metadata when query.show is undefined", () => {
      const task = makeTask("1", {
        due: { date: "2025-01-15", isRecurring: false },
        labels: [makeLabel("l1", { name: "important" })],
        deadline: { date: "2025-02-01" },
      });

      const { container } = render(
        <TaskMetadata query={makeQuery()} task={task} settings={makeSettings()} />,
      );

      // Default show set is ["project", "due", "description", "labels", "deadline"]
      expect(container.querySelector("[data-task-metadata-kind='project']")).toBeInTheDocument();
      expect(container.querySelector("[data-task-metadata-kind='due']")).toBeInTheDocument();
      expect(container.querySelector("[data-task-metadata-kind='labels']")).toBeInTheDocument();
      expect(container.querySelector("[data-task-metadata-kind='deadline']")).toBeInTheDocument();
    });
  });
});
