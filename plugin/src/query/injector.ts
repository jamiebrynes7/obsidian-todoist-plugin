import { MarkdownRenderChild } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";
import type { SvelteComponent } from "svelte";
import type TodoistPlugin from "..";
import debug from "../log";
import ErrorDisplay from "../ui/ErrorDisplay.svelte";
import TodoistQuery from "../ui/TodoistQuery.svelte";
import { parseQuery } from "./parser";
import { applyReplacements } from "./replacements";

export class QueryInjector {
  private readonly plugin: TodoistPlugin;
  constructor(plugin: TodoistPlugin) {
    this.plugin = plugin;
  }

  onNewBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    let child: InjectedQuery;

    try {
      const query = parseQuery(source);
      applyReplacements(query, ctx);

      debug({
        msg: "Parsed query",
        context: query,
      });

      // TODO: wire in component from Context

      child = new InjectedQuery(el, (root: HTMLElement) => {
        return new TodoistQuery({
          target: root,
          props: {
            query: query,
            plugin: this.plugin,
          },
        });
      });
    } catch (e) {
      console.error(e);
      child = new InjectedQuery(el, (root: HTMLElement) => {
        return new ErrorDisplay({ target: root, props: { error: e as string } });
      });
    }

    ctx.addChild(child);
  }
}

class InjectedQuery extends MarkdownRenderChild {
  private readonly createComp: (root: HTMLElement) => SvelteComponent;
  private component: SvelteComponent | undefined = undefined;

  constructor(container: HTMLElement, createComp: (root: HTMLElement) => SvelteComponent) {
    super(container);
    this.createComp = createComp;
    this.containerEl = container;
  }

  onload() {
    this.component = this.createComp(this.containerEl);
  }

  onunload() {
    if (this.component !== undefined) {
      this.component.$destroy();
    }
  }
}
