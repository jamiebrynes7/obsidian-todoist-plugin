import TodoistQuery from "./TodoistQuery.svelte";
import { Settings } from "./settings";
import { TodoistApi } from "./api";

export default class TodoistPlugin {
  constructor(createSettingsFunc) {
    this.id = "todoist-query-renderer";
    this.name = "Todoist";
    this.description = "Materialize Todoist queries in an Obsidian note.";
    this.defaultOn = true;

    this.app = null;
    this.instance = null;
    this.options = {};
    this.api = null;

    // TODO: This leaks a subscription. Does JS have destructors?
    Settings.subscribe(value => { this.options = value});

    this.observer = [];
    this.injections = [];

    this.createSettingsFunc = createSettingsFunc;
  }

  init(app, instance) {
    this.app = app;
    this.instance = instance;

    this.instance.registerSettingTab(this.createSettingsFunc(app, instance, this));

    // Read in Todoist API token.
    const fs = app.vault.adapter.fs;
    const path = app.vault.adapter.path;
    const basePath = app.vault.adapter.basePath;

    const tokenPath = path.join(basePath, ".obsidian", "todoist-token");
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath).toString('utf-8');
      this.api = new TodoistApi(token);
    }
    else {
      alert(`Could not load Todoist token at: ${tokenPath}`)
    }
  }

  async onEnable() {
    await this.loadOptions();
    // TODO: Find more elegant way of finding DOM entries. A hook of some kind?
    this.intervalId = setInterval(this.injectQueries.bind(this), 1000);

    // We need to manually call destroy on the injected Svelte components when they are removed.
    this.observer = new MutationObserver((mutations, observer) => {
      if (this.injections.length == 0) {
        return;
      }
      
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach(removed => {
          const removedIndex = this.injections.findIndex((ele) => ele.workspaceLeaf == removed);

          if (removedIndex == -1) { 
            return;
          }

          const { workspaceLeaf, component } = this.injections[removedIndex];
          this.injections.splice(removedIndex, 1);
          component.$destroy();
        });
      })
    });

    const workspaceRoot = document.getElementsByClassName("workspace")[0];
    this.observer.observe(workspaceRoot, { childList: true, subtree: true})
  }

  onDisable() {
    clearInterval(this.intervalId);

    this.observer.disconnect();
    this.observer = null;

    this.injections.forEach(injection => injection.component.$destroy());
    this.injections = [];
  }

  injectQueries() {
    if (this.api == null) {
      return;
    }

    const nodes = document.querySelectorAll('pre[class*="language-todoist"]');

    for (var i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // TODO: Error handling.
      const query = JSON.parse(node.innerText);
      
      const root = node.parentElement;
      root.removeChild(node);
      
      const queryNode = new TodoistQuery({
        target: root,
        props: {
          query: query,
          api: this.api,
        }
      });

      this.injections.push({component: queryNode, workspaceLeaf: root.closest(".workspace-leaf")});
    }
  }

  async loadOptions() {
    const options = await this.instance.loadData();

    Settings.update(old => {
      return { 
        ...old, 
        ...(options || {})
      };
    });

    this.instance.saveData(this.options);
  }

  writeOptions(changeOpts) {
    Settings.update((old) => {
      changeOpts(old);
      return old;
    });
    this.instance.saveData(this.options);
  }
}