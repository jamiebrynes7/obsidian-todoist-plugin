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

type TestCase = {
  description: string;
  input: ApiDueDate;
  expected: boolean;
};

describe("hasTime", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for just date",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for datetime",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const hasTime = info.hasTime();
      expect(hasTime).toEqual(tc.expected);
    });
  }
});

describe("isToday", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for different day",
      input: {
        isRecurring: false,
        date: "2024-01-02",
      },
      expected: false,
    },
    {
      description: "should be true for same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: true,
    },
    {
      description: "should be true for datetime same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isToday = info.isToday();
      expect(isToday).toEqual(tc.expected);
    });
  }
});

describe("isOverdue", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false if date in future",
      input: {
        isRecurring: false,
        date: "2024-01-02",
      },
      expected: false,
    },
    {
      description: "should be false for same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for day in the past",
      input: {
        isRecurring: false,
        date: "2023-12-15",
      },
      expected: true,
    },
    {
      description: "should be true for same day earlier in the day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T08:00:00",
      },
      expected: true,
    },
    {
      description: "should be false for same day later in the day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T14:00:00",
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isOverdue = info.isOverdue();
      expect(isOverdue).toEqual(tc.expected);
    });
  }
});

describe("isTomorrow", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for next day",
      input: {
        isRecurring: false,
        date: "2024-01-02",
      },
      expected: true,
    },
    {
      description: "should be false for any other day",
      input: {
        isRecurring: false,
        date: "2024-01-03",
      },
      expected: false,
    },
    {
      description: "should be true for datetime tomorrow",
      input: {
        isRecurring: false,
        date: "2024-01-02",
        datetime: "2024-01-02T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isTomorrow = info.isTomorrow();
      expect(isTomorrow).toEqual(tc.expected);
    });
  }
});

describe("isYesterday", () => {
  const testcases: TestCase[] = [
    {
      description: "should be true for day before",
      input: {
        isRecurring: false,
        date: "2023-12-31",
      },
      expected: true,
    },
    {
      description: "should be false for any other previous day",
      input: {
        isRecurring: false,
        date: "2023-12-28",
      },
      expected: false,
    },
    {
      description: "should be false for same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be false for any other future day",
      input: {
        isRecurring: false,
        date: "2024-01-02",
      },
      expected: false,
    },
    {
      description: "should be true for datetime day before",
      input: {
        isRecurring: false,
        date: "2023-12-31",
        datetime: "2023-12-31T12:00:00",
      },
      expected: true,
    },
    {
      description: "should be false for datetime any other previous day",
      input: {
        isRecurring: false,
        date: "2023-12-28",
        datetime: "2023-12-28T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be false for datetime same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be false for datetime any other future day",
      input: {
        isRecurring: false,
        date: "2024-01-02",
        datetime: "2024-01-02T12:00:00",
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isTomorrow = info.isYesterday();
      expect(isTomorrow).toEqual(tc.expected);
    });
  }
});

describe("isInLastWeek", () => {
  const testcases: TestCase[] = [
    {
      description: "should be true for day in last week",
      input: {
        isRecurring: false,
        date: "2023-12-28",
      },
      expected: true,
    },
    {
      description: "should be false for any other previous day",
      input: {
        isRecurring: false,
        date: "2023-12-24",
      },
      expected: false,
    },
    {
      description: "should be false for same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be false for any other future day",
      input: {
        isRecurring: false,
        date: "2024-01-02",
      },
      expected: false,
    },
    {
      description: "should be true for datetime day in last week",
      input: {
        isRecurring: false,
        date: "2023-12-28",
        datetime: "2023-12-28T12:00:00",
      },
      expected: true,
    },
    {
      description: "should be false for datetime any other previous day",
      input: {
        isRecurring: false,
        date: "2023-12-24",
        datetime: "2023-12-24T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be false for datetime same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be false for any datetime other future day",
      input: {
        isRecurring: false,
        date: "2024-01-02",
        datetime: "2024-01-02T12:00:00",
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isTomorrow = info.isInLastWeek();
      expect(isTomorrow).toEqual(tc.expected);
    });
  }
});

describe("isInNextWeek", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for any previous day",
      input: {
        isRecurring: false,
        date: "2023-12-24",
      },
      expected: false,
    },
    {
      description: "should be false for same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for future day within a week",
      input: {
        isRecurring: false,
        date: "2024-01-02",
      },
      expected: true,
    },
    {
      description: "should be false for any other future day",
      input: {
        isRecurring: false,
        date: "2024-01-09",
      },
      expected: false,
    },
    {
      description: "should be false for datetime any previous day",
      input: {
        isRecurring: false,
        date: "2023-12-24",
        datetime: "2023-12-24T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be false for dateimt same day",
      input: {
        isRecurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be true for datetime future day within a week",
      input: {
        isRecurring: false,
        date: "2024-01-02",
        datetime: "2024-01-02T12:00:00",
      },
      expected: true,
    },
    {
      description: "should be false for datetime any other future day",
      input: {
        isRecurring: false,
        date: "2024-01-09",
        datetime: "2024-01-09T12:00:00",
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isTomorrow = info.isInNextWeek();
      expect(isTomorrow).toEqual(tc.expected);
    });
  }
});

describe("isCurrentYear", () => {
  const testcases: TestCase[] = [
    {
      description: "should be true for current year",
      input: {
        isRecurring: false,
        date: "2024-06-01",
      },
      expected: true,
    },
    {
      description: "should be false for last year",
      input: {
        isRecurring: false,
        date: "2023-06-01",
      },
      expected: false,
    },
    {
      description: "should be false for next year",
      input: {
        isRecurring: false,
        date: "2025-06-01",
      },
      expected: false,
    },
    {
      description: "should be true for datetime current year",
      input: {
        isRecurring: false,
        date: "2024-06-01",
        datetime: "2024-06-01T12:00:00",
      },
      expected: true,
    },
    {
      description: "should be false for datetime last year",
      input: {
        isRecurring: false,
        date: "2023-06-01",
        datetime: "2023-06-01T12:00:00",
      },
      expected: false,
    },
    {
      description: "should be false for datetime next year",
      input: {
        isRecurring: false,
        date: "2025-06-01",
        datetime: "2025-06-01T12:00:00",
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDate(tc.input);
      const isTomorrow = info.isCurrentYear();
      expect(isTomorrow).toEqual(tc.expected);
    });
  }
});
