---
sidebar_position: 4
---

# Configuration

There are a number of options that allow you to configure the behaviour of the plugin. These are listed below, but the settings page also gives brief descriptions.

## General

### Todoist API token

The API token used to connect to Todoist. This is stored in your vault at `.obsidian/todoist-token`. If you synchronize your vault, I recommend that you do _not_ sync this file for security reasons.

### Task fade animation

When enabled, tasks will fade-in or fade-out when tasks are added or removed respectively. Just some eye candy if you like that.

### Add parenthesis to page links

When enabled, page links added to tasks created via the [command](./commands/add-task) will be wrapped in parenthesis. This may help identifying links if you primarily use Todoist on mobile platforms.

### Debug logging

When enabled, the plugin will print extra information to the Developer Tools console. You generally do not need to enable this.

## Auto-refresh

### Auto-refresh enabled

When enabled, all queries will auto-refresh themselves according to the interval in the settings.

### Auto-refresh interval

This defines, in seconds, the interval between automatic refreshes. This is only used when:

- the auto-refresh is enabled in the settings 
- the query does not define an explicit interval

## Rendering

### Render descriptions

**Please note: This is deprecated in favor of query-based control of rendering. This will be removed in a future release.**

When enabled, queries will render the task description under the task content. 

### Render dates

**Please note: This is deprecated in favor of query-based control of rendering. This will be removed in a future release.**

When enabled, queries will render the task due date under the task content.

### Render date icon

When enabled, queries will render an icon accompanying the due date. 

### Render project & section

**Please note: This is deprecated in favor of query-based control of rendering. This will be removed in a future release.**

When enabled, queries will render the project & section under the task content.

### Render project & section icon

When enabled, queries will render an icon accompanying the project & section. 

### Render labels

**Please note: This is deprecated in favor of query-based control of rendering. This will be removed in a future release.**

When enabled, queries will render the labels under the task content.

### Render labels icon

When enabled, queries will render an icon accompanying the labels. 
