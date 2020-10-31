import { writable } from "svelte/store";
import { toInt, isPositiveInteger, notification } from "./utils";
import type TodoistPlugin from ".";
import semverCompare from "semver-compare";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";

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

  debugLogging: false,
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

  debugLogging: boolean;
}

export class SettingsTab extends PluginSettingTab {
  // This is actually on TBase, but the mixin doesn't allow access without going through the prototype.
  public containerEl: HTMLDivElement;

  private plugin: TodoistPlugin;

  constructor(app: App, plugin: TodoistPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;

    containerEl.empty();

    this.pluginMetadata();
    this.debugLogging();

    this.fadeAnimationSettings();
    this.autoRefreshSettings();

    this.dateSettings();
    this.projectSettings();
    this.labelsSettings();
  }

  pluginMetadata() {
    const desc = document.createDocumentFragment();

    const span = document.createElement("span") as HTMLSpanElement;
    span.innerText = "Read the ";

    const changelogLink = document.createElement("a") as HTMLAnchorElement;
    changelogLink.href =
      "https://github.com/jamiebrynes7/obsidian-todoist-plugin/releases";
    changelogLink.innerText = "changelog!";

    span.appendChild(changelogLink);

    desc.appendChild(span);

    new Setting(this.containerEl)
      .setName(`Current Version: ${this.plugin.manifest.version}`)
      .setDesc(desc)
      .addButton((button) => {
        button.setButtonText("Check for updates");
        button.onClick(async () => {
          new Notice("Checking for updates...");

          try {
            let resp = await fetch(
              "https://api.github.com/repos/jamiebrynes7/obsidian-todoist-plugin/releases/latest"
            );

            let data = await resp.json();
            let tag: string = data.tag_name;

            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (semverCompare(tag, this.plugin.manifest.version) == 1) {
              new Notice("Update available!");
            } else {
              new Notice("Todoist plugin up-to-date");
            }
          } catch (e) {
            new Notice("Failed to check for updates.");
          }
        });
      });
  }

  debugLogging() {
    new Setting(this.containerEl)
      .setName("Debug logging")
      .setDesc("Whether debug logging should be on or off.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.debugLogging);
        toggle.onChange(async (value) => {
          await this.plugin.writeOptions((old) => (old.debugLogging = value));
        });
      });
  }

  fadeAnimationSettings() {
    new Setting(this.containerEl)
      .setName("Task fade animation")
      .setDesc("Whether tasks should fade in and out when added or removed.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.fadeToggle);
        toggle.onChange(async (value) => {
          this.plugin.writeOptions((old) => (old.fadeToggle = value));
        });
      });
  }

  autoRefreshSettings() {
    new Setting(this.containerEl)
      .setName("Auto-refresh")
      .setDesc("Whether queries should auto-refresh at a set interval")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.autoRefreshToggle);
        toggle.onChange((value) => {
          this.plugin.writeOptions((old) => (old.autoRefreshToggle = value));
        });
      });

    new Setting(this.containerEl)
      .setName("Auto-refresh interval")
      .setDesc(
        "The interval (in seconds) that queries should auto-refresh by default. Integer numbers only."
      )
      .addText((setting) => {
        setting.setValue(`${this.plugin.options.autoRefreshInterval}`);
        setting.onChange(async (value) => {
          const newSetting = value.trim();

          if (newSetting.length == 0) {
            return;
          }

          if (isPositiveInteger(newSetting)) {
            await this.plugin.writeOptions(
              (old) => (old.autoRefreshInterval = toInt(newSetting))
            );
          } else {
            setting.setValue(`${this.plugin.options.autoRefreshInterval}`);
          }
        });
      });
  }

  dateSettings() {
    new Setting(this.containerEl)
      .setName("Render dates")
      .setDesc("Whether dates should be rendered with tasks.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.renderDate);
        toggle.onChange(async (value) => {
          await this.plugin.writeOptions((old) => (old.renderDate = value));
        });
      });

    new Setting(this.containerEl)
      .setName("Render date icon")
      .setDesc("Whether rendered dates should include an icon.")
      .addToggle((setting) => {
        setting.setValue(this.plugin.options.renderDateIcon);
        setting.onChange(async (value) => {
          await this.plugin.writeOptions((old) => (old.renderDateIcon = value));
        });
      });
  }

  projectSettings() {
    new Setting(this.containerEl)
      .setName("Render project & section")
      .setDesc("Whether projects & sections should be rendered with tasks.")
      .addToggle((setting) => {
        setting.setValue(this.plugin.options.renderProject);
        setting.onChange(async (value) => {
          await this.plugin.writeOptions((old) => (old.renderProject = value));
        });
      });

    new Setting(this.containerEl)
      .setName("Render project & section icon")
      .setDesc("Whether rendered projects & sections should include an icon.")
      .addToggle((setting) => {
        setting.setValue(this.plugin.options.renderProjectIcon);
        setting.onChange(async (value) => {
          await this.plugin.writeOptions(
            (old) => (old.renderProjectIcon = value)
          );
        });
      });
  }

  labelsSettings() {
    new Setting(this.containerEl)
      .setName("Render labels")
      .setDesc("Whether labels should be rendered with tasks.")
      .addToggle((setting) => {
        setting.setValue(this.plugin.options.renderLabels);
        setting.onChange(async (value) => {
          await this.plugin.writeOptions((old) => (old.renderLabels = value));
        });
      });

    new Setting(this.containerEl)
      .setName("Render labels icon")
      .setDesc("Whether rendered labels should include an icon.")
      .addToggle((setting) => {
        setting.setValue(this.plugin.options.renderLabelsIcon);
        setting.onChange(async (value) => {
          await this.plugin.writeOptions(
            (old) => (old.renderLabelsIcon = value)
          );
        });
      });
  }
}
