import type { MarkdownPostProcessorContext } from "obsidian";
import type { Query } from "./query";

export function applyReplacements(query: Query, ctx: MarkdownPostProcessorContext) {
    // Replace {filename} with the base file name of file where the query originated.
    const baseFileName = ctx.sourcePath.replace(/.*\//, '').replace(/\.md$/i, '');
    query.filter = query.filter.replace(/{{filename}}/g, baseFileName);
}
