import { describe, expect, it } from "vitest";

import { ParsingError, parseQuery, type QueryWarning } from "@/query/parser";
import { type TaskQuery, taskQueryDefinition } from "@/query/schema/tasks";

describe("parseQuery - rejections", () => {
  type Testcase = {
    description: string;
    input: unknown;
  };

  const testcases: Testcase[] = [
    {
      description: "name must be a string",
      input: {
        name: 1,
        filter: "foo",
      },
    },
    {
      description: "filter is required",
      input: {
        name: "foo",
      },
    },
    {
      description: "filter must be a string",
      input: {
        name: "foo",
        filter: 1,
      },
    },
    {
      description: "autorefresh must be a number",
      input: {
        name: "foo",
        filter: "bar",
        autorefresh: "foobar",
      },
    },
    {
      description: "autorefresh must be a positive number",
      input: {
        name: "foo",
        filter: "bar",
        autorefresh: -1,
      },
    },
    {
      description: "sorting must be an array",
      input: {
        name: "foo",
        filter: "bar",
        sorting: "not an array",
      },
    },
    {
      description: "sorting must an array of strings",
      input: {
        name: "foo",
        filter: "bar",
        sorting: [1, 2, 3],
      },
    },
    {
      description: "sorting must be valid options",
      input: {
        name: "foo",
        filter: "bar",
        sorting: ["foo", "bar"],
      },
    },
    {
      description: "groupBy must be a string",
      input: {
        filter: "foobar",
        groupBy: 1,
      },
    },
    {
      description: "groupBy must be a valid option",
      input: {
        filter: "foobar",
        groupBy: "something else",
      },
    },
    {
      description: "show must be an array of strings",
      input: {
        name: "foo",
        filter: "bar",
        show: [1, 2, 3],
      },
    },
    {
      description: "show must be valid options",
      input: {
        name: "foo",
        filter: "bar",
        show: ["foo", "bar"],
      },
    },
    {
      description: "show must be 'none' literal",
      input: {
        name: "foo",
        filter: "bar",
        show: "nonee",
      },
    },
    {
      description: "view.noTasksMessage must be string",
      input: {
        filter: "bar",
        view: { noTasksMessage: 123 },
      },
    },
    {
      description: "view.hideNoTasks must be boolean",
      input: {
        filter: "bar",
        view: { hideNoTasks: "true" },
      },
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      expect(() => {
        parseQuery(JSON.stringify(tc.input), taskQueryDefinition);
      }).toThrowError(ParsingError);
    });
  }
});

function makeQuery(opts?: Partial<TaskQuery>): TaskQuery {
  return {
    name: opts?.name,
    filter: opts?.filter ?? "",
    autorefresh: opts?.autorefresh,
    sorting: opts?.sorting,
    show: opts?.show,
    groupBy: opts?.groupBy,
    view: opts?.view,
  };
}

describe("parseQuery", () => {
  type Testcase = {
    description: string;
    input: unknown;
    expectedOutput: TaskQuery;
  };

  const testcases: Testcase[] = [
    {
      description: "only filter",
      input: {
        filter: "bar",
      },
      expectedOutput: makeQuery({
        filter: "bar",
      }),
    },
    {
      description: "with name",
      input: {
        name: "foo",
        filter: "bar",
      },
      expectedOutput: makeQuery({
        name: "foo",
        filter: "bar",
      }),
    },
    {
      description: "with autorefresh",
      input: {
        filter: "bar",
        autorefresh: 120,
      },
      expectedOutput: makeQuery({
        filter: "bar",
        autorefresh: 120,
      }),
    },
    {
      description: "with group",
      input: {
        filter: "bar",
        groupBy: "section",
      },
      expectedOutput: makeQuery({
        filter: "bar",
        groupBy: "section",
      }),
    },
    {
      description: "with sorting",
      input: {
        filter: "bar",
        sorting: ["date"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        sorting: ["dateAscending"],
      }),
    },
    {
      description: "with show",
      input: {
        filter: "bar",
        show: ["due", "project"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["due", "project"]),
      }),
    },
    {
      description: "with show including deadline",
      input: {
        filter: "bar",
        show: ["due", "deadline", "project"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["due", "deadline", "project"]),
      }),
    },
    {
      description: "with show = none",
      input: {
        filter: "bar",
        show: "none",
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(),
      }),
    },
    {
      description: "with show including time only",
      input: {
        filter: "bar",
        show: ["time"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["time"]),
      }),
    },
    {
      description: "with show including time and project",
      input: {
        filter: "bar",
        show: ["time", "project"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["time", "project"]),
      }),
    },
    {
      description: "with show including both due and time",
      input: {
        filter: "bar",
        show: ["due", "time"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["due", "time"]),
      }),
    },
    {
      description: "with show including section",
      input: {
        filter: "bar",
        show: ["section"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["section"]),
      }),
    },
    {
      description: "with show including section and project",
      input: {
        filter: "bar",
        show: ["section", "project"],
      },
      expectedOutput: makeQuery({
        filter: "bar",
        show: new Set(["section", "project"]),
      }),
    },
    {
      description: "with custom view.noTasksMessage",
      input: {
        filter: "bar",
        view: { noTasksMessage: "All caught up!" },
      },
      expectedOutput: makeQuery({
        filter: "bar",
        view: { noTasksMessage: "All caught up!" },
      }),
    },
    {
      description: "with view.hideNoTasks",
      input: {
        filter: "bar",
        view: { hideNoTasks: true },
      },
      expectedOutput: makeQuery({
        filter: "bar",
        view: { hideNoTasks: true },
      }),
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const [output, _] = parseQuery(JSON.stringify(tc.input), taskQueryDefinition);
      expect(output).toEqual(tc.expectedOutput);
    });
  }
});

describe("parseQuery - warnings", () => {
  type Testcase = {
    description: string;
    input: unknown;
    expectedWarnings: QueryWarning[];
  };

  const testcases: Testcase[] = [
    {
      description: "JSON input format",
      input: {
        name: "foo",
        filter: "bar",
      },
      expectedWarnings: [
        "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
      ],
    },
    {
      description: "Unknown query key",
      input: {
        namee: "foo",
        filter: "bar",
      },
      expectedWarnings: [
        "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
        "Found unexpected query key 'namee'. Is this a typo?",
      ],
    },
    {
      description: "Both due and time in show options",
      input: {
        filter: "bar",
        show: ["due", "time"],
      },
      expectedWarnings: [
        "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
        "Both 'due' and 'time' show options are set. The 'time' option will be ignored when 'due' is present.",
      ],
    },
    {
      description: "Both project and section in show options",
      input: {
        filter: "bar",
        show: ["project", "section"],
      },
      expectedWarnings: [
        "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
        "Both 'project' and 'section' show options are set. The 'section' option will be ignored when 'project' is present.",
      ],
    },
    {
      description: "Unknown nested key in view",
      input: {
        filter: "bar",
        view: { unknownProp: "value" },
      },
      expectedWarnings: [
        "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
        "Found unexpected query key 'view.unknownProp'. Is this a typo?",
      ],
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const [_, warnings] = parseQuery(JSON.stringify(tc.input), taskQueryDefinition);
      expect(warnings).toStrictEqual(tc.expectedWarnings);
    });
  }
});

describe("parseQuery - error message snapshots", () => {
  type ErrorTestCase = {
    description: string;
    input: string;
  };

  const testcases: ErrorTestCase[] = [
    {
      description: "invalid JSON - missing quotes",
      input: "{name: foo}",
    },
    {
      description: "invalid JSON - unclosed brace",
      input: '{"filter": "bar"',
    },
    {
      description: "invalid YAML - incorrect indentation",
      input: "filter: bar\n  name: foo\n name: baz",
    },
    {
      description: "neither valid JSON nor YAML",
      input: "this is not valid at all {{",
    },
    {
      description: "missing required filter field",
      input: '{"name": "foo"}',
    },
    {
      description: "name must be a string",
      input: '{"name": 123, "filter": "bar"}',
    },
    {
      description: "filter must be a string",
      input: '{"filter": 123}',
    },
    {
      description: "autorefresh must be a number",
      input: '{"filter": "bar", "autorefresh": "not a number"}',
    },
    {
      description: "autorefresh must be non-negative",
      input: '{"filter": "bar", "autorefresh": -5}',
    },
    {
      description: "sorting must be an array",
      input: '{"filter": "bar", "sorting": "not an array"}',
    },
    {
      description: "sorting array must contain strings",
      input: '{"filter": "bar", "sorting": [1, 2, 3]}',
    },
    {
      description: "sorting must have valid enum values",
      input: '{"filter": "bar", "sorting": ["invalid", "values"]}',
    },
    {
      description: "groupBy must be a string",
      input: '{"filter": "bar", "groupBy": 123}',
    },
    {
      description: "groupBy must have valid enum value",
      input: '{"filter": "bar", "groupBy": "invalid"}',
    },
    {
      description: "show array must contain strings",
      input: '{"filter": "bar", "show": [1, 2, 3]}',
    },
    {
      description: "show must have valid enum values",
      input: '{"filter": "bar", "show": ["invalid", "values"]}',
    },
    {
      description: "show field - invalid literal (not 'none')",
      input: '{"filter": "bar", "show": "nonee"}',
    },
    {
      description: "multiple validation errors",
      input: '{"name": 123, "autorefresh": -1, "sorting": "invalid"}',
    },
    {
      description: "array with mixed valid and invalid enum values",
      input: '{"filter": "bar", "sorting": ["date", "invalid", "priority"]}',
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      expect(() => parseQuery(tc.input, taskQueryDefinition)).toThrowErrorMatchingSnapshot();
    });
  }
});
