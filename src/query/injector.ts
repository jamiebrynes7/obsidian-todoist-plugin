import { MarkdownRenderChild } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";
import debug from "../log";
import { parseQuery } from "./parser";
import TodoistQuery from "../ui/TodoistQuery.svelte";
import ErrorDisplay from "../ui/ErrorDisplay.svelte";
import type { TodoistAdapter } from "../data";
import { applyReplacements } from "./replacements";
import type { SvelteComponent } from "svelte";

export class QueryInjector {
    private adapater: TodoistAdapter;

    constructor(adapter: TodoistAdapter) {
        this.adapater = adapter;
    }

    onNewBlock(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ) {
        let child: InjectedQuery;

        try {
            const query = parseQuery(source);
            applyReplacements(query, ctx);

            debug({
                msg: "Parsed query",
                context: query,
            });

            child = new InjectedQuery(el, (root: HTMLElement) => {
                return new TodoistQuery({
                    target: root,
                    props: { query: query, todoistAdapter: this.adapater, },
                });
            });
        } catch (e) {
            console.error(e);
            child = new InjectedQuery(el, (root: HTMLElement) => {
                return new ErrorDisplay({ target: root, props: { error: e } });
            });
        }

        ctx.addChild(child);
    }
}

class InjectedQuery extends MarkdownRenderChild {
    private readonly createComp: (root: HTMLElement) => SvelteComponent;
    private component: SvelteComponent;

    constructor(
        container: HTMLElement,
        createComp: (root: HTMLElement) => SvelteComponent
    ) {
        super(container);
        this.createComp = createComp;
        this.containerEl = container;
    }

    onload() {
        this.component = this.createComp(this.containerEl);
    }

    onunload() {
        if (this.component) {
            this.component.$destroy();
        }
    }
}
