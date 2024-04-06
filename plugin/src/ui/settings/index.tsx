import { App, PluginSettingTab } from "obsidian";
import React from "react";
import { type Root, createRoot } from "react-dom/client";
import type TodoistPlugin from "../..";
import { type ISettings } from "../../settings";
import { TokenValidation } from "../../token";
import { PluginContext } from "../context/plugin";
import { AutoRefreshIntervalControl } from "./AutoRefreshIntervalControl";
import { Setting } from "./SettingItem";
import { TokenChecker } from "./TokenChecker";
import "./styles.scss";

export class SettingsTab extends PluginSettingTab {
  private readonly plugin: TodoistPlugin;
  private reactRoot: Root | undefined;

  constructor(app: App, plugin: TodoistPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    this.containerEl.empty();
    this.reactRoot = createRoot(this.containerEl);
    this.reactRoot.render(<SettingsRoot plugin={this.plugin} />);
  }

  hide() {
    this.reactRoot?.unmount();
  }
}

type Props = {
  plugin: TodoistPlugin;
};

type SettingsKeys<V> = {
  [K in keyof ISettings]: ISettings[K] extends V ? K : never;
}[keyof ISettings];

const SettingsRoot: React.FC<Props> = ({ plugin }) => {
  const toggleProps = (key: SettingsKeys<boolean>) => {
    const onClick = async (val: boolean) => {
      await plugin.writeOptions((old) => {
        old[key] = val;
      });
    };

    const value = plugin.options[key];

    return {
      value,
      onClick,
    };
  };

  const updateAutoRefreshInterval = async (val: number) => {
    await plugin.writeOptions((old) => {
      old.autoRefreshInterval = val;
    });
  };

  return (
    <PluginContext.Provider value={plugin}>
      <h2>General</h2>
      <Setting.Root name="Links" description="">
        <Setting.ButtonControl
          label="Docs"
          icon="book-open"
          onClick={() => {
            location.replace(
              "https://jamiebrynes7.github.io/obsidian-todoist-plugin/docs/overview/",
            );
          }}
        />
        <Setting.ButtonControl
          label="Feedback"
          icon="github"
          onClick={() => {
            location.replace(
              "https://github.com/jamiebrynes7/obsidian-todoist-plugin/issues/new/choose",
            );
          }}
        />
        <Setting.ButtonControl
          label="Donate"
          icon="coffee"
          onClick={() => {
            location.replace("https://www.buymeacoffee.com/jamiebrynes");
          }}
        />
      </Setting.Root>
      <Setting.Root name="API token" description="The Todoist API token to use when fetching tasks">
        <TokenChecker tester={TokenValidation.DefaultTester} />
      </Setting.Root>

      <h2>Auto-refresh</h2>
      <Setting.Root
        name="Enable auto-refresh"
        description="Whether queries should auto-refresh at a set interval"
      >
        <Setting.ToggleControl {...toggleProps("autoRefreshToggle")} />
      </Setting.Root>
      <Setting.Root
        name="Auto-refresh interval"
        description="The interval, in seconds, that queries will be auto-refreshed by default"
      >
        <AutoRefreshIntervalControl
          initialValue={plugin.options.autoRefreshInterval}
          onChange={updateAutoRefreshInterval}
        />
      </Setting.Root>

      <h2>Rendering</h2>
      <Setting.Root
        name="Enable task fade animation"
        description="Whether tasks should fade in and out when created or completed"
      >
        <Setting.ToggleControl {...toggleProps("fadeToggle")} />
      </Setting.Root>
      <Setting.Root
        name="Enable descriptions"
        description="Whether descriptions should be rendered with tasks"
        deprecationMessage="Please use the show property in the query block instead."
      >
        <Setting.ToggleControl {...toggleProps("renderDescription")} />
      </Setting.Root>

      <Setting.Root
        name="Enable dates"
        description="Whether dates should be rendered with tasks"
        deprecationMessage="Please use the show property in the query block instead."
      >
        <Setting.ToggleControl {...toggleProps("renderDate")} />
      </Setting.Root>
      <Setting.Root
        name="Enable dates icon"
        description="Whether rendered dates should include an icon"
      >
        <Setting.ToggleControl {...toggleProps("renderDateIcon")} />
      </Setting.Root>

      <Setting.Root
        name="Enable project & section"
        description="Whether the project & section should be rendered with tasks"
        deprecationMessage="Please use the show property in the query block instead."
      >
        <Setting.ToggleControl {...toggleProps("renderProject")} />
      </Setting.Root>
      <Setting.Root
        name="Enable project & section icon"
        description="Whether rendered projects & sections should include an icon"
      >
        <Setting.ToggleControl {...toggleProps("renderProjectIcon")} />
      </Setting.Root>

      <Setting.Root
        name="Enable labels"
        description="Whether labels should be rendered with tasks"
        deprecationMessage="Please use the show property in the query block instead."
      >
        <Setting.ToggleControl {...toggleProps("renderLabels")} />
      </Setting.Root>
      <Setting.Root
        name="Enable label icon"
        description="Whether rendered labels should include an icon"
      >
        <Setting.ToggleControl {...toggleProps("renderLabelsIcon")} />
      </Setting.Root>

      <h2>Task creation</h2>
      <Setting.Root
        name="Add parenthesis to page links"
        description="When enabled, wraps Obsidian page links in Todoist tasks created from the command"
      >
        <Setting.ToggleControl {...toggleProps("shouldWrapLinksInParens")} />
      </Setting.Root>

      <h2>Advanced</h2>
      <Setting.Root
        name="Enable debug logging"
        description="Whether debug logging should be enabled"
      >
        <Setting.ToggleControl {...toggleProps("debugLogging")} />
      </Setting.Root>
    </PluginContext.Provider>
  );
};
