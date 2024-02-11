import { describe, it, expect } from "vitest";
import { applyReplacements } from "./replacements";
import type { Query } from "./query";
import type { MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownSectionInformation } from "obsidian";


class FakeContext implements MarkdownPostProcessorContext {
    docId: string = "";
    sourcePath: string;
    frontmatter: any | null | undefined;

    constructor(sourcePath: string) { this.sourcePath = sourcePath; }

    addChild(child: MarkdownRenderChild): void { }
    getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null { return null; }
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
                expectedFilter: "#Project & /section"
            },
            {
                description: "should replace {{filename}} with base file name",
                filter: "#{{filename}}",
                filePath: "Foobar.md",
                expectedFilter: "#Foobar"
            },
            {
                description: "should only use the file name",
                filter: "#{{filename}}",
                filePath: "some/path/to/foobar.md",
                expectedFilter: "#foobar"
            }
        ];

        for (const tc of testcases) {
            it(tc.description, () => {
                const query: Query = {
                    name: "",
                    filter: tc.filter,
                    autorefresh: 0,
                    group: false,
                    sorting: [],
                    show: new Set(),
                };

                applyReplacements(query, new FakeContext(tc.filePath ?? ""));

                expect(query.filter).toBe(tc.expectedFilter);
            });
        }
    });
});
