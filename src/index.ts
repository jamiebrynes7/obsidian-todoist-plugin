import { SettingsInstance, ISettings, SettingsTab } from "./settings";
import { TodoistApi } from "./api/api";
import debug from "./log";
import { App, Plugin, PluginManifest } from "obsidian";
import TodoistApiTokenModal from "./modals/enterToken/enterTokenModal";
import { getCurrentPageMdLink, getTokenPath } from "./utils";
import CreateTaskModal from "./modals/createTask/createTaskModal";
import QueryInjector from "./queryInjector";

export default class TodoistPlugin extends Plugin {
  public options: ISettings;

  private api: TodoistApi;

  private readonly queryInjector: QueryInjector;

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);

    this.options = null;
    this.api = null;

    SettingsInstance.subscribe((value) => {
      debug({
        msg: "Settings changed",
        context: value,
      });

      this.options = value;
    });

    this.queryInjector = new QueryInjector();
  }

  async onload() {
    this.registerMarkdownPostProcessor(
      this.queryInjector.onNewBlock.bind(this.queryInjector)
    );
    this.addSettingTab(new SettingsTab(this.app, this));

    this.addCommand({
      id: "todoist-refresh-metadata",
      name: "Refresh Metadata",
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

    this.addCommand({
      id: "todoist-add-task",
      name: "Add Todoist task",
      callback: () => {
        new CreateTaskModal(
          this.app,
          this.api,
          window.getSelection().toString()
        );
      },
    });

    this.addCommand({
      id: "todoist-add-task-current-page",
      name: "Add Todoist task with the current page",
      callback: () => {
        const currentSelection = window.getSelection().toString();
        new CreateTaskModal(
          this.app,
          this.api,
          `${currentSelection} ${getCurrentPageMdLink(this.app)}`,
          currentSelection.length
        );
      },
    });

    const tokenPath = getTokenPath();
    try {
      const token = await this.app.vault.adapter.read(tokenPath);
      this.api = new TodoistApi(token);
    } catch (e) {
      const tokenModal = new TodoistApiTokenModal(this.app);
      await tokenModal.waitForClose;
      const token = tokenModal.token;

      if (token.length == 0) {
        alert(
          "Provided token was empty, please enter it in the settings and restart Obsidian."
        );
        return;
      }

      await this.app.vault.adapter.write(tokenPath, token, () => true);
      this.api = new TodoistApi(token);
    }

    this.queryInjector.setApi(this.api);

    const result = await this.api.fetchMetadata();

    if (result.isErr()) {
      console.error(result.unwrapErr());
    }

    await this.loadOptions();
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
