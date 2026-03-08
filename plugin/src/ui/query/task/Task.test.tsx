import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MarkdownRenderChild, Notice } from "obsidian";
import type React from "react";
import { describe, expect, it, vi } from "vitest";

import type { TaskTree } from "@/data/transformations/relationships";
import { makeDueDate, makeTask } from "@/factories/data";
import { makeQuery } from "@/factories/query";
import type { ShowMetadataKey } from "@/query/schema/show";
import type { TaskQuery } from "@/query/schema/tasks";
import { PluginContext, QueryContext, RenderChildContext } from "@/ui/context";

vi.mock("obsidian", async (importOriginal) => {
  const actual = await importOriginal<typeof import("obsidian")>();
  return {
    ...actual,
    Notice: vi.fn(),
  };
});

vi.mock("@/ui/query/task/TaskList", () => {
  return {
    TaskList: ({ trees }: { trees: Array<{ id: string; content: string }> }) => {
      return trees.map((tree) => (
        <div key={tree.id} data-testid={`child-task-${tree.id}`}>
          {tree.content}
        </div>
      ));
    },
  };
});

vi.mock("motion/react-m", async () => {
  const { default: ReactImport } = await import("react");
  const makeComponent = (tag: string) =>
    ReactImport.forwardRef((props: Record<string, unknown>, ref: unknown) => {
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        ...rest
      } = props;
      return ReactImport.createElement(tag, { ...rest, ref });
    });
  return { div: makeComponent("div"), span: makeComponent("span") };
});

// Must import after mock definition
const { Task } = await import("./Task");

const mockCloseTask = vi.fn();

const mockPlugin = {
  services: {
    todoist: {
      actions: {
        closeTask: mockCloseTask,
      },
    },
  },
} as unknown as ReturnType<typeof PluginContext.use>;

const makeTree = (id: string, opts?: Partial<TaskTree>): TaskTree => {
  const task = makeTask(id, opts);
  return {
    ...task,
    description: opts?.description ?? "",
    children: opts?.children ?? [],
  } as TaskTree;
};

const TaskWrapper: React.FC<{
  children: React.ReactNode;
  query?: TaskQuery;
}> = ({ children, query }) => {
  const renderChild = new MarkdownRenderChild(document.createElement("div"));
  return (
    <PluginContext.Provider value={mockPlugin}>
      <QueryContext.Provider value={query ?? makeQuery()}>
        <RenderChildContext.Provider value={renderChild}>{children}</RenderChildContext.Provider>
      </QueryContext.Provider>
    </PluginContext.Provider>
  );
};

describe("Task", () => {
  describe("content sanitization", () => {
    it("should render content unchanged when no special prefix", async () => {
      const tree = makeTree("1", { content: "Buy groceries" });

      render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Buy groceries")).toBeInTheDocument();
      });
    });

    it("should strip leading '*' from content", async () => {
      const tree = makeTree("1", { content: "*Important note" });

      render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Important note")).toBeInTheDocument();
      });
    });

    it("should escape leading '#' in content", async () => {
      const tree = makeTree("1", { content: "#hashtag" });

      render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("\\#hashtag")).toBeInTheDocument();
      });
    });

    it("should escape leading '-' in content", async () => {
      const tree = makeTree("1", { content: "- list item" });

      render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("\\- list item")).toBeInTheDocument();
      });
    });
  });

  describe("checkbox", () => {
    it("should be enabled for normal tasks", () => {
      const tree = makeTree("1", { content: "Normal task" });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const checkbox = container.querySelector("input[type='checkbox']");
      expect(checkbox).not.toBeDisabled();
    });

    it("should be disabled for tasks starting with '*'", () => {
      const tree = makeTree("1", { content: "* Section header" });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const checkbox = container.querySelector("input[type='checkbox']");
      expect(checkbox).toBeDisabled();
    });

    it("should call closeTask on click", async () => {
      mockCloseTask.mockResolvedValueOnce(undefined);
      const tree = makeTree("1", { content: "Task to close" });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const checkbox = container.querySelector("input[type='checkbox']");
      expect(checkbox).not.toBeNull();
      fireEvent.click(checkbox as HTMLElement);

      await waitFor(() => {
        expect(mockCloseTask).toHaveBeenCalledWith("1");
      });
    });

    it("should show notice on closeTask failure", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockCloseTask.mockRejectedValueOnce(new Error("network error"));
      const tree = makeTree("1", { content: "Task to close" });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const checkbox = container.querySelector("input[type='checkbox']");
      expect(checkbox).not.toBeNull();
      fireEvent.click(checkbox as HTMLElement);

      await waitFor(() => {
        expect(Notice).toHaveBeenCalledWith(expect.any(String), expect.any(Number));
      });

      vi.restoreAllMocks();
    });
  });

  describe("description", () => {
    it("should render description by default when show is undefined", async () => {
      const tree = makeTree("1", {
        content: "Task",
        description: "Default visible",
      });

      render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Default visible")).toBeInTheDocument();
      });
    });

    it("should render description when show includes 'description'", async () => {
      const tree = makeTree("1", {
        content: "Task",
        description: "Some details",
      });
      const query = makeQuery({
        show: new Set<ShowMetadataKey>(["description"]),
      });

      render(
        <TaskWrapper query={query}>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Some details")).toBeInTheDocument();
      });
    });

    it("should hide description when excluded from show", () => {
      const tree = makeTree("1", {
        content: "Task",
        description: "Hidden details",
      });
      const query = makeQuery({
        show: new Set<ShowMetadataKey>(["project"]),
      });

      const { container } = render(
        <TaskWrapper query={query}>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      expect(container.querySelector(".todoist-task-description")).not.toBeInTheDocument();
    });

    it("should hide description when description is empty", () => {
      const tree = makeTree("1", {
        content: "Task",
        description: "",
      });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      expect(container.querySelector(".todoist-task-description")).not.toBeInTheDocument();
    });
  });

  describe("data attributes", () => {
    it("should set data-priority attribute", () => {
      const tree = makeTree("1", { content: "High priority", priority: 4 });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const taskContainer = container.querySelector(".todoist-task-container");
      expect(taskContainer).toHaveAttribute("data-priority", "4");
    });

    it("should omit data-due-metadata when no due date", () => {
      const tree = makeTree("1", { content: "No due" });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const taskContainer = container.querySelector(".todoist-task-container");
      expect(taskContainer).not.toHaveAttribute("data-due-metadata");
    });

    it("should set data-due-metadata to 'today' for task due today", () => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const tree = makeTree("1", {
        content: "Due today",
        due: makeDueDate(dateStr),
      });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const taskContainer = container.querySelector(".todoist-task-container");
      expect(taskContainer).toHaveAttribute("data-due-metadata", "today");
    });

    it("should set data-due-metadata to 'overdue' for past due task", () => {
      const tree = makeTree("1", {
        content: "Overdue task",
        due: makeDueDate("2020-01-01"),
      });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const taskContainer = container.querySelector(".todoist-task-container");
      expect(taskContainer).toHaveAttribute("data-due-metadata", "overdue");
    });

    it("should omit data-has-time when no due date", () => {
      const tree = makeTree("1", { content: "No due" });

      const { container } = render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      const taskContainer = container.querySelector(".todoist-task-container");
      expect(taskContainer).not.toHaveAttribute("data-has-time");
    });
  });

  describe("children", () => {
    it("should render child tasks", async () => {
      const child = makeTree("2", { content: "Child task" });
      const tree = makeTree("1", {
        content: "Parent task",
        children: [child],
      });

      render(
        <TaskWrapper>
          <Task tree={tree} />
        </TaskWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Parent task")).toBeInTheDocument();
        expect(screen.getByText("Child task")).toBeInTheDocument();
      });
    });
  });
});
