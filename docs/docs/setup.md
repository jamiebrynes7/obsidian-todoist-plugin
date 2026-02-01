---
sidebar_position: 2
---

# Setup

There are a few steps to get up and running with this plugin.

## 1. Install plugin

First we need to install the plugin. You can follow this [handy](https://obsidian.md/plugins?id=todoist-sync-plugin) link to open the plugin's page in Obsidian and install it.

If you prefer to do it manually:

1. Open the settings in Obsidian
2. Select 'Community Plugins' in the sidebar
3. If necessary, turn on community plugins. Make sure you are comfortable with the warnings given to you on this page
4. Select 'Browse' and search for "Todoist Sync"
5. Install the plugin

## 2. Setup API token

Once the plugin is installed, you'll need to enable and do some initial setup.

1. Enable the plugin from Obsidian's setting page
2. You should get a popup asking you to provide your [API token](https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB).
3. Enter your API token into the prompt. You can type it directly or use the "Paste from clipboard" button for convenience.
4. The prompt will verify that the token provided is valid and will present you with a checkmark if it is
5. Select 'Save' to complete the setup

> By default, your API token is stored securely using Obsidian's built-in secret storage. You can change this to file-based storage in the [plugin configuration](./configuration#token-storage).

## What's next?

Once you've set up the plugin you can explore adding [query blocks](./query-blocks), look at how to [add tasks from Obsidian](./commands/add-task), or explore the [plugin configuration](./configuration).
