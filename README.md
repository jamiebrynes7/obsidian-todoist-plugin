# Obsidian x Todoist Plugin

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/jamiebrynes7/obsidian-todoist-plugin/premerge?style=for-the-badge) ![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/jamiebrynes7/obsidian-todoist-plugin?style=for-the-badge)

An experimental [Obsidian](https://obsidian.md/) plugin to materialize [Todoist](https://todoist.com/) task lists in Obsidian notes.

_Tested with Obsidian 0.10.6 your results may vary!_

![Example gif](./assets/obsidian-todoist-sync.gif)

## Usage

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/jamiebrynes7/obsidian-todoist-plugin/releases).
2. Place this into your `${OBSIDIAN_VAULT}/.obsidian/plugin/todoist-sync` directory.
3. Open Obsidian and ensure that the Todoist plugin is enabled.
4. You should get a prompt asking for your [Todoist API token](https://todoist.com/prefs/integrations). (If not, you can enter this in the settings).
5. Place a code block like the following in any note:
   ````markdown
   ```todoist
   {
   "name": "My Tasks",
   "filter": "today | overdue"
   }
   ```
   ````
6. Swap to preview mode and the plugin should replace this code block with the materialized result of that filter.

> If you are synchronizing your vault, I recommend explicitly ignoring the `.obsidian/todoist-token` file for security reasons, if possible.

## Inputs

| Name          | Required | Description                                                                                                       | Type     | Default |
| ------------- | :------: | ----------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `name`        |    ✓     | The title for the materialized query.                                                                             | string   |         |
| `filter`      |    ✓     | A valid [Todoist filter](https://get.todoist.help/hc/en-us/articles/205248842-Filters)<sup>[1](#footnote-1)</sup> | string   |         |
| `autorefresh` |          | The number of seconds between auto-refreshing. If omitted, the query use the default global settings.             | number   | null    |
| `sorting`     |          | Describes how to order the tasks in the query. Can be any of 'priority' or 'date', or multiple.                   | string[] | []      |
| `group`       |          | Denotes whether this query should have its task grouped by project & section.                                     | bool     | false   |

## Commands

There are also a few commands bundled in with the plugin:

1. 'Refresh Metadata'

   This command refreshes all the metadata (projects, sections, and labels) for Todoist tasks. This is done at startup.

2. 'Add Todoist task'

   This command opens up a modal for creating a task in Todoist. You can set the project/section, labels, priority, and due date through this modal. Any text selected when this command is executed will be pulled for the task content.

3. 'Add Todoist task with the current page'

   Similiar to the previous command, this one also appends a link to the current active page to the task input.

## CSS

This plugin comes with default CSS intended for use with the default Obsidian themes.

I also maintain an Obsidian theme which has support out of the box for this plugin, for a complete example of CSS for this plugin, check out [the source](https://github.com/jamiebrynes7/moonlight-obsidian-theme/blob/master/src/modules/extensions/todoist.scss).

---

<a name="footnote-1">1</a>: There are some exceptions in the Todoist API. Checkout [this issue](https://github.com/jamiebrynes7/obsidian-todoist-plugin/issues/34) for details.
