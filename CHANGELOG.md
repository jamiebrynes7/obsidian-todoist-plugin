# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### ⚙ Internal

- Ported the plugin to (almost entirely) Typescript.

## [1.1.0] - 2020-08-31

### ✨ Features

- Each rendered task's CSS now contains information about the task's priority. You can use this information to style each priority differently. These classes are `todoist-p1`, `todoist-p2`, `todoist-p3`, and `todoist-p4`. For example: 
    ```css
    .todoist-p1 input[type=checkbox] {
        /* This matches against the input element rendered for a priority 1 task. */
    }
    ```
- When a task is removed or added, it now transitions with a smooth fading effect, rather than immediately being added/removed. This can be turned off in the settings.
- Added support for auto-refreshing queries. This can be set at a global level within the settings tab or overridden for each individual query. For example:
    `````markdown
    ```json
    {
        "name": "My Tasks",
        "filter" "today | overdue",
        "autorefresh": 30
    }
    ```
    `````
- Added a setting tab in the Obsidian setting menu. There are three settings included in this release:
    - "Task fade animation" - controls whether to use the fade animation
    - "Auto-refresh" - controls whether all queries should auto-refresh
    - "Auto-refresh interval" - controls the default interval for auto-refreshing queries

### 🔃 Changes

- The rendered task list now uses the ordering as defined by the Todoist API.

### 🐛 Bug Fixes

- The injected Todoist query components are correctly destroyed when removed from the DOM.

## [1.0.0] - 2020-08-29

This was the initial release of the Obsidian x Todoist plugin. It contained the basic functionality for:

- materializing tasks in an Obsidian note
- allowing you to check tasks off from an Obsidian note