import {
    App,
    MarkdownRenderChild,
} from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";
import type { TodoistApi } from "./api/api";
import debug from "./log";
import type IQuery from "./query";
import { parseQuery } from "./query";
import { Result } from "./result";
import TodoistQuery from "./ui/TodoistQuery.svelte";
import ErrorDisplay from "./ui/ErrorDisplay.svelte";
import type { SvelteComponentDev } from "svelte/internal";

export default class QueryInjector {
    private api: TodoistApi;
    private app: App;
    private pendingQueries: PendingQuery[];

    constructor(app: App) {
        this.app = app;
        this.pendingQueries = [];
    }

    onNewBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const pendingQuery = {
            source: source,
            target: el,
            ctx: ctx,
        };

        if (typeof this.api == "undefined") {
            this.pendingQueries.push(pendingQuery);
            return;
        }

        this.injectQuery(pendingQuery);
    }

    setApi(api: TodoistApi) {
        this.api = api;

        while (this.pendingQueries.length > 0) {
            this.injectQuery(this.pendingQueries[0]);
            this.pendingQueries.splice(0, 1);
        }
    }

    injectQuery(pendingQuery: PendingQuery) {
        let query: Result<IQuery, Error> = null;

        try {
            query = parseQuery(JSON.parse(pendingQuery.source));
        } catch (e) {
            query = Result.Err(new Error(`Query was not valid JSON: ${e.message}.`));
        }

        debug({
            msg: "Parsed query",
            context: query,
        });

        const child = new InjectedQuery(pendingQuery.target, (root: HTMLElement) => {
            if (query.isOk()) {
                return new TodoistQuery({
                    target: root,
                    props: {
                        query: query.unwrap(),
                        api: this.api,
                        app: this.app,
                    },
                });
            } else {
                return new ErrorDisplay({
                    target: root,
                    props: {
                        error: query.unwrapErr(),
                    },
                });
            }
        });

        pendingQuery.ctx.addChild(child);
    }
}

interface PendingQuery {
    source: string;
    target: HTMLElement;
    ctx: MarkdownPostProcessorContext;
}

class InjectedQuery extends MarkdownRenderChild {
    private readonly createComp: (root: HTMLElement) => SvelteComponentDev;
    private component: SvelteComponentDev;

    constructor(
        container: HTMLElement,
        createComp: (root: HTMLElement) => SvelteComponentDev
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
