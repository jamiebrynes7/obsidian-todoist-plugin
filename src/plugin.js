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
    this.intervalId = setInterval(this.injectQueries, 1000);
  }

  onDisable() {
    clearInterval(this.intervalId);
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
      
      new TodoistQuery({
        target: root,
        props: {
          query: query,
          token: token,
        }
      });
    }
  }
}