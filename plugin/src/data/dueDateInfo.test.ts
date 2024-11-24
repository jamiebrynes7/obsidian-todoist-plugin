import type { DueDate } from "@/api/domain/dueDate";
import { DueDateInfo } from "@/data/dueDateInfo";
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
  input: DueDate | undefined;
  expected: boolean;
};

describe("hasDueDate", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for empty due date",
      input: undefined,
      expected: false,
    },
    {
      description: "should be true for just date",
      input: {
        recurring: false,
        date: "2024-01-01",
      },
      expected: true,
    },
    {
      description: "should be true for datetime",
      input: {
        recurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDateInfo(tc.input);
      const hasDueDate = info.hasDueDate();
      expect(hasDueDate).toEqual(tc.expected);
    });
  }
});

describe("hasTime", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for empty due date",
      input: undefined,
      expected: false,
    },
    {
      description: "should be false for just date",
      input: {
        recurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for datetime",
      input: {
        recurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDateInfo(tc.input);
      const hasTime = info.hasTime();
      expect(hasTime).toEqual(tc.expected);
    });
  }
});

describe("isToday", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for empty due date",
      input: undefined,
      expected: false,
    },
    {
      description: "should be false for different day",
      input: {
        recurring: false,
        date: "2024-01-02",
      },
      expected: false,
    },
    {
      description: "should be true for same day",
      input: {
        recurring: false,
        date: "2024-01-01",
      },
      expected: true,
    },
    {
      description: "should be true for datetime same day",
      input: {
        recurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDateInfo(tc.input);
      const isToday = info.isToday();
      expect(isToday).toEqual(tc.expected);
    });
  }
});

describe("isOverdue", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for empty due date",
      input: undefined,
      expected: false,
    },
    {
      description: "should be false if date in future",
      input: {
        recurring: false,
        date: "2024-01-02",
      },
      expected: false,
    },
    {
      description: "should be false for same day",
      input: {
        recurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for day in the past",
      input: {
        recurring: false,
        date: "2023-12-15",
      },
      expected: true,
    },
    {
      description: "should be true for same day earlier in the day",
      input: {
        recurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T08:00:00",
      },
      expected: true,
    },
    {
      description: "should be false for same day later in the day",
      input: {
        recurring: false,
        date: "2024-01-01",
        datetime: "2024-01-01T14:00:00",
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDateInfo(tc.input);
      const isOverdue = info.isOverdue();
      expect(isOverdue).toEqual(tc.expected);
    });
  }
});

describe("isTomorrow", () => {
  const testcases: TestCase[] = [
    {
      description: "should be false for empty due date",
      input: undefined,
      expected: false,
    },
    {
      description: "should be false for same day",
      input: {
        recurring: false,
        date: "2024-01-01",
      },
      expected: false,
    },
    {
      description: "should be true for next day",
      input: {
        recurring: false,
        date: "2024-01-02",
      },
      expected: true,
    },
    {
      description: "should be false for any other day",
      input: {
        recurring: false,
        date: "2024-01-03",
      },
      expected: false,
    },
    {
      description: "should be true for datetime tomorrow",
      input: {
        recurring: false,
        date: "2024-01-02",
        datetime: "2024-01-02T12:00:00",
      },
      expected: true,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const info = new DueDateInfo(tc.input);
      const isTomorrow = info.isTomorrow();
      expect(isTomorrow).toEqual(tc.expected);
    });
  }
});

// TODO: Write tests for other is* methods.
