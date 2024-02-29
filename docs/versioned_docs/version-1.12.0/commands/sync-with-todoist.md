---
sidebar_position: 2
---

# Sync with Todoist

The 'Sync with Todoist' command forces the plugin to re-synchronize your labels, projects, and sections with Todoist. This can be useful if you see "Unknown Project", "Unknown Section", or "Unknown Label" in any rendered tasks.

The plugin pulls this information at startup, but will not refresh it automatically because:

- its expected that these don't change frequently
- to help avoid hitting the Todoist API rate limit
