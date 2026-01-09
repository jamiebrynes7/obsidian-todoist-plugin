import { describe, expect, it } from "vitest";

import type { Task } from "@/data/task";
import { sortTasks } from "@/data/transformations/sorting";
import type { SortingKey } from "@/query/schema/sorting";

function makeTask(id: string, opts?: Partial<Task>): Task {
  return {
    id,
    createdAt: opts?.createdAt ?? "1970-01-01",
    parentId: opts?.parentId,
    content: opts?.content ?? "",
    description: "",
    labels: [],
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
  };
}

describe("sortTasks", () => {
  type Testcase = {
    description: string;
    input: Task[];
    sortingOpts: SortingKey[];
    expectedOutput: Task[];
  };

  const testcases: Testcase[] = [
    {
      description: "should not error for empty input",
      input: [],
      sortingOpts: ["priority"],
      expectedOutput: [],
    },
    {
      description: "can sort by priority",
      input: [
        makeTask("a", {
          priority: 2,
        }),
        makeTask("b", {
          priority: 1,
        }),
        makeTask("c", {
          priority: 4,
        }),
      ],
      sortingOpts: ["priority"],
      expectedOutput: [
        makeTask("c", {
          priority: 4,
        }),
        makeTask("a", {
          priority: 2,
        }),
        makeTask("b", {
          priority: 1,
        }),
      ],
    },
    {
      description: "can sort by priority descending",
      input: [
        makeTask("a", {
          priority: 2,
        }),
        makeTask("b", {
          priority: 1,
        }),
        makeTask("c", {
          priority: 4,
        }),
      ],
      sortingOpts: ["priorityAscending"],
      expectedOutput: [
        makeTask("b", {
          priority: 1,
        }),
        makeTask("a", {
          priority: 2,
        }),
        makeTask("c", {
          priority: 4,
        }),
      ],
    },
    {
      description: "can sort by Todoist order",
      input: [
        makeTask("a", {
          order: 2,
        }),
        makeTask("b", {
          order: 3,
        }),
        makeTask("c", {
          order: 1,
        }),
      ],
      sortingOpts: ["order"],
      expectedOutput: [
        makeTask("c", {
          order: 1,
        }),
        makeTask("a", {
          order: 2,
        }),
        makeTask("b", {
          order: 3,
        }),
      ],
    },
    {
      description: "can sort by date (ascending)",
      input: [
        makeTask("a"),
        makeTask("b", {
          due: {
            isRecurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("c", {
          due: {
            isRecurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("d", {
          due: {
            isRecurring: false,
            date: "2020-03-15T15:00:00",
          },
        }),
        makeTask("e", {
          due: {
            isRecurring: false,
            date: "2020-03-15T13:00:00",
          },
        }),
      ],
      sortingOpts: ["dateAscending"],
      expectedOutput: [
        makeTask("e", {
          due: {
            isRecurring: false,
            date: "2020-03-15T13:00:00",
          },
        }),
        makeTask("d", {
          due: {
            isRecurring: false,
            date: "2020-03-15T15:00:00",
          },
        }),
        makeTask("c", {
          due: {
            isRecurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("b", {
          due: {
            isRecurring: false,
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
            isRecurring: false,
            date: "2020-03-15T13:00:00",
          },
        }),
        makeTask("d", {
          due: {
            isRecurring: false,
            date: "2020-03-15T15:00:00",
          },
        }),
        makeTask("c", {
          due: {
            isRecurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("b", {
          due: {
            isRecurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("a"),
      ],
      sortingOpts: ["dateDescending"],
      expectedOutput: [
        makeTask("a"),
        makeTask("b", {
          due: {
            isRecurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("c", {
          due: {
            isRecurring: false,
            date: "2020-03-15",
          },
        }),
        makeTask("d", {
          due: {
            isRecurring: false,
            date: "2020-03-15T15:00:00",
          },
        }),
        makeTask("e", {
          due: {
            isRecurring: false,
            date: "2020-03-15T13:00:00",
          },
        }),
      ],
    },
    {
      description: "can sort by dateAdded",
      input: [
        makeTask("a", {
          createdAt: "2020-03-03T13:00:00Z",
        }),
        makeTask("b", {
          createdAt: "2020-03-02T11:00:00Z",
        }),
        makeTask("c", {
          createdAt: "2020-03-02T12:00:00Z",
        }),
      ],
      sortingOpts: ["dateAddedAscending"],
      expectedOutput: [
        makeTask("b", {
          createdAt: "2020-03-02T11:00:00Z",
        }),
        makeTask("c", {
          createdAt: "2020-03-02T12:00:00Z",
        }),
        makeTask("a", {
          createdAt: "2020-03-03T13:00:00Z",
        }),
      ],
    },
    {
      description: "can sort by dateAddedDescending",
      input: [
        makeTask("a", {
          createdAt: "2020-03-02T11:00:00Z",
        }),
        makeTask("b", {
          createdAt: "2020-03-03T13:00:00Z",
        }),
        makeTask("c", {
          createdAt: "2020-03-02T12:00:00Z",
        }),
      ],
      sortingOpts: ["dateAddedDescending"],
      expectedOutput: [
        makeTask("b", {
          createdAt: "2020-03-03T13:00:00Z",
        }),
        makeTask("c", {
          createdAt: "2020-03-02T12:00:00Z",
        }),
        makeTask("a", {
          createdAt: "2020-03-02T11:00:00Z",
        }),
      ],
    },
    {
      description: "will sort using specified parameters in order",
      input: [
        makeTask("a", {
          priority: 2,
          due: {
            isRecurring: false,
            date: "2020-03-20",
          },
        }),
        makeTask("b", {
          priority: 2,
          due: {
            isRecurring: false,
            date: "2020-03-19",
          },
        }),
        makeTask("c", {
          priority: 3,
          due: {
            isRecurring: false,
            date: "2020-03-25",
          },
        }),
      ],
      sortingOpts: ["priority", "dateAscending"],
      expectedOutput: [
        makeTask("c", {
          priority: 3,
          due: {
            isRecurring: false,
            date: "2020-03-25",
          },
        }),
        makeTask("b", {
          priority: 2,
          due: {
            isRecurring: false,
            date: "2020-03-19",
          },
        }),
        makeTask("a", {
          priority: 2,
          due: {
            isRecurring: false,
            date: "2020-03-20",
          },
        }),
      ],
    },
    {
      description: "can sort alphabetically (ascending)",
      input: [
        makeTask("a", { content: "zebra" }),
        makeTask("b", { content: "apple" }),
        makeTask("c", { content: "Banana" }),
        makeTask("d", { content: "cherry" }),
      ],
      sortingOpts: ["alphabeticalAscending"],
      expectedOutput: [
        makeTask("b", { content: "apple" }),
        makeTask("c", { content: "Banana" }),
        makeTask("d", { content: "cherry" }),
        makeTask("a", { content: "zebra" }),
      ],
    },
    {
      description: "can sort alphabetically descending",
      input: [
        makeTask("a", { content: "apple" }),
        makeTask("b", { content: "Banana" }),
        makeTask("c", { content: "zebra" }),
      ],
      sortingOpts: ["alphabeticalDescending"],
      expectedOutput: [
        makeTask("c", { content: "zebra" }),
        makeTask("b", { content: "Banana" }),
        makeTask("a", { content: "apple" }),
      ],
    },
    {
      description: "alphabetical sort is case-insensitive",
      input: [
        makeTask("a", { content: "APPLE" }),
        makeTask("b", { content: "banana" }),
        makeTask("c", { content: "Apple" }),
        makeTask("d", { content: "BANANA" }),
      ],
      sortingOpts: ["alphabeticalAscending"],
      expectedOutput: [
        makeTask("a", { content: "APPLE" }),
        makeTask("c", { content: "Apple" }),
        makeTask("b", { content: "banana" }),
        makeTask("d", { content: "BANANA" }),
      ],
    },
    {
      description: "alphabetical sort handles special characters",
      input: [
        makeTask("a", { content: "2. Second task" }),
        makeTask("b", { content: "1. First task" }),
        makeTask("c", { content: "@mention task" }),
        makeTask("d", { content: "#hashtag task" }),
      ],
      sortingOpts: ["alphabeticalAscending"],
      expectedOutput: [
        makeTask("c", { content: "@mention task" }),
        makeTask("d", { content: "#hashtag task" }),
        makeTask("b", { content: "1. First task" }),
        makeTask("a", { content: "2. Second task" }),
      ],
    },
    {
      description: "alphabetical sort handles empty strings",
      input: [
        makeTask("a", { content: "" }),
        makeTask("b", { content: "apple" }),
        makeTask("c", { content: "" }),
      ],
      sortingOpts: ["alphabeticalAscending"],
      expectedOutput: [
        makeTask("a", { content: "" }),
        makeTask("c", { content: "" }),
        makeTask("b", { content: "apple" }),
      ],
    },
    {
      description: "can combine alphabetical sort with priority sorting",
      input: [
        makeTask("a", { content: "Task B", priority: 2 }),
        makeTask("b", { content: "Task A", priority: 2 }),
        makeTask("c", { content: "Task C", priority: 3 }),
      ],
      sortingOpts: ["priority", "alphabeticalAscending"],
      expectedOutput: [
        makeTask("c", { content: "Task C", priority: 3 }),
        makeTask("b", { content: "Task A", priority: 2 }),
        makeTask("a", { content: "Task B", priority: 2 }),
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
