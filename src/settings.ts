import { writable } from "svelte/store";
import type {
  Settings,
  App,
  PluginInstance,
  SettingsContainer,
} from "./obsidian";
import { toInt, isPositiveInteger } from "./utils.js";
import type TodoistPlugin from "./plugin";

export const SettingsInstance = writable<ISettings>({
  fadeToggle: true,

  autoRefreshToggle: false,
  autoRefreshInterval: 60,

  renderDate: true,
  renderDateIcon: true,

  renderProject: true,
  renderProjectIcon: true,

  renderLabels: true,
  renderLabelsIcon: true,
});

export interface ISettings {
  fadeToggle: boolean;
  autoRefreshToggle: boolean;
  autoRefreshInterval: number;

  renderDate: boolean;
  renderDateIcon: boolean;

  renderProject: boolean;
  renderProjectIcon: boolean;

  renderLabels: boolean;
  renderLabelsIcon: boolean;
}

export function SettingsTab<TBase extends Settings>(Base: TBase) {
  return class extends Base {
    // This is actually on TBase, but the mixin doesn't allow access without going through the prototype.
    public containerEl: HTMLDivElement;

    private app: App;
    private instance: PluginInstance<ISettings>;
    private plugin: TodoistPlugin<TBase>;
    private settingMgr: SettingManager;

    constructor(...args: any[]) {
      super(...args);

      [this.app, this.instance, this.plugin] = args;
    }

    display() {
      this.settingMgr = new SettingManager(this.containerEl);
      this.settingMgr.empty();

      this.settingMgr.addStaticText({
        name: `Current Version: ${this.plugin.version}`,
        description: "",
        configure: () => {},
      });

      this.fadeAnimationSettings();
      this.autoRefreshSettings();

      this.dateSettings();
      this.projectSettings();
      this.labelsSettings();
    }

    fadeAnimationSettings() {
      this.settingMgr.addToggle({
        name: "Task fade animation",
        description:
          "Whether tasks should fade in and out when added or removed.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.fadeToggle);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.fadeToggle = value));
          });
        },
      });
    }

    autoRefreshSettings() {
      this.settingMgr.addToggle({
        name: "Auto-refresh",
        description: "Whether queries should auto-refresh at a set interval",
        configure: (setting) => {
          setting.setValue(this.plugin.options.autoRefreshToggle);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.autoRefreshToggle = value));
          });
        },
      });

      this.settingMgr.addText({
        name: "Auto-refesh interval",
        description:
          "The interval (in seconds) that queries should auto-refresh by default. Integer numbers only",
        configure: (setting) => {
          setting.setValue(`${this.plugin.options.autoRefreshInterval}`);
          setting.onChange((value) => {
            const newSetting = value.trim();

            if (newSetting.length == 0) {
              return;
            }

            if (isPositiveInteger(newSetting)) {
              this.plugin.writeOptions(
                (old) => (old.autoRefreshInterval = toInt(newSetting))
              );
            } else {
              setting.setValue(`${this.plugin.options.autoRefreshInterval}`);
            }
          });
        },
      });
    }

    dateSettings() {
      this.settingMgr.addToggle({
        name: "Render dates",
        description: "Whether dates should be rendered with tasks.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.renderDate);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.renderDate = value));
          });
        },
      });

      this.settingMgr.addToggle({
        name: "Render date icon",
        description: "Whether rendered dates should include an icon.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.renderDateIcon);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.renderDateIcon = value));
          });
        },
      });
    }

    projectSettings() {
      this.settingMgr.addToggle({
        name: "Render project & section",
        description:
          "Whether projects & sections should be rendered with tasks.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.renderProject);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.renderProject = value));
          });
        },
      });

      this.settingMgr.addToggle({
        name: "Render project & section icon",
        description:
          "Whether rendered projects & sections should include an icon.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.renderProjectIcon);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.renderProjectIcon = value));
          });
        },
      });
    }

    labelsSettings() {
      this.settingMgr.addToggle({
        name: "Render labels",
        description: "Whether labels should be rendered with tasks.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.renderLabels);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.renderLabels = value));
          });
        },
      });
      this.settingMgr.addToggle({
        name: "Render labels icon",
        description: "Whether rendered labels should include an icon.",
        configure: (setting) => {
          setting.setValue(this.plugin.options.renderLabelsIcon);
          setting.onChange((value) => {
            this.plugin.writeOptions((old) => (old.renderLabelsIcon = value));
          });
        },
      });
    }
  };
}

class SettingManager {
  private container: HTMLDivElement;

  constructor(containerEl: HTMLDivElement) {
    this.container = containerEl;
  }

  public empty() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.lastChild);
    }
  }

  public addToggle(config: ISettingConfiguration<ToggleSetting>) {
    const control = this.addSetting(config);
    const toggle = new ToggleSetting(control);
    config.configure(toggle);
  }

  public addText(config: ISettingConfiguration<TextSetting>) {
    const control = this.addSetting(config);
    const text = new TextSetting(control);
    config.configure(text);
  }

  public addStaticText(config: ISettingConfiguration<void>) {
    const control = this.addSetting(config);
  }

  private addSetting<T>(config: ISettingConfiguration<T>): HTMLElement {
    const item = document.createElement("div") as HTMLDivElement;
    item.classList.add("setting-item");
    this.container.append(item);

    const info = document.createElement("div") as HTMLDivElement;
    info.classList.add("setting-item-info");
    item.appendChild(info);

    const name = document.createElement("div") as HTMLDivElement;
    name.classList.add("setting-item-name");
    name.innerText = config.name;
    info.appendChild(name);

    const desc = document.createElement("div") as HTMLDivElement;
    desc.classList.add("setting-item-description");
    desc.innerText = config.description;
    info.appendChild(desc);

    const control = document.createElement("div") as HTMLDivElement;
    control.classList.add("setting-item-control");
    item.appendChild(control);

    return control;
  }
}

interface ISettingConfiguration<TSettings> {
  name: string;
  description: string;
  configure: (settings: TSettings) => void;
}

class ToggleSetting {
  private value: boolean;
  private toggleEl: HTMLDivElement;
  private changeCallback?: (boolean) => void;

  constructor(controlEl: HTMLElement) {
    this.toggleEl = document.createElement("div") as HTMLDivElement;
    this.toggleEl.classList.add("checkbox-container");
    this.toggleEl.addEventListener("click", this.onClick.bind(this));
    controlEl.appendChild(this.toggleEl);
  }

  public getValue(): boolean {
    return this.value;
  }

  public onChange(callback: (boolean) => void) {
    this.changeCallback = callback;
  }

  public setValue(value: boolean) {
    this.value = value;
    if (value) {
      this.toggleEl.classList.add("is-enabled");
    } else {
      this.toggleEl.classList.remove("is-enabled");
    }

    if (this.changeCallback) {
      this.changeCallback(value);
    }
  }

  private onClick() {
    this.setValue(!this.getValue());
  }
}

class TextSetting {
  private inputEl: HTMLInputElement;
  private changeCallback?: (string) => void;

  constructor(controlEl: HTMLElement) {
    this.inputEl = document.createElement("input") as HTMLInputElement;
    this.inputEl.type = "text";
    this.inputEl.addEventListener("input", this.onChanged.bind(this));
    controlEl.appendChild(this.inputEl);
  }

  public getValue(): string {
    return this.inputEl.value;
  }

  public onChange(callback: (string) => void) {
    this.changeCallback = callback;
  }

  public setValue(value: string) {
    this.inputEl.value = value;
  }

  private onChanged() {
    if (this.changeCallback) {
      this.changeCallback(this.inputEl.value);
    }
  }
}
