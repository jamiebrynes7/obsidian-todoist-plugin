import { App, Notice, Plugin } from "obsidian";
import type { PluginManifest } from "obsidian";
import "../styles.css";
import { TodoistApiClient } from "./api";
import { ObsidianFetcher } from "./api/fetcher";
import { TodoistAdapter } from "./data";
import debug from "./log";
import CreateTaskModal from "./modals/createTask/createTaskModal";
import { QueryInjector } from "./query/injector";
import { settings } from "./settings";
import { type ISettings, defaultSettings } from "./settings";
import { VaultTokenAccessor } from "./token";
import { OnboardingModal } from "./ui/onboardingModal";
import { SettingsTab } from "./ui/settings";

type Services = {
  todoist: TodoistAdapter;
  tokenAccessor: VaultTokenAccessor;
};

export default class TodoistPlugin extends Plugin {
  public options: ISettings;

  public readonly services: Services;

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);
    this.options = { ...defaultSettings };
    this.services = {
      todoist: new TodoistAdapter(),
      tokenAccessor: new VaultTokenAccessor(this.app.vault),
    };

    settings.subscribe((value) => {
      debug({
        msg: "Settings changed",
        context: value,
      });

      this.options = value;
    });
  }

  async onload() {
    const queryInjector = new QueryInjector(this.services.todoist);
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
        this.services.todoist.sync();
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

        new CreateTaskModal(this.app, this.services.todoist, this.options, false);
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

        new CreateTaskModal(this.app, this.services.todoist, this.options, true);
      },
    });

    await this.loadOptions();
    await this.loadApiClient();
  }

  private async loadApiClient(): Promise<void> {
    const accessor = this.services.tokenAccessor;

    if (await accessor.exists()) {
      const token = await accessor.read();
      await this.services.todoist.initialize(new TodoistApiClient(token, new ObsidianFetcher()));
      return;
    }

    new OnboardingModal(this.app, async (token) => {
      await accessor.write(token);
      await this.services.todoist.initialize(new TodoistApiClient(token, new ObsidianFetcher()));
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
