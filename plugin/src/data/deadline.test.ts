import { CalendarDate } from "@internationalized/date";
import { describe, expect, it, vi } from "vitest";

import type { Deadline as ApiDeadline } from "@/api/domain/task";
import { Deadline, type DeadlineInfo } from "@/data/deadline";

vi.mock("../infra/time.ts", () => {
  return {
    today: () => new CalendarDate(2024, 1, 1),
    timezone: () => "Etc/UTC",
  };
});

vi.mock("../infra/locale.ts", () => {
  return {
    locale: () => "en-US",
  };
});

const makeDate = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month, day, 0, 0));

describe("parse", () => {
  type TestCase = {
    description: string;
    input: ApiDeadline;
    expected: DeadlineInfo;
  };

  const testcases: TestCase[] = [
    {
      description: "should parse a deadline",
      input: {
        date: "2024-02-01",
      },
      expected: {
        raw: makeDate(2024, 1, 1),
        isOverdue: false,
        isCurrentYear: true,
        flag: undefined,
      },
    },
    {
      description: "should parse a deadline for today",
      input: {
        date: "2024-01-01",
      },
      expected: {
        raw: makeDate(2024, 0, 1),
        isOverdue: false,
        isCurrentYear: true,
        flag: "today",
      },
    },
    {
      description: "should parse a deadline for tomorrow",
      input: {
        date: "2024-01-02",
      },
      expected: {
        raw: makeDate(2024, 0, 2),
        isOverdue: false,
        isCurrentYear: true,
        flag: "tomorrow",
      },
    },
    {
      description: "should parse a deadline for yesterday",
      input: {
        date: "2023-12-31",
      },
      expected: {
        raw: makeDate(2023, 11, 31),
        isOverdue: true,
        isCurrentYear: false,
        flag: "yesterday",
      },
    },
    {
      description: "should parse a deadline for next week",
      input: {
        date: "2024-01-06",
      },
      expected: {
        raw: makeDate(2024, 0, 6),
        isOverdue: false,
        isCurrentYear: true,
        flag: "nextWeek",
      },
    },
    {
      description: "should parse a deadline for last week",
      input: {
        date: "2023-12-29",
      },
      expected: {
        raw: makeDate(2023, 11, 29),
        isOverdue: true,
        isCurrentYear: false,
        flag: "lastWeek",
      },
    },
    {
      description: "should parse a date not this year",
      input: {
        date: "2025-01-01",
      },
      expected: {
        raw: makeDate(2025, 0, 1),
        isOverdue: false,
        isCurrentYear: false,
        flag: undefined,
      },
    },
    {
      description: "should parse a date that's overdue",
      input: {
        date: "2023-06-01",
      },
      expected: {
        raw: makeDate(2023, 5, 1),
        isOverdue: true,
        isCurrentYear: false,
        flag: undefined,
      },
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const output = Deadline.parse(tc.input);
      expect(output).toStrictEqual(tc.expected);
    });
  }
});

describe("format", () => {
  type Testcase = {
    description: string;
    deadline: DeadlineInfo;
    expected: string;
  };

  const testcases: Testcase[] = [
    {
      description: "today",
      deadline: {
        raw: makeDate(2024, 0, 1),
        isOverdue: false,
        isCurrentYear: true,
        flag: "today",
      },
      expected: "Today",
    },
    {
      description: "tomorrow",
      deadline: {
        raw: makeDate(2024, 0, 2),
        isOverdue: false,
        isCurrentYear: true,
        flag: "tomorrow",
      },
      expected: "Tomorrow",
    },
    {
      description: "yesterday",
      deadline: {
        raw: makeDate(2023, 11, 31),
        isOverdue: true,
        isCurrentYear: false,
        flag: "yesterday",
      },
      expected: "Yesterday",
    },
    {
      description: "next week",
      deadline: {
        raw: makeDate(2024, 0, 5),
        isOverdue: false,
        isCurrentYear: true,
        flag: "nextWeek",
      },
      expected: "Friday",
    },
    {
      description: "last week",
      deadline: {
        raw: makeDate(2023, 11, 27),
        isOverdue: true,
        isCurrentYear: false,
        flag: "lastWeek",
      },
      expected: "Last Wednesday",
    },
    {
      description: "future date",
      deadline: {
        raw: makeDate(2024, 0, 30),
        isOverdue: false,
        isCurrentYear: true,
        flag: undefined,
      },
      expected: "Jan 30",
    },
    {
      description: "next year",
      deadline: {
        raw: makeDate(2025, 0, 2),
        isOverdue: false,
        isCurrentYear: false,
        flag: undefined,
      },
      expected: "Jan 2, 2025",
    },
    {
      description: "last year",
      deadline: {
        raw: makeDate(2023, 0, 2),
        isOverdue: true,
        isCurrentYear: false,
        flag: undefined,
      },
      expected: "Jan 2, 2023",
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const actual = Deadline.format(tc.deadline);
      expect(actual).toBe(tc.expected);
    });
  }
});
