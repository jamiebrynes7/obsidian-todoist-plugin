import type { Task } from "@/data/task";
import { type TaskTree, buildTaskTree } from "@/data/transformations/relationships";
import { describe, expect, it } from "vitest";

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
      color: "grey",
    },
    section: opts?.section,

    due: opts?.due,
  };
}

describe("buildTaskTree", () => {
  type Testcase = {
    description: string;
    input: Task[];
    output: TaskTree[];
  };

  const testcases: Testcase[] = [
    {
      description: "tasks without children should have no children",
      input: [makeTask("a"), makeTask("b"), makeTask("c")],
      output: [
        { children: [], ...makeTask("a") },
        { children: [], ...makeTask("b") },
        { children: [], ...makeTask("c") },
      ],
    },
    {
      description: "tasks with children should be parented",
      input: [makeTask("a"), makeTask("b", { parentId: "a" }), makeTask("c")],
      output: [
        {
          ...makeTask("a"),
          children: [
            {
              ...makeTask("b", { parentId: "a" }),
              children: [],
            },
          ],
        },
        {
          ...makeTask("c"),
          children: [],
        },
      ],
    },
    {
      description: "tasks with unknown parent ID are part of root",
      input: [makeTask("b"), makeTask("a", { parentId: "c" })],
      output: [
        {
          ...makeTask("b"),
          children: [],
        },
        {
          ...makeTask("a", { parentId: "c" }),
          children: [],
        },
      ],
    },
    {
      description: "tasks will be nested deeply",
      input: [makeTask("a", { parentId: "c" }), makeTask("b", { parentId: "a" }), makeTask("c")],
      output: [
        {
          ...makeTask("c"),
          children: [
            {
              ...makeTask("a", { parentId: "c" }),
              children: [
                {
                  ...makeTask("b", { parentId: "a" }),
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const trees = buildTaskTree(tc.input);
      expect(trees).toStrictEqual(tc.output);
    });
  }
});
