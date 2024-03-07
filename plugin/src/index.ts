import { App, Notice, Plugin, requestUrl } from "obsidian";
import type { PluginManifest } from "obsidian";
import "../styles.css";
import { TodoistApiClient } from "./api";
import {
  ObsidianFetcher,
  type RequestParams,
  type WebFetcher,
  type WebResponse,
} from "./api/fetcher";
import { TodoistAdapter } from "./data";
import debug from "./log";
import CreateTaskModal from "./modals/createTask/createTaskModal";
import TodoistApiTokenModal from "./modals/enterToken/enterTokenModal";
import { QueryInjector } from "./query/injector";
import { SettingsTab, settings } from "./settings";
import type { ISettings } from "./settings";
import { VaultTokenAccessor } from "./token";
import { OnboardingModal } from "./ui/onboardingModal";

export default class TodoistPlugin extends Plugin {
  public options: ISettings | null;

  private todoistAdapter: TodoistAdapter = new TodoistAdapter();

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);
    this.options = null;

    settings.subscribe((value) => {
      debug({
        msg: "Settings changed",
        context: value,
      });

      this.options = value;
    });
  }

  async onload() {
    const queryInjector = new QueryInjector(this.todoistAdapter);
    this.registerMarkdownCodeBlockProcessor(
      "todoist",
      queryInjector.onNewBlock.bind(queryInjector),
    );
    this.addSettingTab(new SettingsTab(this.app, this));

    this.addCommand({
      id: "todoist-sync",
      name: "Sync with Todoist",
      callback: async () => {
        debug("Syncing with Todoist API");
        this.todoistAdapter.sync();
      },
    });

    this.addCommand({
      id: "todoist-add-task",
      name: "Add Todoist task",
      callback: () => {
        if (this.options === null) {
          new Notice("Failed to load settings, cannot open task creation modal.");
          return;
        }

        new CreateTaskModal(this.app, this.todoistAdapter, this.options, false);
      },
    });

    this.addCommand({
      id: "todoist-add-task-current-page",
      name: "Add Todoist task with the current page",
      callback: () => {
        if (this.options === null) {
          new Notice("Failed to load settings, cannot open task creation modal.");
          return;
        }

        new CreateTaskModal(this.app, this.todoistAdapter, this.options, true);
      },
    });

    await this.loadOptions();
    await this.loadApiClient();
  }

  private async loadApiClient(): Promise<void> {
    const accessor = new VaultTokenAccessor(this.app.vault);

    if (await accessor.exists()) {
      const token = await accessor.read();
      await this.todoistAdapter.initialize(new TodoistApiClient(token, new ObsidianFetcher()));
      return;
    }

    new OnboardingModal(this.app, async (token) => {
      await accessor.write(token);
      await this.todoistAdapter.initialize(new TodoistApiClient(token, new ObsidianFetcher()));
    }).open();
  }
  async loadOptions(): Promise<void> {
    const options = await this.loadData();

    settings.update((old) => {
      return {
        ...old,
        ...(options || {}),
      };
    });

    await this.saveData(this.options);
  }

  async writeOptions(changeOpts: (settings: ISettings) => void): Promise<void> {
    settings.update((old) => {
      changeOpts(old);
      return old;
    });
    await this.saveData(this.options);
  }
}
