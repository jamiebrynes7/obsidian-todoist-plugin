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
    public containerEl: SettingsContainer;

    private app: App;
    private instance: PluginInstance<ISettings>;
    private plugin: TodoistPlugin<TBase>;

    constructor(...args: any[]) {
      super(...args);
      [this.app, this.instance, this.plugin] = args;
    }

    display() {
      this.containerEl.empty();

      this.fadeAnimationSettings();
      this.autoRefreshSettings();

      this.dateSettings();
      this.projectSettings();
      this.labelsSettings();
    }

    fadeAnimationSettings() {
      const fadeToggle = this.addToggleSetting(
        "Task fade animation",
        "Whether tasks should fade in and out when added or removed."
      );
      fadeToggle.setValue(this.plugin.options.fadeToggle);
      fadeToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.fadeToggle = fadeToggle.getValue())
        );
      });
    }

    autoRefreshSettings() {
      const autoRefreshToggle = this.addToggleSetting(
        "Auto-refresh",
        "Whether queries should auto-refresh at a set interval."
      );
      autoRefreshToggle.setValue(this.plugin.options.autoRefreshToggle);
      autoRefreshToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.autoRefreshToggle = autoRefreshToggle.getValue())
        );
      });

      const autoRefreshInterval = this.addTextSetting(
        "Auto-refresh interval",
        "The interval (in seconds) that queries should auto-refresh by default. Integer numbers only"
      );
      autoRefreshInterval.setValue(
        `${this.plugin.options.autoRefreshInterval}`
      );
      autoRefreshInterval.onChange(() => {
        const newSetting = autoRefreshInterval.getValue().trim();

        if (newSetting.length == 0) {
          return;
        }

        if (isPositiveInteger(newSetting)) {
          this.plugin.writeOptions(
            (old) => (old.autoRefreshInterval = toInt(newSetting))
          );
        } else {
          autoRefreshInterval.setValue(
            `${this.plugin.options.autoRefreshInterval}`
          );
        }
      });
    }

    dateSettings() {
      const renderDateToggle = this.addToggleSetting(
        "Render dates",
        "Whether dates should be rendered with tasks."
      );
      renderDateToggle.setValue(this.plugin.options.renderDate);
      renderDateToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.renderDate = renderDateToggle.getValue())
        );
      });

      const renderDateIconToggle = this.addToggleSetting(
        "Render date icon",
        "Whether rendered dates should include an icon."
      );
      renderDateIconToggle.setValue(this.plugin.options.renderDateIcon);
      renderDateIconToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.renderDateIcon = renderDateIconToggle.getValue())
        );
      });
    }

    projectSettings() {
      const renderProjectToggle = this.addToggleSetting(
        "Render project & section",
        "Whether projects & sections should be rendered with tasks."
      );
      renderProjectToggle.setValue(this.plugin.options.renderProject);
      renderProjectToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.renderProject = renderProjectToggle.getValue())
        );
      });

      const renderProjectIconToggle = this.addToggleSetting(
        "Render project & section icon",
        "Whether rendered projects & sections should include an icon."
      );
      renderProjectIconToggle.setValue(this.plugin.options.renderProjectIcon);
      renderProjectIconToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.renderProjectIcon = renderProjectIconToggle.getValue())
        );
      });
    }

    labelsSettings() {
      const renderLabelsToggle = this.addToggleSetting(
        "Render labels",
        "Whether labels should be rendered with tasks."
      );
      renderLabelsToggle.setValue(this.plugin.options.renderLabels);
      renderLabelsToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.renderLabels = renderLabelsToggle.getValue())
        );
      });

      const renderLabelsIconToggle = this.addToggleSetting(
        "Render labels icon",
        "Whether rendered labels should include an icon."
      );
      renderLabelsIconToggle.setValue(this.plugin.options.renderLabelsIcon);
      renderLabelsIconToggle.onChange(() => {
        this.plugin.writeOptions(
          (old) => (old.renderLabelsIcon = renderLabelsIconToggle.getValue())
        );
      });
    }
  };
}
