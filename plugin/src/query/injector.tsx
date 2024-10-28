import type TodoistPlugin from "@/index";
import debug from "@/log";
import { parseQuery } from "@/query/parser";
import { applyReplacements } from "@/query/replacements";
import {
  type MarkdownEditButton,
  MarkdownEditButtonContext,
  PluginContext,
  RenderChildContext,
} from "@/ui/context";
import { QueryError } from "@/ui/query/QueryError";
import { QueryRoot } from "@/ui/query/QueryRoot";
import { MarkdownRenderChild } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";
import type React from "react";
import { type Root, createRoot } from "react-dom/client";
import { type StoreApi, type UseBoundStore, create } from "zustand";

export class QueryInjector {
  private readonly plugin: TodoistPlugin;
  constructor(plugin: TodoistPlugin) {
    this.plugin = plugin;
  }

  onNewBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    let child: MarkdownRenderChild;

    try {
      const [query, warnings] = parseQuery(source);
      applyReplacements(query, ctx);

      debug({
        msg: "Parsed query",
        context: query,
      });

      child = new ReactRenderer(el, this.plugin, QueryRoot, { query, warnings }, true);
    } catch (e) {
      console.error(e);
      child = new ReactRenderer(el, this.plugin, QueryError, { error: e }, false);
    }

    ctx.addChild(child);
  }
}

class ReactRenderer<T extends {}> extends MarkdownRenderChild {
  private readonly plugin: TodoistPlugin;
  private readonly props: T;
  private readonly component: React.FC<T>;
  private readonly reactRoot: Root;

  private readonly observer: MutationObserver;

  private readonly store: UseBoundStore<StoreApi<MarkdownEditButton>>;

  constructor(
    container: HTMLElement,
    plugin: TodoistPlugin,
    component: React.FC<T>,
    props: T,
    interceptEditButton: boolean,
  ) {
    super(container);
    this.plugin = plugin;
    this.component = component;
    this.props = props;
    this.reactRoot = createRoot(this.containerEl);
    this.store = create(() => {
      return { click: () => {} };
    });

    this.observer = new MutationObserver((mutations) => {
      if (!interceptEditButton) {
        return;
      }

      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof HTMLElement) {
            if (addedNode.classList.contains("edit-block-button")) {
              addedNode.hide();
              this.store.setState({ click: () => addedNode.click() });
              return;
            }
          }
        }
      }
    });
  }

  onload(): void {
    if (this.containerEl.parentElement !== null) {
      this.observer.observe(this.containerEl.parentElement, { childList: true });
    }

    const Component = this.component;
    this.reactRoot.render(
      <MarkdownEditButtonContext.Provider value={this.store}>
        <RenderChildContext.Provider value={this}>
          <PluginContext.Provider value={this.plugin}>
            <Component {...this.props} />
          </PluginContext.Provider>
        </RenderChildContext.Provider>
      </MarkdownEditButtonContext.Provider>,
    );
  }

  onunload(): void {
    this.reactRoot.unmount();
    this.observer.disconnect();
  }
}
