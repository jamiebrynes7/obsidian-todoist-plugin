---
sidebar_position: 1
---

# Add task

![](./add-task-modal.png)

The 'Add task' set of commands open up a modal that allows you to configure and send tasks to Todoist from Obsidian. Any text selected will be used to pre-populate the task content.

There are a few variants of the command:

- 'Add task', the basic version
- 'Add task with current page in task content', this option will append a link to the current page in the task content before it sends it to Obsidian. The modal will inform you it will do this, but the link is not shown to keep the modal clean.
- 'Add task with current page in task description', this option will append a link to the current page in the task description before it sends it to Obsidian. The modal will inform you it will do this, but the link is not shown to keep the modal clean.

## Copy markdown link after creating task

The 'Add task' button in the modal is a split button with a dropdown menu. You can click the dropdown arrow to choose between three actions:

- **Add task** - Creates the task without copying anything
- **Add task and copy link (app)** - Creates the task and copies a markdown link with an app URI (`todoist://task?id=...`)
- **Add task and copy link (web)** - Creates the task and copies a markdown link with a web URL (`https://todoist.com/app/project/...`)

The copied text format is `task content [Todoist](url)`, which you can paste directly into your Obsidian notes. If you have "append link to content" enabled, an Obsidian backlink to the current page will also be included. The link will open the task in Todoist when clicked.

You can set your preferred default action in the plugin settings under "Task creation" → "Default add task action".
