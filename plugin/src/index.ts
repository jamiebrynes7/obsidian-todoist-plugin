import { App, Plugin } from "obsidian";
import type { PluginManifest } from "obsidian";
import "../styles.css";
import { TodoistApiClient } from "./api";
import { ObsidianFetcher } from "./api/fetcher";
import { registerCommands } from "./commands";
import debug from "./log";
import { QueryInjector } from "./query/injector";
import { type Services, makeServices } from "./services";
import { settings } from "./settings";
import { type ISettings, defaultSettings } from "./settings";
import { SettingsTab } from "./ui/settings";

export default class TodoistPlugin extends Plugin {
  public options: ISettings;

  public readonly services: Services;

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);
    this.options = { ...defaultSettings };
    this.services = makeServices(this);

    settings.subscribe((value) => {
      debug({
        msg: "Settings changed",
        context: value,
      });

      this.options = value;
    });
  }

  async onload() {
    const queryInjector = new QueryInjector(this);
    this.registerMarkdownCodeBlockProcessor(
      "todoist",
      queryInjector.onNewBlock.bind(queryInjector),
    );
    this.addSettingTab(new SettingsTab(this.app, this));

    registerCommands(this);

    await this.loadOptions();
    await this.loadApiClient();
  }

  private async loadApiClient(): Promise<void> {
    const accessor = this.services.token;

    if (await accessor.exists()) {
      const token = await accessor.read();
      await this.services.todoist.initialize(new TodoistApiClient(token, new ObsidianFetcher()));
      return;
    }

    this.services.modals.onboarding({
      onTokenSubmit: async (token) => {
        await accessor.write(token);
        await this.services.todoist.initialize(new TodoistApiClient(token, new ObsidianFetcher()));
      },
    });
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
