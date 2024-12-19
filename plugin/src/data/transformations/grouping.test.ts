import type { DueDate } from "@/api/domain/dueDate";
import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";
import type { Task } from "@/data/task";
import { type GroupedTasks, groupBy } from "@/data/transformations/grouping";
import { GroupVariant } from "@/query/query";
import { CalendarDate, ZonedDateTime } from "@internationalized/date";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../infra/time.ts", () => {
  return {
    today: () => new CalendarDate(2024, 1, 1),
    now: () => new ZonedDateTime(2024, 1, 1, "Etc/UTC", 0, 12), // 2024-01-01T12:00:00Z
    timezone: () => "Etc/UTC",
  };
});

vi.mock("../../infra/locale.ts", () => {
  return {
    locale: () => "en-US",
  };
});

function makeTask(id: string, opts?: Partial<Task>): Task {
  return {
    id,
    createdAt: opts?.createdAt ?? "1970-01-01",
    parentId: opts?.parentId,
    content: "",
    description: "",
    labels: opts?.labels ?? [],
    priority: opts?.priority ?? 1,
    order: opts?.order ?? 0,

    project: opts?.project ?? makeProject("foobar"),
    section: opts?.section,

    due: opts?.due,
  };
}

function makeProject(id: string, opts?: Partial<Project>): Project {
  return {
    id,
    parentId: opts?.parentId ?? null,
    name: opts?.name ?? "Project",
    order: opts?.order ?? 1,
    isInboxProject: false,
    color: "grey",
  };
}

function makeSection(id: string, projectId: string, opts?: Partial<Section>): Section {
  return {
    id,
    projectId,
    name: opts?.name ?? "Section",
    order: opts?.order ?? 1,
  };
}

function makeDueDate(date: string): DueDate {
  return {
    isRecurring: false,
    date,
  };
}

function makeLabel(name: string): Label {
  return {
    id: name,
    name,
    color: "grey",
  };
}

type TestCase = {
  description: string;
  input: Task[];
  expected: GroupedTasks[];
};

describe("group by priority", () => {
  const testcases: TestCase[] = [
    {
      description: "should group tasks by priority",
      input: [
        makeTask("1", { priority: 1 }),
        makeTask("2", { priority: 2 }),
        makeTask("3", { priority: 3 }),
        makeTask("4", { priority: 4 }),
        makeTask("5", { priority: 1 }),
      ],
      expected: [
        {
          header: "Priority 1",
          tasks: [makeTask("4", { priority: 4 })],
        },
        {
          header: "Priority 2",
          tasks: [makeTask("3", { priority: 3 })],
        },
        {
          header: "Priority 3",
          tasks: [makeTask("2", { priority: 2 })],
        },
        {
          header: "Priority 4",
          tasks: [makeTask("1", { priority: 1 }), makeTask("5", { priority: 1 })],
        },
      ],
    },
    {
      description: "should only include priorities with tasks",
      input: [
        makeTask("1", { priority: 1 }),
        makeTask("4", { priority: 4 }),
        makeTask("5", { priority: 1 }),
      ],
      expected: [
        {
          header: "Priority 1",
          tasks: [makeTask("4", { priority: 4 })],
        },
        {
          header: "Priority 4",
          tasks: [makeTask("1", { priority: 1 }), makeTask("5", { priority: 1 })],
        },
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const groups = groupBy(tc.input, GroupVariant.Priority);
      expect(groups).toStrictEqual(tc.expected);
    });
  }
});

describe("group by project", () => {
  const projectOne = makeProject("1", { name: "Project One", order: 1 });
  const projectTwo = makeProject("2", { name: "Project Two", order: 2 });

  const testcases: TestCase[] = [
    {
      description: "should group by projects",
      input: [
        makeTask("a", { project: projectOne }),
        makeTask("b", { project: projectTwo }),
        makeTask("c", { project: projectOne }),
        makeTask("d", { project: projectTwo }),
      ],
      expected: [
        {
          header: projectOne.name,
          tasks: [makeTask("a", { project: projectOne }), makeTask("c", { project: projectOne })],
        },
        {
          header: projectTwo.name,
          tasks: [makeTask("b", { project: projectTwo }), makeTask("d", { project: projectTwo })],
        },
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const groups = groupBy(tc.input, GroupVariant.Project);
      expect(groups).toStrictEqual(tc.expected);
    });
  }
});

describe("group by section", () => {
  const projectOne = makeProject("1", { name: "Project One", order: 1 });
  const projectTwo = makeProject("2", { name: "Project Two", order: 2 });

  const sectionOne = makeSection("1", "1", { name: "Section One", order: 1 });
  const sectionTwo = makeSection("1", "2", { name: "Section Two", order: 2 });
  const sectionThree = makeSection("2", "3", { name: "Section Three", order: 2 });

  const testcases: TestCase[] = [
    {
      description: "should group tasks by project & section",
      input: [
        makeTask("a", { project: projectOne }),
        makeTask("b", { project: projectOne, section: sectionOne }),
        makeTask("c", { project: projectOne, section: sectionOne }),
        makeTask("d", { project: projectOne, section: sectionTwo }),
        makeTask("e", { project: projectTwo, section: sectionThree }),
      ],
      expected: [
        {
          header: "Project One",
          tasks: [makeTask("a", { project: projectOne })],
        },
        {
          header: "Project One / Section One",
          tasks: [
            makeTask("b", { project: projectOne, section: sectionOne }),
            makeTask("c", { project: projectOne, section: sectionOne }),
          ],
        },
        {
          header: "Project One / Section Two",
          tasks: [makeTask("d", { project: projectOne, section: sectionTwo })],
        },
        {
          header: "Project Two / Section Three",
          tasks: [makeTask("e", { project: projectTwo, section: sectionThree })],
        },
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const groups = groupBy(tc.input, GroupVariant.Section);
      expect(groups).toStrictEqual(tc.expected);
    });
  }
});

describe("group by date", () => {
  const testcases: TestCase[] = [
    {
      description: "groups tasks by due date",
      input: [
        makeTask("a", { due: makeDueDate("2024-01-12") }),
        makeTask("b", { due: makeDueDate("2024-01-13") }),
        makeTask("c", { due: makeDueDate("2024-01-14") }),
      ],
      expected: [
        {
          header: "Jan 12 ‧ Friday",
          tasks: [makeTask("a", { due: makeDueDate("2024-01-12") })],
        },
        {
          header: "Jan 13 ‧ Saturday",
          tasks: [makeTask("b", { due: makeDueDate("2024-01-13") })],
        },
        {
          header: "Jan 14 ‧ Sunday",
          tasks: [makeTask("c", { due: makeDueDate("2024-01-14") })],
        },
      ],
    },
    {
      description: "should group all overdue tasks together and put first",
      input: [
        makeTask("a", { due: makeDueDate("2024-01-12") }),
        makeTask("b", { due: makeDueDate("2023-12-31") }),
        makeTask("c", { due: makeDueDate("2023-12-30") }),
        makeTask("d", { due: makeDueDate("2023-12-29") }),
      ],
      expected: [
        {
          header: "Overdue",
          tasks: [
            makeTask("b", { due: makeDueDate("2023-12-31") }),
            makeTask("c", { due: makeDueDate("2023-12-30") }),
            makeTask("d", { due: makeDueDate("2023-12-29") }),
          ],
        },
        {
          header: "Jan 12 ‧ Friday",
          tasks: [makeTask("a", { due: makeDueDate("2024-01-12") })],
        },
      ],
    },
    {
      description: "should have special headers for today/tomorrow",
      input: [
        makeTask("a", { due: makeDueDate("2024-01-01") }),
        makeTask("b", { due: makeDueDate("2024-01-02") }),
      ],
      expected: [
        {
          header: "Jan 1 ‧ Monday ‧ Today",
          tasks: [makeTask("a", { due: makeDueDate("2024-01-01") })],
        },
        {
          header: "Jan 2 ‧ Tuesday ‧ Tomorrow",
          tasks: [makeTask("b", { due: makeDueDate("2024-01-02") })],
        },
      ],
    },
    {
      description: "should group tasks w/o due date and place them at the end",
      input: [makeTask("a", { due: makeDueDate("2024-01-12") }), makeTask("b"), makeTask("c")],
      expected: [
        {
          header: "Jan 12 ‧ Friday",
          tasks: [makeTask("a", { due: makeDueDate("2024-01-12") })],
        },
        {
          header: "No due date",
          tasks: [makeTask("b"), makeTask("c")],
        },
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const groups = groupBy(tc.input, GroupVariant.Date);
      expect(groups).toStrictEqual(tc.expected);
    });
  }
});

describe("group by label", () => {
  const labelOne = makeLabel("foo");
  const labelTwo = makeLabel("bar");
  const testcases: TestCase[] = [
    {
      description: "should group tasks by labels",
      input: [
        makeTask("a", { labels: [labelOne] }),
        makeTask("b", { labels: [labelOne] }),
        makeTask("c", { labels: [labelTwo] }),
      ],
      expected: [
        {
          header: "bar",
          tasks: [makeTask("c", { labels: [labelTwo] })],
        },
        {
          header: "foo",
          tasks: [makeTask("a", { labels: [labelOne] }), makeTask("b", { labels: [labelOne] })],
        },
      ],
    },
    {
      description: "should place task in multiple groups for multiple labels",
      input: [
        makeTask("a", { labels: [labelOne] }),
        makeTask("b", { labels: [labelOne, labelTwo] }),
        makeTask("c", { labels: [labelTwo] }),
      ],
      expected: [
        {
          header: "bar",
          tasks: [
            makeTask("b", { labels: [labelOne, labelTwo] }),
            makeTask("c", { labels: [labelTwo] }),
          ],
        },
        {
          header: "foo",
          tasks: [
            makeTask("a", { labels: [labelOne] }),
            makeTask("b", { labels: [labelOne, labelTwo] }),
          ],
        },
      ],
    },
    {
      description: "should group tasks w/ no labels and place at the end",
      input: [
        makeTask("a", { labels: [labelOne] }),
        makeTask("b", { labels: [labelOne] }),
        makeTask("c"),
      ],
      expected: [
        {
          header: "foo",
          tasks: [makeTask("a", { labels: [labelOne] }), makeTask("b", { labels: [labelOne] })],
        },
        {
          header: "No label",
          tasks: [makeTask("c")],
        },
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const groups = groupBy(tc.input, GroupVariant.Label);
      expect(groups).toStrictEqual(tc.expected);
    });
  }
});
