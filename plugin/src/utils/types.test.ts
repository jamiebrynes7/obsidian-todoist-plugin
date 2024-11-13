import { DeepPartial } from "@/utils/types";
import { describe, expect, it } from "vitest";

type TestObject = {
  a: number;
  b: number;
  nested: {
    c: number;
    nested: {
      d: number;
    };
  };
};

const baseObject: TestObject = {
  a: 1,
  b: 2,
  nested: {
    c: 3,
    nested: {
      d: 4,
    },
  },
};

describe("DeepPartial.merge", () => {
  type Testcase = {
    description: string;
    partial: DeepPartial<TestObject>;
    expected: TestObject;
  };

  const testcases: Testcase[] = [
    {
      description: "should not modify if partial empty",
      partial: {},
      expected: {
        a: 1,
        b: 2,
        nested: {
          c: 3,
          nested: {
            d: 4,
          },
        },
      },
    },
    {
      description: "should modify top-level properties",
      partial: { a: 10 },
      expected: {
        a: 10,
        b: 2,
        nested: {
          c: 3,
          nested: {
            d: 4,
          },
        },
      },
    },
    {
      description: "should modify nested properties",
      partial: { nested: { c: 30 } },
      expected: {
        a: 1,
        b: 2,
        nested: {
          c: 30,
          nested: {
            d: 4,
          },
        },
      },
    },
    {
      description: "should modify deeply nested properties",
      partial: { nested: { nested: { d: 10 } } },
      expected: {
        a: 1,
        b: 2,
        nested: {
          c: 3,
          nested: {
            d: 10,
          },
        },
      },
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const result = DeepPartial.merge(baseObject, tc.partial);
      expect(result).toEqual(tc.expected);
    });
  }
});
describe("DeepPartial.isComplete", () => {
  type Testcase = {
    description: string;
    partial: DeepPartial<TestObject>;
    expected: boolean;
  };

  const testcases: Testcase[] = [
    {
      description: "should return true for a complete partial object",
      partial: {
        a: 10,
        b: 20,
        nested: {
          c: 30,
          nested: {
            d: 40,
          },
        },
      },
      expected: true,
    },
    {
      description: "should return false when a top-level property is missing",
      partial: {
        a: 10,
        nested: {
          c: 30,
          nested: {
            d: 40,
          },
        },
      },
      expected: false,
    },
    {
      description: "should return false when a nested property is missing",
      partial: {
        a: 10,
        b: 20,
        nested: {
          nested: {
            d: 40,
          },
        },
      },
      expected: false,
    },
    {
      description: "should return false when a deeply nested property is missing",
      partial: {
        a: 10,
        b: 20,
        nested: {
          c: 30,
          nested: {},
        },
      },
      expected: false,
    },
  ];

  for (const tc of testcases) {
    it(tc.description, () => {
      const result = DeepPartial.isComplete(baseObject, tc.partial);
      expect(result).toBe(tc.expected);
    });
  }
});
