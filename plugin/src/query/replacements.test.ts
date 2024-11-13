import { GroupVariant, type Query } from "@/query/query";
import { applyReplacements } from "@/query/replacements";
import type {
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  MarkdownSectionInformation,
} from "obsidian";
import { describe, expect, it } from "vitest";

class FakeContext implements MarkdownPostProcessorContext {
  docId = "";
  sourcePath: string;
  // biome-ignore lint/suspicious/noExplicitAny: This is part of the interface, so we should respect it.
  frontmatter: any | null | undefined;

  constructor(sourcePath: string) {
    this.sourcePath = sourcePath;
  }

  addChild(child: MarkdownRenderChild): void {}
  getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null {
    return null;
  }
}

type TestCase = {
  description: string;
  filter: string;
  filePath?: string;
  expectedFilter: string;
};

describe("applyReplacements", () => {
  describe("{{filename}}", () => {
    const testcases: TestCase[] = [
      {
        description: "should not modify filter if '{{filename}}' not present",
        filter: "#Project & /section",
        expectedFilter: "#Project & /section",
      },
      {
        description: "should replace {{filename}} with base file name",
        filter: "#{{filename}}",
        filePath: "Foobar.md",
        expectedFilter: "#Foobar",
      },
      {
        description: "should only use the file name",
        filter: "#{{filename}}",
        filePath: "some/path/to/foobar.md",
        expectedFilter: "#foobar",
      },
    ];

    for (const tc of testcases) {
      it(tc.description, () => {
        const query: Query = {
          name: "",
          filter: tc.filter,
          autorefresh: 0,
          groupBy: GroupVariant.None,
          sorting: [],
          show: new Set(),
        };

        applyReplacements(query, new FakeContext(tc.filePath ?? ""));

        expect(query.filter).toBe(tc.expectedFilter);
      });
    }
  });
});
