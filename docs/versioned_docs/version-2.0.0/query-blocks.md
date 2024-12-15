---
sidebar_position: 3
---

# Query Blocks

This plugin uses the concept of [filters](https://todoist.com/help/articles/introduction-to-filters-V98wIH) to fetch data from Todoist. To create a query block, insert a code block like the following in any note:

````
```todoist
filter: "today | overdue"
```
````

This query will fetch all tasks that are due either today or are overdue and will render them in place of this code block.

## Options

The query is defined as [YAML](https://yaml.org/) and there are a number of options available.

### `filter`

The filter option is **required** and should be a valid [Todoist filter](https://todoist.com/help/articles/introduction-to-filters-V98wIH). Note that this must be the content of the filter, you cannot refer to a filter that already exists in your Todoist account.

There are a few unsupported filters, these are tracked in [this GitHub issue](https://github.com/jamiebrynes7/obsidian-todoist-plugin/issues/34):

- Wildcard filters do not work as expected. E.g. - `@*ball`
- You cannot combine multiple filters with commas. E.g. - `today | overdue, p1`

### `name`

If you want to have an embedded header rendered with your query, you can use the `name` option. This will render a `<h4>` element above your tasks.

For example:

````
```todoist
name: "Today & Overdue"
filter: "today | overdue"
```
````

### `autorefresh`

The `autorefresh` option allows you to specify the number of seconds between automatic refreshes. This takes precedence over the plugin level setting. Omitting this option means the query will follow the plugin level settings.

For example:

````
```todoist
filter: "today | overdue"
autorefresh: 120
```
````

### `sorting`

The `sorting` property allows you to specify the ordering for how your tasks are rendered. This is specified as a list, where we sort in the order of the properties in the list. The possible values are:

- `date` or `dateAscending`: sorts tasks in ascending order based on due date
- `dateDescending`: sorts tasks in descending order based on due date
- `priority` or `priorityAscending`: sorting tasks in ascending order based on priority
- `priorityDescending`: sorts tasks in descending order based on priority
- `order`: sorts task according to the ordering defined in Todoist
- `dateAdded` or `dateAddedAscending`: sorts tasks in ascending order based on the date the task was added
- `dateAddedDescending`: sorts tasks in descending order based on the date the task was added

If no sorting option is provided, tasks will be sorted by their Todoist order.

For example:

````
```todoist
filter: "today | overdue"
sorting:
    - date
    - priority
```
````

### `groupBy`

The `groupBy` property controls how tasks are grouped when they are rendered. If omitted, there will be no grouping. The possible values are:

- `project`: group by project, using the project order as in Todoist
- `section`: group by project and section, using the project and section order as in Todoist
- `due` or `date`: group by due date, all overdue tasks are grouped and shown together
- `labels`: group by the task labels, all unlabelled tasks are grouped together
- `priority` group by task priority, priorities are shown in high-low order

For example:

````
```todoist
filter: "today | overdue"
groupBy: project
```
````

### `show`

The `show` property controls which elements of the task metadata to render. This will override the plugin level settings if provided. If omitted, all task metadata will be rendered.

The possible values are:

- `due` or `date`: render the due date of the task
- `description`: render the description of the task
- `project`: render the project (and section, if applicable) of the task
- `labels`: render the labels of the task

For example:

````
```todoist
filter: "today | overdue"
show:
    - due
    - project
```
````
