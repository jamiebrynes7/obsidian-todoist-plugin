import { describe, expect, it } from "vitest";
import { SortingVariant } from "../../query/query";
import type { Task } from "../task";
import { sortTasks } from "./sorting";

function makeTask(id: string, opts?: Partial<Task>): Task {
  return {
    id,
    createdAt: opts?.createdAt ?? "1970-01-01",
    parentId: opts?.parentId,
    content: "",
    description: "",
    labels: [],
    priority: opts?.priority ?? 1,
    order: opts?.order ?? 0,

    project: opts?.project ?? {
      id: "foobar",
      name: "Foobar",
      order: 1,
      parentId: null,
      isInboxProject: false,
    },
    section: opts?.section,

    due: opts?.due,
  };
}

describe("sortTasks", () => {
  type Testcase = {
    description: string;
    input: Task[];
    sortingOpts: SortingVariant[];
    expectedOutput: Task[];
  };

  const testcases: Testcase[] = [
    {
      description: "should not error for empty input",
      input: [],
      sortingOpts: [SortingVariant.Priority],
      expectedOutput: [],
    },
    {
      description: "can sort by priority",
      input: [
        makeTask("a", { priority: 2 }),
        makeTask("b", { priority: 1 }),
        makeTask("c", { priority: 4 }),
      ],
      sortingOpts: [SortingVariant.Priority],
      expectedOutput: [
        makeTask("c", { priority: 4 }),
        makeTask("a", { priority: 2 }),
        makeTask("b", { priority: 1 }),
      ],
    },
    {
      description: "can sort by priority descending",
      input: [
        makeTask("a", { priority: 2 }),
        makeTask("b", { priority: 1 }),
        makeTask("c", { priority: 4 }),
      ],
      sortingOpts: [SortingVariant.PriorityDescending],
      expectedOutput: [
        makeTask("b", { priority: 1 }),
        makeTask("a", { priority: 2 }),
        makeTask("c", { priority: 4 }),
      ],
    },
    {
      description: "can sort by Todoist order",
      input: [
        makeTask("a", { order: 2 }),
        makeTask("b", { order: 3 }),
        makeTask("c", { order: 1 }),
      ],
      sortingOpts: [SortingVariant.Order],
      expectedOutput: [
        makeTask("c", { order: 1 }),
        makeTask("a", { order: 2 }),
        makeTask("b", { order: 3 }),
      ],
    },
    {
      description: "can sort by date (ascending)",
      input: [
        makeTask("a"),
        makeTask("b", {
          due: {
            recurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00",
          },
        }),
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00",
          },
        }),
      ],
      sortingOpts: [SortingVariant.Date],
      expectedOutput: [
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00",
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00",
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("b", {
          due: {
            recurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("a"),
      ],
    },
    {
      description: "can sort by date (descending)",
      input: [
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00",
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00",
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("b", {
          due: {
            recurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("a"),
      ],
      sortingOpts: [SortingVariant.DateDescending],
      expectedOutput: [
        makeTask("a"),
        makeTask("b", {
          due: {
            recurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00",
          },
        }),
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00",
          },
        }),
      ],
    },
    {
      description: "can sort by dateAdded",
      input: [
        makeTask("a", { createdAt: "2020-03-03T13:00:00" }),
        makeTask("b", { createdAt: "2020-03-02T11:00:00" }),
        makeTask("c", { createdAt: "2020-03-02T12:00:00" }),
      ],
      sortingOpts: [SortingVariant.DateAdded],
      expectedOutput: [
        makeTask("b", { createdAt: "2020-03-02T11:00:00" }),
        makeTask("c", { createdAt: "2020-03-02T12:00:00" }),
        makeTask("a", { createdAt: "2020-03-03T13:00:00" }),
      ],
    },
    {
      description: "can sort by dateAddedDescending",
      input: [
        makeTask("a", { createdAt: "2020-03-02T11:00:00" }),
        makeTask("b", { createdAt: "2020-03-03T13:00:00" }),
        makeTask("c", { createdAt: "2020-03-02T12:00:00" }),
      ],
      sortingOpts: [SortingVariant.DateAddedDescending],
      expectedOutput: [
        makeTask("b", { createdAt: "2020-03-03T13:00:00" }),
        makeTask("c", { createdAt: "2020-03-02T12:00:00" }),
        makeTask("a", { createdAt: "2020-03-02T11:00:00" }),
      ],
    },
    {
      description: "will sort using specified parameters in order",
      input: [
        makeTask("a", { priority: 2, due: { recurring: false, date: "2020-03-20" } }),
        makeTask("b", { priority: 2, due: { recurring: false, date: "2020-03-19" } }),
        makeTask("c", { priority: 3, due: { recurring: false, date: "2020-03-25" } }),
      ],
      sortingOpts: [SortingVariant.Priority, SortingVariant.Date],
      expectedOutput: [
        makeTask("c", { priority: 3, due: { recurring: false, date: "2020-03-25" } }),
        makeTask("b", { priority: 2, due: { recurring: false, date: "2020-03-19" } }),
        makeTask("a", { priority: 2, due: { recurring: false, date: "2020-03-20" } }),
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const cloned = [...tc.input];
      sortTasks(cloned, tc.sortingOpts);

      expect(cloned).toStrictEqual(tc.expectedOutput);
    });
  }
});
