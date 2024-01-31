import "mocha";
import { assert } from "chai";
import { parseQuery, ParsingError } from "./parser";
import { type Query, SortingVariant } from "./query";

describe("parseQuery - rejections", () => {
    type Testcase = {
        description: string,
        input: any,
    };

    const testcases: Testcase[] = [
        {
            description: "name is required",
            input: {
                filter: "foo",
            }
        },
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
        }
    ];

    for (const tc of testcases) {
        it(tc.description, () => {
            assert.throws(() => { parseQuery(JSON.stringify(tc.input)); }, ParsingError);
        });
    }
});

function makeQuery(opts?: Partial<Query>): Query {
    return {
        name: opts.name ?? "",
        filter: opts.filter ?? "",
        autorefresh: opts.autorefresh ?? 0,
        group: opts.group ?? false,
        sorting: opts.sorting ?? [SortingVariant.Order],
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
            description: "only name & filter",
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
                name: "foo",
                filter: "bar",
                autorefresh: 120,
            },
            expectedOutput: makeQuery({
                name: "foo",
                filter: "bar",
                autorefresh: 120,
            }),
        },
        {
            description: "with group",
            input: {
                name: "foo",
                filter: "bar",
                group: true,
            },
            expectedOutput: makeQuery({
                name: "foo",
                filter: "bar",
                group: true,
            }),
        },
        {
            description: "with sorting",
            input: {
                name: "foo",
                filter: "bar",
                sorting: ["date"]
            },
            expectedOutput: makeQuery({
                name: "foo",
                filter: "bar",
                sorting: [SortingVariant.Date],
            }),
        }
    ];

    for (const tc of testcases) {
        it(tc.description, () => {
            const output = parseQuery(JSON.stringify(tc.input));
            assert.deepEqual(output, tc.expectedOutput);
        });
    }
});
