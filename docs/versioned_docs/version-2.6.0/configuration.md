---
sidebar_position: 5
---

# Configuration

There are a number of options that allow you to configure the behaviour of the plugin. These are listed below, but the settings page also gives brief descriptions.

## General

### Token storage

Controls where the plugin stores your Todoist API token. There are two options:

- **Obsidian secrets** - Uses Obsidian's built-in secret storage. This is the recommended option as it keeps your token out of your vault files.
- **File-based** - Stores the token in a file at `.obsidian/todoist-token` inside your vault. If you synchronize your vault, you should consider _not_ syncing this file for security reasons. You may want to use this option if you have issues with Obsidian secrets.

Changing this setting will automatically migrate your token to the new storage location.

## Auto-refresh

### Auto-refresh enabled

When enabled, all queries will auto-refresh themselves according to the interval in the settings.

### Auto-refresh interval

This defines, in seconds, the interval between automatic refreshes. This is only used when:

- the auto-refresh is enabled in the settings
- the query does not define an explicit interval

## Rendering

### Task fade animation

When enabled, tasks will fade-in or fade-out when tasks are added or removed respectively. Just some eye candy if you like that.

### Render date icon

When enabled, queries will render an icon accompanying the due date.

### Render project & section icon

When enabled, queries will render an icon accompanying the project & section.

### Render labels icon

When enabled, queries will render an icon accompanying the labels.

## Task creation

### Add parenthesis to page links

When enabled, page links added to tasks created via the [command](./commands/add-task) will be wrapped in parenthesis. This may help identifying links if you primarily use Todoist on mobile platforms.

### Add task button adds page link

When enabled, the embedded add task button in queries will add a link to the page to the task in the specified place. This behaviour can also be disabled completely.

### Default due date

This defines the default due date assigned to tasks created via [commands](./commands/add-task). This can be one of: none, today, or tomorrow.

### Default project

This defines the default project assigned to tasks created via [commands](./commands/add-task). This can be configured to any of your projects, or the Inbox.

If the project referenced here no longer exists, you will get a warning when opening the task creation modal and the Inbox will be used instead.

### Default labels

This defines the default labels assigned to tasks created via [commands](./commands/add-task). You can select zero, one, or multiple labels to be automatically applied to new tasks.

If any of the selected labels no longer exist in Todoist, you will get a warning when opening the task creation modal and they will be skipped.

### Default add task action

This setting controls the default action for the 'Add task' button in the task creation modal. You can choose between:

- **Add task** - Creates the task without copying a link
- **Add task and copy link (app)** - Creates the task and copies a markdown-formatted link using the Todoist app URI
- **Add task and copy link (web)** - Creates the task and copies a markdown-formatted link using the Todoist web URL

This sets the initial button action when opening the modal, but you can change it per-task using the split button dropdown. See the [Add task command documentation](./commands/add-task#copy-markdown-link-after-creating-task) for more details.

## Advanced

### Debug logging

When enabled, the plugin will print extra information to the Developer Tools console. You generally do not need to enable this.
