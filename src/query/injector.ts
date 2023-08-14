import { App, MarkdownRenderChild } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";
import type { TodoistApi } from "../api/api";
import debug from "../log";
import { parseQuery } from "./parser";
import TodoistQuery from "../ui/TodoistQuery.svelte";
import ErrorDisplay from "../ui/ErrorDisplay.svelte";
import type { SvelteComponentDev } from "svelte/internal";

export class QueryInjector {
  private api: TodoistApi;
  private app: App;
  private pendingQueries: PendingQuery[];

  constructor(app: App) {
    this.app = app;
    this.pendingQueries = [];
  }

  onNewBlock(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) {
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
    let child: InjectedQuery;

    try {
      const query = parseQuery(pendingQuery);

      debug({
        msg: "Parsed query",
        context: query,
      });

      child = new InjectedQuery(pendingQuery.target, (root: HTMLElement) => {
        return new TodoistQuery({
          target: root,
          props: { query: query, api: this.api, app: this.app },
        });
      });
    } catch (e) {
      console.error(e);
      child = new InjectedQuery(pendingQuery.target, (root: HTMLElement) => {
        return new ErrorDisplay({ target: root, props: { error: e } });
      });
    }

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
