import TodoistQuery from "./TodoistQuery.svelte";

let token = null;

export default class TodoistPlugin {
  constructor() {
    this.id = "todoist-query-renderer";
    this.name = "Todoist";
    this.description = "Materialize Todoist queries in an Obsidian note.";
    this.defaultOn = true;

    this.app = null;
    this.instance = null;

    this.observer = [];
    this.injections = [];
  }

  init(app, instance) {
    this.app = app;
    this.instance = instance;

    // Read in Todoist API token.
    const fs = app.vault.adapter.fs;
    const path = app.vault.adapter.path;
    const basePath = app.vault.adapter.basePath;

    const tokenPath = path.join(basePath, ".obsidian", "todoist-token");
    if (fs.existsSync(tokenPath)) {
      token = fs.readFileSync(tokenPath).toString('utf-8');
    }
    else {
      alert(`Could not load Todoist token at: ${tokenPath}`)
    }
  }

  onEnable() {
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
    if (token == null) {
      console.log("No token!");
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
          token: token,
        }
      });

      this.injections.push({component: queryNode, workspaceLeaf: root.closest(".workspace-leaf")});
    }
  }
}