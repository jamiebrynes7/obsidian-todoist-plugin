import TodoistQuery from "./ui/TodoistQuery.svelte";
import ErrorDisplay from "./ui/ErrorDisplay.svelte";
import { parseQuery } from "./query";
import { SettingsInstance, ISettings, SettingsTab } from "./settings";
import { TodoistApi } from "./api/api";
import debug from "./log";
import type SvelteComponentDev from "./ui/TodoistQuery.svelte";
import { App, Plugin, PluginManifest } from "obsidian";
import TodoistApiTokenModal from "./token_modal";

const proc = require("process");

interface IInjection {
  component: SvelteComponentDev;
  workspaceLeaf: Node;
}

export default class TodoistPlugin extends Plugin {
  public options: ISettings;

  private api: TodoistApi;

  private observer: MutationObserver;
  private injections: IInjection[];

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);

    this.options = null;
    this.api = null;

    // TODO: This leaks a subscription. Does JS have destructors?
    SettingsInstance.subscribe((value) => {
      debug({
        msg: "Settings changed",
        context: value,
      });

      this.options = value;
    });

    this.observer = null;
    this.injections = [];
  }

  async onload() {
    this.addSettingTab(new SettingsTab(this.app, this));
    this.addCommand({
      id: "todoist-refresh-metadata",
      name: "Todoist: Refresh Metadata",
      callback: async () => {
        if (this.api != null) {
          debug("Refreshing metadata");
          const result = await this.api.fetchMetadata();

          if (result.isErr()) {
            console.error(result.unwrapErr());
          }
        }
      },
    });

    let pathSep = "/";

    if (proc.platform == "win32") {
      pathSep = "\\";
    }

    const tokenPath = `.obsidian${pathSep}todoist-token`;
    try {
      const token = await this.app.vault.adapter.read(tokenPath);
      this.api = new TodoistApi(token);
    } catch (e) {
      var token = await new TodoistApiTokenModal(this.app).Result;

      if (token.length == 0) {
        alert(
          "Provided token was empty, please enter it in the settings and restart Obsidian."
        );
        return;
      }

      await this.app.vault.adapter.write(tokenPath, token, () => true);
      this.api = new TodoistApi(token);
    }

    const result = await this.api.fetchMetadata();

    if (result.isErr()) {
      console.error(result.unwrapErr());
    }

    await this.loadOptions();

    // TODO: Find more elegant way of finding DOM entries. A hook of some kind?
    this.registerInterval(
      window.setInterval(this.injectQueries.bind(this), 1000)
    );

    // We need to manually call destroy on the injected Svelte components when they are removed.
    this.observer = new MutationObserver((mutations, observer) => {
      if (this.injections.length == 0) {
        return;
      }

      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((removed) => {
          const removedIndex = this.injections.findIndex(
            (ele) => ele.workspaceLeaf == removed
          );

          if (removedIndex == -1) {
            return;
          }

          const { workspaceLeaf, component } = this.injections[removedIndex];

          debug({
            msg: "Removing mounted Svelte component",
            context: {
              root: workspaceLeaf,
              component: component,
            },
          });

          this.injections.splice(removedIndex, 1);
          component.$destroy();
        });
      });
    });

    const workspaceRoot = document.getElementsByClassName("workspace")[0];
    this.observer.observe(workspaceRoot, { childList: true, subtree: true });
  }

  onunload() {
    this.observer.disconnect();
    this.observer = null;

    this.injections.forEach((injection) => injection.component.$destroy());
    this.injections = [];
  }

  injectQueries() {
    if (this.api == null) {
      return;
    }

    const nodes = document.querySelectorAll<HTMLPreElement>(
      'pre[class*="language-todoist"]'
    );

    for (var i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      debug({
        msg: "Found Todoist query.",
        context: node,
      });

      const query = parseQuery(JSON.parse(node.innerText));

      debug({
        msg: "Parsed query",
        context: query,
      });

      const root = node.parentElement;
      root.removeChild(node);

      let queryNode: SvelteComponentDev = null;

      if (query.isOk()) {
        queryNode = new TodoistQuery({
          target: root,
          props: {
            query: query.unwrap(),
            api: this.api,
          },
        });
      } else {
        queryNode = new ErrorDisplay({
          target: root,
          props: {
            error: query.unwrapErr(),
          },
        });
      }

      const workspaceLeaf = root.closest(".workspace-leaf");
      workspaceLeaf.classList.add("contains-todoist-query");

      const injection = {
        component: queryNode,
        workspaceLeaf: workspaceLeaf,
      };

      debug({
        msg: "Injected Todoist query.",
        context: injection,
      });

      this.injections.push(injection);
    }
  }

  async loadOptions(): Promise<void> {
    const options = await this.loadData();

    SettingsInstance.update((old) => {
      return {
        ...old,
        ...(options || {}),
      };
    });

    await this.saveData(this.options);
  }

  async writeOptions(changeOpts: (settings: ISettings) => void): Promise<void> {
    SettingsInstance.update((old) => {
      changeOpts(old);
      return old;
    });
    await this.saveData(this.options);
  }
}
