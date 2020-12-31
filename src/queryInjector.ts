import {
  Component,
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
} from "obsidian";
import type { TodoistApi } from "./api/api";
import debug from "./log";
import IQuery, { parseQuery } from "./query";
import { Result } from "./result";
import TodoistQuery from "./ui/TodoistQuery.svelte";
import ErrorDisplay from "./ui/ErrorDisplay.svelte";
import type SvelteComponentDev from "./ui/TodoistQuery.svelte";

export default class QueryInjector {
  private api: TodoistApi;
  private pendingQueries: PendingQuery[];

  constructor() {
    this.pendingQueries = [];
  }

  onNewBlock(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const node = el.querySelector<HTMLPreElement>(
      'pre[class*="language-todoist"]'
    );

    if (!node) {
      return;
    }

    debug({
      msg: "Found Todoist query.",
      context: node,
    });

    const pendingQuery = {
      node: node,
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
      query = parseQuery(JSON.parse(pendingQuery.node.innerText));
    } catch (e) {
      query = Result.Err(new Error(`Query was not valid JSON: ${e.message}.`));
    }

    debug({
      msg: "Parsed query",
      context: query,
    });

    const root = pendingQuery.node.parentElement;
    root.removeChild(pendingQuery.node);

    const child = new InjectedQuery(root, (root: HTMLElement) => {
      if (query.isOk()) {
        return new TodoistQuery({
          target: root,
          props: {
            query: query.unwrap(),
            api: this.api,
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

    // TODO: Inherit from MarkdownRenderChild when its exported.
    pendingQuery.ctx.addChild((child as unknown) as MarkdownRenderChild);
  }
}

interface PendingQuery {
  node: HTMLPreElement;
  ctx: MarkdownPostProcessorContext;
}

class InjectedQuery extends Component {
  private readonly containerEl: HTMLElement;
  private readonly createComp: (root: HTMLElement) => SvelteComponentDev;
  private component: SvelteComponentDev;

  constructor(
    container: HTMLElement,
    createComp: (root: HTMLElement) => SvelteComponentDev
  ) {
    super();
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
