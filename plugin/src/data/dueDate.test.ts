import type { DueDate as ApiDueDate } from "@/api/domain/dueDate";
import { DueDate } from "@/data/dueDate";
import { CalendarDate, ZonedDateTime } from "@internationalized/date";
import { describe, expect, it, vi } from "vitest";

vi.mock("../infra/time.ts", () => {
  return {
    today: () => new CalendarDate(2024, 1, 1),
    now: () => new ZonedDateTime(2024, 1, 1, "Etc/UTC", 0, 12), // 2024-01-01T12:00:00Z
    timezone: () => "Etc/UTC",
  };
});

vi.mock("../infra/locale.ts", () => {
  return {
    locale: () => "en-US",
  };
});

const makeDate = (year: number, month: number, day: number, hours?: number): Date =>
  new Date(Date.UTC(year, month, day, hours ?? 0));

describe("parse", () => {
  type TestCase = {
    description: string;
    input: ApiDueDate;
    expected: DueDate;
  };

  const testcases: TestCase[] = [
    {
      description: "should parse a due date",
      input: {
        date: "2024-02-01",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 1, 1),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: undefined,
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date with time",
      input: {
        date: "2024-02-01",
        datetime: "2024-02-01T12:00:00",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 1, 1, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: undefined,
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date with time and timezone",
      input: {
        date: "2024-02-01",
        datetime: "2024-02-01T12:00:00Z",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 1, 1, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: undefined,
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for today",
      input: {
        date: "2024-01-01",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 0, 1),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "today",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for today with time",
      input: {
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 0, 1, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: "today",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for tomorrow",
      input: {
        date: "2024-01-02",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 0, 2),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "tomorrow",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for tomorrow with time",
      input: {
        date: "2024-01-02",
        isRecurring: false,
        datetime: "2024-01-02T12:00:00",
      },
      expected: {
        start: {
          raw: makeDate(2024, 0, 2, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: "tomorrow",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for yesterday",
      input: {
        date: "2023-12-31",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2023, 11, 31),
          hasTime: false,
          isOverdue: true,
          isCurrentYear: false,
          flag: "yesterday",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for yesterday with time",
      input: {
        date: "2023-12-31",
        isRecurring: false,
        datetime: "2023-12-31T12:00:00",
      },
      expected: {
        start: {
          raw: makeDate(2023, 11, 31, 12),
          hasTime: true,
          isOverdue: true,
          isCurrentYear: false,
          flag: "yesterday",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for next week",
      input: {
        date: "2024-01-06",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2024, 0, 6),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "nextWeek",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for next week with time",
      input: {
        date: "2024-01-06",
        isRecurring: false,
        datetime: "2024-01-06T12:00:00",
      },
      expected: {
        start: {
          raw: makeDate(2024, 0, 6, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: "nextWeek",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for last week",
      input: {
        date: "2023-12-29",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2023, 11, 29),
          hasTime: false,
          isOverdue: true,
          isCurrentYear: false,
          flag: "lastWeek",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a due date for last week with time",
      input: {
        date: "2023-12-29",
        isRecurring: false,
        datetime: "2023-12-29T12:00:00",
      },
      expected: {
        start: {
          raw: makeDate(2023, 11, 29, 12),
          hasTime: true,
          isOverdue: true,
          isCurrentYear: false,
          flag: "lastWeek",
        },
        end: undefined,
      },
    },
    {
      description: "should parse a date not this year",
      input: {
        date: "2025-01-01",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2025, 0, 1),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
    },
    {
      description: "should parse a date not this year with time",
      input: {
        date: "2025-01-01",
        isRecurring: false,
        datetime: "2025-01-01T12:00:00",
      },
      expected: {
        start: {
          raw: makeDate(2025, 0, 1, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
    },
    {
      description: "should parse a date that's overdue",
      input: {
        date: "2023-06-01",
        isRecurring: false,
      },
      expected: {
        start: {
          raw: makeDate(2023, 5, 1),
          hasTime: false,
          isOverdue: true,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
    },
    {
      description: "should parse a date that's overdue with time",
      input: {
        date: "2023-06-01",
        isRecurring: false,
        datetime: "2023-06-01T12:00:00",
      },
      expected: {
        start: {
          raw: makeDate(2023, 5, 1, 12),
          hasTime: true,
          isOverdue: true,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const output = DueDate.parse(tc.input);
      expect(output).toStrictEqual(tc.expected);
    });
  }
});

describe("format", () => {
  type Testcase = {
    description: string;
    dueDate: DueDate;
    expected: string;
  };

  const testcases: Testcase[] = [
    {
      description: "today, no time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 1),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "today",
        },
        end: undefined,
      },
      expected: "Today",
    },
    {
      description: "today, with time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 1, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: "today",
        },
        end: undefined,
      },
      expected: "Today at 12:00 PM",
    },
    {
      description: "tomorrow, no time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 2),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "tomorrow",
        },
        end: undefined,
      },
      expected: "Tomorrow",
    },
    {
      description: "tomorrow, with time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 2, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: "tomorrow",
        },
        end: undefined,
      },
      expected: "Tomorrow at 12:00 PM",
    },
    {
      description: "yesterday, no time",
      dueDate: {
        start: {
          raw: makeDate(2023, 11, 31),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: false,
          flag: "yesterday",
        },
        end: undefined,
      },
      expected: "Yesterday",
    },
    {
      description: "tomorrow, with time",
      dueDate: {
        start: {
          raw: makeDate(2023, 11, 31, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: false,
          flag: "yesterday",
        },
        end: undefined,
      },
      expected: "Yesterday at 12:00 PM",
    },
    {
      description: "next week, no time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 5),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "nextWeek",
        },
        end: undefined,
      },
      expected: "Friday",
    },
    {
      description: "next week, with time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 5, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: "nextWeek",
        },
        end: undefined,
      },
      expected: "Friday at 12:00 PM",
    },
    {
      description: "last week, no time",
      dueDate: {
        start: {
          raw: makeDate(2023, 11, 27),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: false,
          flag: "lastWeek",
        },
        end: undefined,
      },
      expected: "Last Wednesday",
    },
    {
      description: "last week, with time",
      dueDate: {
        start: {
          raw: makeDate(2023, 11, 27, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: false,
          flag: "lastWeek",
        },
        end: undefined,
      },
      expected: "Last Wednesday at 12:00 PM",
    },
    {
      description: "future date, no time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 30),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: undefined,
        },
        end: undefined,
      },
      expected: "Jan 30",
    },
    {
      description: "future date, with time",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 30, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: true,
          flag: undefined,
        },
        end: undefined,
      },
      expected: "Jan 30 at 12:00 PM",
    },
    {
      description: "next year, no time",
      dueDate: {
        start: {
          raw: makeDate(2025, 0, 2),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
      expected: "Jan 2, 2025",
    },
    {
      description: "next year, with time",
      dueDate: {
        start: {
          raw: makeDate(2025, 0, 30, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
      expected: "Jan 30, 2025 at 12:00 PM",
    },
    {
      description: "last year, no time",
      dueDate: {
        start: {
          raw: makeDate(2023, 0, 2),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
      expected: "Jan 2, 2023",
    },
    {
      description: "last year, with time",
      dueDate: {
        start: {
          raw: makeDate(2023, 0, 30, 12),
          hasTime: true,
          isOverdue: false,
          isCurrentYear: false,
          flag: undefined,
        },
        end: undefined,
      },
      expected: "Jan 30, 2023 at 12:00 PM",
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const actual = DueDate.format(tc.dueDate);
      expect(actual).toBe(tc.expected);
    });
  }
});

describe("formatAsHeader", () => {
  type Testcase = {
    description: string;
    dueDate: DueDate;
    expected: string;
  };

  const testcases: Testcase[] = [
    {
      description: "today",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 1),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "today",
        },
        end: undefined,
      },
      expected: "Jan 1 ‧ Monday ‧ Today",
    },
    {
      description: "tomrrow",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 2),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "tomorrow",
        },
        end: undefined,
      },
      expected: "Jan 2 ‧ Tuesday ‧ Tomorrow",
    },
    {
      description: "other date",
      dueDate: {
        start: {
          raw: makeDate(2024, 0, 5),
          hasTime: false,
          isOverdue: false,
          isCurrentYear: true,
          flag: "nextWeek",
        },
        end: undefined,
      },
      expected: "Jan 5 ‧ Friday",
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const actual = DueDate.formatHeader(tc.dueDate);
      expect(actual).toBe(tc.expected);
    });
  }
});
