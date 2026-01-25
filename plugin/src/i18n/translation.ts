export type Translations = {
  notices: {
    migrationFailed: string;
  };
  settings: {
    general: {
      header: string;
      links: {
        label: string;
        docsButtonLabel: string;
        feedbackButtonLabel: string;
        donateButtonLabel: string;
      };
      apiToken: {
        label: string;
        description: string;
        buttonLabel: string;
      };
    };
    autoRefresh: {
      header: string;
      toggle: {
        label: string;
        description: string;
      };
      interval: {
        label: string;
        description: string;
      };
    };
    rendering: {
      header: string;
      taskFadeAnimation: {
        label: string;
        description: string;
      };
      dateIcon: {
        label: string;
        description: string;
      };
      projectIcon: {
        label: string;
        description: string;
      };
      labelsIcon: {
        label: string;
        description: string;
      };
    };
    taskCreation: {
      header: string;
      wrapLinksInParens: {
        label: string;
        description: string;
      };
      addTaskButtonAddsPageLink: {
        label: string;
        description: string;
        options: {
          off: string;
          description: string;
          content: string;
        };
      };
      defaultDueDate: {
        label: string;
        description: string;
        options: {
          none: string;
        };
      };
      defaultProject: {
        label: string;
        description: string;
        placeholder: string;
        noDefault: string;
        deletedWarning: string;
        deleted: string;
      };
      defaultLabels: {
        label: string;
        description: string;
        buttonAddLabel: string;
        buttonNoAvailableLabels: string;
        noLabels: string;
        deletedWarning: string;
        deleted: string;
      };
      defaultAddTaskAction: {
        label: string;
        description: string;
        options: {
          add: string;
          addCopyApp: string;
          addCopyWeb: string;
        };
      };
    };
    advanced: {
      header: string;
      debugLogging: {
        label: string;
        description: string;
      };
      buildStamp: {
        label: string;
        description: string;
      };
    };
    deprecation: {
      warningMessage: string;
    };
  };
  createTaskModal: {
    loadingMessage: string;
    successNotice: string;
    errorNotice: string;
    taskNamePlaceholder: string;
    descriptionPlaceholder: string;
    appendedLinkToContentMessage: string;
    appendedLinkToDescriptionMessage: string;
    cancelButtonLabel: string;
    addTaskButtonLabel: string;
    addTaskAndCopyAppLabel: string;
    addTaskAndCopyWebLabel: string;
    actionMenuLabel: string;
    linkCopiedNotice: string;
    linkCopyFailedNotice: string;
    failedToFindInboxNotice: string;
    defaultProjectDeletedNotice: (projectName: string) => string;
    defaultLabelsDeletedNotice: (labelNames: string) => string;
    dateSelector: {
      buttonLabel: string;
      dialogLabel: string;
      suggestionsLabel: string;
      datePickerLabel: string;
      emptyDate: string;
      noDate: string;
      timeDialog: {
        timeLabel: string;
        saveButtonLabel: string;
        cancelButtonLabel: string;
        durationLabel: string;
        noDuration: string;
        duration: (minutes: number) => string;
      };
    };
    deadlineSelector: {
      buttonLabel: string;
      dialogLabel: string;
      suggestionsLabel: string;
      datePickerLabel: string;
      placeholder: string;
      noDeadline: string;
    };
    labelSelector: {
      buttonLabel: string;
      buttonText: (num: number) => string;
      labelOptionsLabel: string;
    };
    prioritySelector: {
      buttonLabel: string;
      optionsLabel: string;
      p1: string;
      p2: string;
      p3: string;
      p4: string;
    };
    projectSelector: {
      buttonLabel: string;
      selectorLabel: string;
      optionsLabel: string;
      search: {
        label: string;
        placeholder: string;
      };
    };
    optionsSelector: {
      buttonLabel: string;
      optionsLabel: string;
      addLinkToContent: string;
      addLinkToDescription: string;
      doNotAddLink: string;
    };
  };
  onboardingModal: {
    failureNoticeMessage: string;
    explainer: string;
    todoistGuideHint: {
      before: string;
      linkText: string;
      after: string;
    };
    tokenInputLabel: string;
    submitButtonLabel: string;
    pasteButtonLabel: string;
  };
  query: {
    displays: {
      empty: {
        label: string;
      };
      error: {
        header: string;
        badRequest: string;
        unauthorized: string;
        serverError: string;
        unknown: string;
      };
      parsingError: {
        header: string;
        unknownErrorMessage: string;
      };
    };
    contextMenu: {
      completeTaskLabel: string;
      openTaskInAppLabel: string;
      openTaskInBrowserLabel: string;
    };
    failedCloseMessage: string;
    header: {
      errorPostfix: string;
      refreshTooltip: {
        lastRefreshed: (datetime: string) => string;
        notRefreshed: string;
      };
    };
    warning: {
      header: string;
      jsonQuery: string;
      unknownKey: (key: string) => string;
      dueAndTime: string;
      projectAndSection: string;
    };
    groupedHeaders: {
      noDueDate: string;
      overdue: string;
    };
  };
  commands: {
    sync: string;
    addTask: string;
    addTaskPageContent: string;
    addTaskPageDescription: string;
  };
  tokenValidation: {
    emptyTokenError: string;
    invalidTokenError: string;
  };
  dates: {
    today: string;
    tomorrow: string;
    yesterday: string;
    nextWeek: string;
    lastWeekday: (weekday: string) => string;
    dateTime: (date: string, time: string) => string;
    dateTimeDuration: (date: string, startTime: string, endTime: string) => string;
    dateTimeDurationDifferentDays: (
      startDate: string,
      startTime: string,
      endDate: string,
      endTime: string,
    ) => string;
    timeDuration: (startTime: string, endTime: string) => string;
    timeDurationDifferentDays: (startTime: string, endDate: string, endTime: string) => string;
  };
};
