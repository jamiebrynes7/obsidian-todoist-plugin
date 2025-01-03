import { t } from "@/i18n";
import { PluginContext } from "@/ui/context";
import { type App, PluginSettingTab } from "obsidian";
import type React from "react";
import { type Root, createRoot } from "react-dom/client";
import type TodoistPlugin from "../..";
import { type Settings, useSettingsStore } from "../../settings";
import { TokenValidation } from "../../token";
import { AutoRefreshIntervalControl } from "./AutoRefreshIntervalControl";
import { Setting } from "./SettingItem";
import { TokenChecker } from "./TokenChecker";
import "./styles.scss";
import { BuildStamp } from "@/stamp";

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
  [K in keyof Settings]: Settings[K] extends V ? K : never;
}[keyof Settings];

const SettingsRoot: React.FC<Props> = ({ plugin }) => {
  const settings = useSettingsStore();

  const toggleProps = (key: SettingsKeys<boolean>) => {
    const onClick = async (val: boolean) => {
      await plugin.writeOptions({
        [key]: val,
      });
    };

    const value = settings[key];

    return {
      value,
      onClick,
    };
  };

  const updateAutoRefreshInterval = async (val: number) => {
    await plugin.writeOptions({
      autoRefreshInterval: val,
    });
  };

  const i18n = t().settings;

  return (
    <PluginContext.Provider value={plugin}>
      <h2>{i18n.general.header}</h2>
      <Setting.Root name={i18n.general.links.label} description="">
        <Setting.ButtonControl
          label={i18n.general.links.docsButtonLabel}
          icon="book-open"
          onClick={() => {
            location.replace(
              "https://jamiebrynes7.github.io/obsidian-todoist-plugin/docs/overview/",
            );
          }}
        />
        <Setting.ButtonControl
          label={i18n.general.links.feedbackButtonLabel}
          icon="github"
          onClick={() => {
            location.replace(
              "https://github.com/jamiebrynes7/obsidian-todoist-plugin/issues/new/choose",
            );
          }}
        />
        <Setting.ButtonControl
          label={i18n.general.links.donateButtonLabel}
          icon="coffee"
          onClick={() => {
            location.replace("https://www.buymeacoffee.com/jamiebrynes");
          }}
        />
      </Setting.Root>
      <Setting.Root
        name={i18n.general.apiToken.label}
        description={i18n.general.apiToken.description}
      >
        <TokenChecker tester={TokenValidation.DefaultTester} />
      </Setting.Root>

      <h2>{i18n.autoRefresh.header}</h2>
      <Setting.Root
        name={i18n.autoRefresh.toggle.label}
        description={i18n.autoRefresh.toggle.description}
      >
        <Setting.ToggleControl {...toggleProps("autoRefreshToggle")} />
      </Setting.Root>
      <Setting.Root
        name={i18n.autoRefresh.interval.label}
        description={i18n.autoRefresh.interval.description}
      >
        <AutoRefreshIntervalControl
          initialValue={settings.autoRefreshInterval}
          onChange={updateAutoRefreshInterval}
        />
      </Setting.Root>

      <h2>{i18n.rendering.header}</h2>
      <Setting.Root
        name={i18n.rendering.taskFadeAnimation.label}
        description={i18n.rendering.taskFadeAnimation.description}
      >
        <Setting.ToggleControl {...toggleProps("fadeToggle")} />
      </Setting.Root>

      <Setting.Root
        name={i18n.rendering.dateIcon.label}
        description={i18n.rendering.dateIcon.description}
      >
        <Setting.ToggleControl {...toggleProps("renderDateIcon")} />
      </Setting.Root>
      <Setting.Root
        name={i18n.rendering.projectIcon.label}
        description={i18n.rendering.projectIcon.description}
      >
        <Setting.ToggleControl {...toggleProps("renderProjectIcon")} />
      </Setting.Root>
      <Setting.Root
        name={i18n.rendering.labelsIcon.label}
        description={i18n.rendering.labelsIcon.description}
      >
        <Setting.ToggleControl {...toggleProps("renderLabelsIcon")} />
      </Setting.Root>

      <h2>{i18n.taskCreation.header}</h2>
      <Setting.Root
        name={i18n.taskCreation.wrapLinksInParens.label}
        description={i18n.taskCreation.wrapLinksInParens.description}
      >
        <Setting.ToggleControl {...toggleProps("shouldWrapLinksInParens")} />
      </Setting.Root>
      <Setting.Root
        name={i18n.taskCreation.addTaskButtonAddsPageLink.label}
        description={i18n.taskCreation.addTaskButtonAddsPageLink.description}
      >
        <Setting.DropdownControl
          value={settings.addTaskButtonAddsPageLink}
          options={[
            {
              label: i18n.taskCreation.addTaskButtonAddsPageLink.options.off,
              value: "off",
            },
            {
              label: i18n.taskCreation.addTaskButtonAddsPageLink.options.description,
              value: "description",
            },
            {
              label: i18n.taskCreation.addTaskButtonAddsPageLink.options.content,
              value: "content",
            },
          ]}
          onClick={async (val) => {
            await plugin.writeOptions({
              addTaskButtonAddsPageLink: val,
            });
          }}
        />
      </Setting.Root>

      <h2>{i18n.advanced.header}</h2>
      <Setting.Root
        name={i18n.advanced.debugLogging.label}
        description={i18n.advanced.debugLogging.description}
      >
        <Setting.ToggleControl {...toggleProps("debugLogging")} />
      </Setting.Root>
      <Setting.Root
        name={i18n.advanced.buildStamp.label}
        description={i18n.advanced.buildStamp.description}
      >
        <span className="setting-item-build-stamp">{BuildStamp}</span>
      </Setting.Root>
    </PluginContext.Provider>
  );
};
