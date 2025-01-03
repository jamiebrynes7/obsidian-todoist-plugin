import type { Translations } from "@/i18n/translation";

export const en: Translations = {
  settings: {
    general: {
      header: "General",
      links: {
        label: "Links",
        docsButtonLabel: "Docs",
        feedbackButtonLabel: "Feedback",
        donateButtonLabel: "Donate",
      },
      apiToken: {
        label: "API token",
        description: "The Todoist API token to use when fetching tasks",
        buttonLabel: "Setup",
      },
    },
    autoRefresh: {
      header: "Auto-refresh",
      toggle: {
        label: "Enable auto-refresh",
        description: "Whether queries should auto-refresh at a set interval",
      },
      interval: {
        label: "Auto-refresh interval",
        description: "The interval, in seconds, that queries will be auto-refreshed by default",
      },
    },
    rendering: {
      header: "Rendering",
      taskFadeAnimation: {
        label: "Enable task fade animation",
        description: "Whether tasks should fade in and out when created or completed",
      },
      dateIcon: {
        label: "Enable dates icon",
        description: "Whether rendered dates should include an icon",
      },
      projectIcon: {
        label: "Enable project & section icon",
        description: "Whether rendered projects & sections should include an icon",
      },
      labelsIcon: {
        label: "Enable label icon",
        description: "Whether rendered labels should include an icon",
      },
    },
    taskCreation: {
      header: "Task creation",
      wrapLinksInParens: {
        label: "Add parenthesis to page links",
        description:
          "When enabled, wraps Obsidian page links in Todoist tasks created from the command",
      },
      addTaskButtonAddsPageLink: {
        label: "Add task button adds page link",
        description:
          "When enabled, the embedded add task button in queries will add a link to the page to the task in the specified place",
        options: {
          off: "Disabled",
          description: "Task description",
          content: "Task name",
        },
      },
    },
    advanced: {
      header: "Advanced",
      debugLogging: {
        label: "Enable debug logging",
        description: "Whether debug logging should be enabled",
      },
      buildStamp: {
        label: "Build stamp",
        description: "Stamp for the build of this plugin",
      },
    },
    deprecation: {
      warningMessage: "This setting is deprecated and will be removed in a future release.",
    },
  },
  createTaskModal: {
    loadingMessage: "Loading Todoist data...",
    successNotice: "Task created successfully",
    errorNotice: "Failed to create task",
    taskNamePlaceholder: "Task name",
    descriptionPlaceholder: "Description",
    appendedLinkToContentMessage: "A link to this page will be appended to the task name",
    appendedLinkToDescriptionMessage:
      "A link to this page will be appended to the task description",
    cancelButtonLabel: "Cancel",
    addTaskButtonLabel: "Add task",
    failedToFindInboxNotice: "Error: could not find inbox project",
    dateSelector: {
      buttonLabel: "Set due date",
      dialogLabel: "Due date selector",
      suggestionsLabel: "Due date suggestions",
      datePickerLabel: "Task date",
      emptyDate: "Due date",
      today: "Today",
      tomorrow: "Tomorrow",
      nextWeek: "Next week",
      noDate: "No date",
      timeDialog: {
        timeLabel: "Time",
        saveButtonLabel: "Save",
        cancelButtonLabel: "Cancel",
      },
    },
    labelSelector: {
      buttonLabel: "Set labels",
      buttonText: (num: number) => {
        return `Labels (${num})`;
      },
      labelOptionsLabel: "Label options",
    },
    prioritySelector: {
      buttonLabel: "Set priority",
      optionsLabel: "Task priority options",
      p1: "Priority 1",
      p2: "Priority 2",
      p3: "Priority 3",
      p4: "Priority 4",
    },
    projectSelector: {
      buttonLabel: "Set project",
      selectorLabel: "Project selector",
      optionsLabel: "Project options",
      search: {
        label: "Filter projects",
        placeholder: "Type a project name",
      },
    },
  },
  onboardingModal: {
    failureNoticeMessage: "Failed to save API token",
    explainer:
      "In order to use this plugin, you must provide your Todoist API token. This allows us to read and write data to or from your Todoist account.",
    todoistGuideHint: {
      before: "You can follow ",
      linkText: "Todoist's guide",
      after: " on finding your API token.",
    },
    tokenInputLabel: "API Token",
    submitButtonLabel: "Save",
  },
  query: {
    displays: {
      empty: {
        label: "The query returned no tasks",
      },
      error: {
        header: "Error",
        badRequest:
          "The Todoist API has rejected the request. Please check the filter to ensure it is valid.",
        unauthorized:
          "The Todoist API request is missing or has the incorrect credentials. Please check the API token in the settings.",
        serverError:
          "The Todoist API has returned an error. Please check Todoist's status page: https://status.todoist.net/ and try again later.",
        unknown:
          "Unknown error occurred. Please check the Console in the Developer Tools window for more information",
      },
      parsingError: {
        header: "Error: Query parsing failed",
        unknownErrorMessage:
          "Unknown error occurred. Please check the Console in the Developer Tools window for more information",
      },
    },
    contextMenu: {
      completeTaskLabel: "Complete task",
      openTaskInAppLabel: "Open task in Todoist (app)",
      openTaskInBrowserLabel: "Open task in Todoist (web)",
    },
    failedCloseMessage: "Failed to close task",
    header: {
      errorPostfix: "(Error)",
      refreshTooltip: {
        lastRefreshed: (datetime: string) => `Last refreshed at: ${datetime}`,
        notRefreshed: "Not queried yet",
      },
    },
    warning: {
      header: "Warnings",
      jsonQuery:
        "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
      unknownKey: (key: string) => `Found unexpected query key '${key}'. Is this a typo?`,
    },
    groupedHeaders: {
      noDueDate: "No due date",
      overdue: "Overdue",
    },
  },
  commands: {
    sync: "Sync with Todoist",
    addTask: "Add task",
    addTaskPageContent: "Add task with current page in task content",
    addTaskPageDescription: "Add task with current page in task description",
  },
  tokenValidation: {
    emptyTokenError: "API token must not be empty",
    invalidTokenError:
      "Oops! Todoist does not recognize this token. Please double check and try again!",
  },
  dates: {
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    lastWeekday: (weekday: string) => {
      return `Last ${weekday}`;
    },
    dateTime: (date: string, time: string) => {
      return `${date} at ${time}`;
    },
  },
};
