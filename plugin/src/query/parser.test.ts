import { describe, it, expect } from "vitest";
import { parseQuery, ParsingError } from "./parser";
import { type Query, SortingVariant, ShowMetadataVariant } from "./query";

describe("parseQuery - rejections", () => {
    type Testcase = {
        description: string,
        input: any,
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
                autorefresh: "foobar"
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
                sorting: "not an array"
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
                sorting: ["foo", "bar"]
            },
        },
        {
            description: "group must be a boolean",
            input: {
                name: "foo",
                filter: "bar",
                group: "foobar",
            }
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
                show: ["foo", "bar"]
            },
        },
    ];

    for (const tc of testcases) {
        it(tc.description, () => {
            expect(() => { parseQuery(JSON.stringify(tc.input)); }).toThrowError(ParsingError);
        });
    }
});

function makeQuery(opts?: Partial<Query>): Query {
    return {
        name: opts?.name ?? "",
        filter: opts?.filter ?? "",
        autorefresh: opts?.autorefresh ?? 0,
        group: opts?.group ?? false,
        sorting: opts?.sorting ?? [SortingVariant.Order],
        show: opts?.show ?? new Set([ShowMetadataVariant.Due, ShowMetadataVariant.Description, ShowMetadataVariant.Project, ShowMetadataVariant.Labels]),
    }
}

describe("parseQuery", () => {
    type Testcase = {
        description: string,
        input: any,
        expectedOutput: Query,
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
            })
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
                group: true,
            },
            expectedOutput: makeQuery({
                filter: "bar",
                group: true,
            }),
        },
        {
            description: "with sorting",
            input: {
                filter: "bar",
                sorting: ["date"]
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
                show: ["due", "project"]
            },
            expectedOutput: makeQuery({
                filter: "bar",
                show: new Set([ShowMetadataVariant.Due, ShowMetadataVariant.Project]),
            })
        }
    ];

    for (const tc of testcases) {
        it(tc.description, () => {
            const output = parseQuery(JSON.stringify(tc.input));
            expect(output).toStrictEqual(tc.expectedOutput);
        });
    }
});
