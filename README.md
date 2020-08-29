# Obsidian x Todoist Plugin

An experimental [Obsidian](https://obsidian.md/) plugin using [Volcano](https://github.com/kognise/volcano) to materialize [Todoist](https://todoist.com/) task lists in Obsidian notes.

_Tested with Obsidian 0.8.4 and Volcano 1.0.6, your results may vary!_

![Example gif](./.github/obsidian-todoist-sync.gif)

## Usage

1. Download `todoist.js` from the [latest release](https://github.com/jamiebrynes7/obsidian-todoist-plugin/releases).
2. Place this into your `~/volcano/plugins` directory.
3. Copy your [Todoist API token](https://todoist.com/prefs/integrations) into `.obsidian/todoist-token`. (If you are synchronizing your vault, I recommend ignoring this file for safety reasons).
4. Open Obsidian and ensure that the Todoist plugin is enabled.
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


## Inputs

| Name     | Required | Description                                                                              | Type   | Default |
| -------- | :------: | ---------------------------------------------------------------------------------------- | ------ | ------- |
| `name`   |    ✓     | The title for the materialized query.                                                    | string |         |
| `filter` |    ✓     | Any valid [Todoist filter](https://get.todoist.help/hc/en-us/articles/205248842-Filters) | string |         |


## CSS

There are a few CSS classes in the generated DOM, which you can use to customize the rendering of the list: 

- `.todoist-query-title`: Attached to the header that contains the query title.
- `.todoist-refresh-button`: Attached to the refresh button.
- `.todoist-refresh-spin`: Attached to the refresh icon _when_ the plugin is refreshing the Todoist data.

My CSS for this in the demo above was: 

```css
.todoist-query-title {
  display: inline;
}

.todoist-refresh-button {
  display: inline;
  margin-left: 8px;
}

.todoist-refresh-spin {
  animation: spin 1s linear infinite;
}

@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
  }
}
```