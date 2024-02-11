import type { Task } from "./task";
import type { Project } from "../api/domain/project";
import { UnknownProject, groupByProject, type GroupedTasks, sortTasks, type TaskTree, buildTaskTree } from "./transformations";
import { SortingVariant } from "../query/query";
import { expect, describe, it } from "vitest";

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

    project: opts?.project,
    section: opts?.section,

    due: opts?.due
  }
}

function makeProject(name: string, order: number): Project {
  return {
    id: name,
    parentId: null,
    name,
    order,
  };
}

describe("groupByProject", () => {
  const projectOne = makeProject("Project One", 1);
  const projectTwo = makeProject("Project Two", 2);

  type Testcase = {
    description: string,
    input: Task[],
    expected: GroupedTasks[],
  };

  const testcases: Testcase[] = [
    {
      description: "should return empty array if no tasks",
      input: [],
      expected: [],
    },
    {
      description: "should collect tasks into distinct projects",
      input: [
        makeTask("a", { project: projectOne }),
        makeTask("b", { project: projectOne }),
        makeTask("c", { project: projectTwo }),
        makeTask("d", { project: projectTwo }),
      ],
      expected: [
        {
          project: projectOne,
          tasks: [
            makeTask("a", { project: projectOne }),
            makeTask("b", { project: projectOne }),
          ]
        },
        {
          project: projectTwo,
          tasks: [
            makeTask("c", { project: projectTwo }),
            makeTask("d", { project: projectTwo }),
          ]
        },
      ]
    },
    {
      description: "should use unknown project if project is undefined",
      input: [
        makeTask("a"),
        makeTask("b"),
        makeTask("c", { project: projectOne }),
      ],
      expected: [
        {
          project: projectOne,
          tasks: [makeTask("c", { project: projectOne })]
        },
        {
          project: UnknownProject,
          tasks: [makeTask("a"), makeTask("b")]
        }
      ],
    }
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const grouped = groupByProject(tc.input);
      // Sort to make comparisons easier to reason about
      grouped.sort((a, b) => a.project.order - b.project.order);

      expect(grouped).toStrictEqual(tc.expected);
    });
  }
});

describe("sortTasks", () => {
  type Testcase = {
    description: string,
    input: Task[],
    sortingOpts: SortingVariant[],
    expectedOutput: Task[],
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
      ]
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
      ]
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
            date: "2020-03-20"
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15"
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00"
          },
        }),
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00"
          },
        }),
      ],
      sortingOpts: [SortingVariant.Date],
      expectedOutput: [
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00"
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00"
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15"
          },
        }),
        makeTask("b", {
          due: {
            recurring: false,
            date: "2020-03-20"
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
            datetime: "2020-03-15T13:00:00"
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00"
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15"
          },
        }),
        makeTask("b", {
          due: {
            recurring: false,
            date: "2020-03-20"
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
            date: "2020-03-20"
          },
        }),
        makeTask("c", {
          due: {
            recurring: false,
            date: "2020-03-15"
          },
        }),
        makeTask("d", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T15:00:00"
          },
        }),
        makeTask("e", {
          due: {
            recurring: false,
            date: "2020-03-20",
            datetime: "2020-03-15T13:00:00"
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
    }
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const cloned = [...tc.input];
      sortTasks(cloned, tc.sortingOpts);

      expect(cloned).toStrictEqual(tc.expectedOutput);
    });
  }
});

describe("buildTaskTree", () => {
  type Testcase = {
    description: string,
    input: Task[],
    output: TaskTree[],
  }

  const testcases: Testcase[] = [
    {
      description: "tasks without children should have no children",
      input: [
        makeTask("a"),
        makeTask("b"),
        makeTask("c"),
      ],
      output: [
        { children: [], ...makeTask("a") },
        { children: [], ...makeTask("b") },
        { children: [], ...makeTask("c") },
      ],
    },
    {
      description: "tasks with children should be parented",
      input: [
        makeTask("a"),
        makeTask("b", { parentId: "a" }),
        makeTask("c"),
      ],
      output: [
        {
          ...makeTask("a"),
          children: [
            {
              ...makeTask("b", { parentId: "a" }),
              children: [],
            }
          ],

        },
        {
          ...makeTask("c"),
          children: [],
        }
      ]
    },
    {
      description: "tasks with unknown parent ID are part of root",
      input: [
        makeTask("b"),
        makeTask("a", { parentId: "c" }),
      ],
      output: [
        {
          ...makeTask("b"),
          children: [],
        },
        {
          ...makeTask("a", { parentId: "c" }),
          children: [],
        }
      ]
    },
    {
      description: "tasks will be nested deeply",
      input: [
        makeTask("a", { parentId: "c" }),
        makeTask("b", { parentId: "a" }),
        makeTask("c"),
      ],
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
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const trees = buildTaskTree(tc.input);
      expect(trees).toStrictEqual(tc.output);
    });
  }
});