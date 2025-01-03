import { ParsingError, type QueryWarning, parseQuery } from "@/query/parser";
import { GroupVariant, type Query, ShowMetadataVariant, SortingVariant } from "@/query/query";
import { describe, expect, it } from "vitest";

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
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      expect(() => {
        parseQuery(JSON.stringify(tc.input));
      }).toThrowError(ParsingError);
    });
  }
});

function makeQuery(opts?: Partial<Query>): Query {
  return {
    name: opts?.name ?? "",
    filter: opts?.filter ?? "",
    autorefresh: opts?.autorefresh ?? 0,
    sorting: opts?.sorting ?? [SortingVariant.Order],
    show:
      opts?.show ??
      new Set([
        ShowMetadataVariant.Due,
        ShowMetadataVariant.Description,
        ShowMetadataVariant.Project,
        ShowMetadataVariant.Labels,
      ]),
    groupBy: opts?.groupBy ?? GroupVariant.None,
  };
}

describe("parseQuery", () => {
  type Testcase = {
    description: string;
    input: unknown;
    expectedOutput: Query;
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
        groupBy: GroupVariant.Section,
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
        sorting: [SortingVariant.Date],
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
        show: new Set([ShowMetadataVariant.Due, ShowMetadataVariant.Project]),
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
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const [output, _] = parseQuery(JSON.stringify(tc.input));
      expect(output).toStrictEqual(tc.expectedOutput);
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
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const [_, warnings] = parseQuery(JSON.stringify(tc.input));
      expect(warnings).toStrictEqual(tc.expectedWarnings);
    });
  }
});
