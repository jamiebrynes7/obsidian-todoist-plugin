import { describe, it, expect } from "vitest";
import { getDueDateInfo, type DueDate, type DueDateInfo } from "./dueDate";
import moment from "moment";

// TODO: Fix tests to not rely on actual 'current' time.
describe("getDueDateInfo", () => {
    type TestCase = {
        description: string,
        input: DueDate | undefined,
        expected: DueDateInfo
    };

    const testcases: TestCase[] = [
        {
            description: "should return false for everything if undefined",
            input: undefined,
            expected: {
                hasDate: false,
                hasTime: false,
                isOverdue: false,
                isToday: false,
            }
        },
        {
            description: "should have hasDate if there is a date",
            input: {
                recurring: false,
                date: "2030-12-31"
            },
            expected: {
                hasDate: true,
                hasTime: false,
                isOverdue: false,
                isToday: false,
                m: moment("2030-12-31"),
            },
        },
        {
            description: "should have hasTime if there is time",
            input: {
                recurring: false,
                date: "",
                datetime: "2030-12-31T12:50:00",
            },
            expected: {
                hasDate: true,
                hasTime: true,
                isOverdue: false,
                isToday: false,
                m: moment("2030-12-31T12:50:00")
            }
        },
        {
            description: "should have isOverdue if is before now",
            input: {
                recurring: false,
                date: "2015-07-12",
            },
            expected: {
                hasDate: true,
                hasTime: false,
                isOverdue: true,
                isToday: false,
                m: moment("2015-07-12")
            }
        }
        // TODO: Add test for 'isToday'
    ];

    for (const tc of testcases) {
        it(tc.description, () => {
            const actual = getDueDateInfo(tc.input);
            expect(actual).toStrictEqual(tc.expected);
        });
    }
});
