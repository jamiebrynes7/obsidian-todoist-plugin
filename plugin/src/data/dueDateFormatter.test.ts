import { DueDate } from "@/data/dueDate";
import { formatAsHeader, formatDueDate } from "@/data/dueDateFormatter";
import { CalendarDate, ZonedDateTime } from "@internationalized/date";
import { describe, expect, test, vi } from "vitest";

vi.mock("../infra/time.ts", () => {
  return {
    today: () => new CalendarDate(2024, 6, 1),
    now: () => new ZonedDateTime(2024, 6, 1, "Etc/UTC", 0, 12), // 2024-06-01T12:00:00Z
    timezone: () => "Etc/UTC",
  };
});

vi.mock("../infra/locale.ts", () => {
  return {
    locale: () => "en-US",
  };
});

describe("formatDueDate", () => {
  type Testcase = {
    description: string;
    dueDate: DueDate;
    expected: string;
  };

  const testcases: Testcase[] = [
    {
      description: "Today, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-01",
      }),
      expected: "Today",
    },
    {
      description: "Today, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-01",
        datetime: "2024-06-01T12:00:00",
      }),
      expected: "Today at 12:00 PM",
    },
    {
      description: "Tomorrow, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-02",
      }),
      expected: "Tomorrow",
    },
    {
      description: "Tomorrow, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-02",
        datetime: "2024-06-02T12:00:00",
      }),
      expected: "Tomorrow at 12:00 PM",
    },
    {
      description: "Next week, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-05",
      }),
      expected: "Wednesday",
    },
    {
      description: "Next week, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-05",
        datetime: "2024-06-05T12:00:00",
      }),
      expected: "Wednesday at 12:00 PM",
    },
    {
      description: "Future date, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-30",
      }),
      expected: "Jun 30",
    },
    {
      description: "Future date, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-06-30",
        datetime: "2024-06-30T12:00:00",
      }),
      expected: "Jun 30 at 12:00 PM",
    },
    {
      description: "Yesterday, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-05-31",
      }),
      expected: "Yesterday",
    },
    {
      description: "Yesterday, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-05-31",
        datetime: "2024-05-31T12:00:00",
      }),
      expected: "Yesterday at 12:00 PM",
    },
    {
      description: "Last week, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-05-29",
      }),
      expected: "Last Wednesday",
    },
    {
      description: "Last week, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2024-05-29",
        datetime: "2024-05-29T12:00:00",
      }),
      expected: "Last Wednesday at 12:00 PM",
    },
    {
      description: "Next year, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2025-06-10",
      }),
      expected: "Jun 10, 2025",
    },
    {
      description: "Next year, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2025-06-10",
        datetime: "2025-06-10T12:00:00",
      }),
      expected: "Jun 10, 2025 at 12:00 PM",
    },
    {
      description: "Last year, no time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2023-08-15",
      }),
      expected: "Aug 15, 2023",
    },
    {
      description: "Last year, with time",
      dueDate: new DueDate({
        isRecurring: false,
        date: "2023-08-15",
        datetime: "2023-08-15T12:00:00",
      }),
      expected: "Aug 15, 2023 at 12:00 PM",
    },
  ];

  for (const tc of testcases) {
    test(tc.description, () => {
      const actual = formatDueDate(tc.dueDate);
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
      description: "Today",
      dueDate: new DueDate({
        date: "2024-06-01",
        isRecurring: false,
      }),
      expected: "Jun 1 ‧ Saturday ‧ Today",
    },
    {
      description: "Tomorrow",
      dueDate: new DueDate({
        date: "2024-06-02",
        isRecurring: false,
      }),
      expected: "Jun 2 ‧ Sunday ‧ Tomorrow",
    },
    {
      description: "Other date",
      dueDate: new DueDate({
        date: "2024-06-03",
        isRecurring: false,
      }),
      expected: "Jun 3 ‧ Monday",
    },
  ];

  for (const tc of testcases) {
    test(tc.description, () => {
      const actual = formatAsHeader(tc.dueDate);
      expect(actual).toBe(tc.expected);
    });
  }
});
