import Plugin from "./plugin.js";
import { toInt, isPositiveInteger } from "./utils.js";

module.exports = ({ SettingTab }) => {
  class Settings extends SettingTab {
    constructor(app, instance, plugin) {
      super(app, instance);
      this.plugin = plugin;
    }

    display() {
      this.containerEl.empty();
      this.fadeAnimationSettings();
      this.autoRefreshSettings();
    }

    fadeAnimationSettings() {
      const fadeToggle = this.addToggleSetting(
        "Task fade animation", 
        "Whether tasks should fade in and out when added or removed.");
      fadeToggle.setValue(this.plugin.options.fadeToggle);
      fadeToggle.onChange(() => {
        this.plugin.writeOptions(old => old.fadeToggle = fadeToggle.getValue());
      });
    }

    autoRefreshSettings() {
      const autoRefreshToggle = this.addToggleSetting(
        "Auto-refresh", 
        "Whether queries should auto-refresh at a set interval.");
      autoRefreshToggle.setValue(this.plugin.options.autoRefreshToggle);
      autoRefreshToggle.onChange(() => {
        this.plugin.writeOptions(old => old.autoRefreshToggle = autoRefreshToggle.getValue());
      });

      const autoRefreshInterval = this.addTextSetting(
        "Auto-refresh interval", 
        "The interval (in seconds) that queries should auto-refresh by default. Integer numbers only");
      autoRefreshInterval.setValue(`${this.plugin.options.autoRefreshInterval}`);
      autoRefreshInterval.onChange(() => {
        const newSetting = autoRefreshInterval.getValue().trim();

        if (newSetting.length == 0) {
          return;
        }

        if (isPositiveInteger(newSetting)) {
          this.plugin.writeOptions(old => old.autoRefreshInterval = toInt(newSetting));
        } else {
          autoRefreshInterval.setValue(`${this.plugin.options.autoRefreshInterval}`);
        }
      });
    }
  }


  return new Plugin((app, instance, plugin) => new Settings(app, instance, plugin));
};
