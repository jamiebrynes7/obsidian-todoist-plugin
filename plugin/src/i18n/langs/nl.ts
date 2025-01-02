import type { Translations } from "@/i18n/translation";
import type { DeepPartial } from "@/utils/types";

export const nl: DeepPartial<Translations> = {
  settings: {
    general: {
      header: "Algemeen",
      links: {
        label: "Links",
        docsButtonLabel: "Documentatie",
        feedbackButtonLabel: "Feedback",
        donateButtonLabel: "Doneren",
      },
      apiToken: {
        label: "API-token",
        description: "De Todoist API-token die wordt gebruikt bij het ophalen van taken",
        buttonLabel: "Instellen",
      },
    },
    autoRefresh: {
      header: "Automatisch verversen",
      toggle: {
        label: "Automatisch verversen inschakelen",
        description: "Of queries automatisch moeten verversen op een ingestelde interval",
      },
      interval: {
        label: "Interval automatisch verversen",
        description: "Het interval, in seconden, waarop queries standaard worden ververst",
      },
    },
    rendering: {
      header: "Weergave",
      taskFadeAnimation: {
        label: "Taak vervaag-animatie inschakelen",
        description: "Of taken visueel moeten vervagen bij het aanmaken of voltooien",
      },
      dateIcon: {
        label: "Datumpictogram inschakelen",
        description: "Of weergegeven datums een pictogram moeten bevatten",
      },
      projectIcon: {
        label: "Project- & sectiepictogram inschakelen",
        description: "Of weergegeven projecten en secties een pictogram moeten bevatten",
      },
      labelsIcon: {
        label: "Labelpictogram inschakelen",
        description: "Of weergegeven labels een pictogram moeten bevatten",
      },
    },
    taskCreation: {
      header: "Aanmaken van een taak",
      wrapLinksInParens: {
        label: "Haakjes toevoegen aan paginalinks",
        description:
          "Wanneer ingeschakeld, worden Obsidian-paginalinks in Todoist-taken tussen haakjes geplaatst",
      },
      addTaskButtonAddsPageLink: {
        label: "Taak toevoegen-knop voegt paginalink toe",
        description:
          "Wanneer ingeschakeld, voegt de ingebedde knop om taken toe te voegen in queries een link naar de pagina toe aan de taak op de opgegeven plek",
        options: {
          off: "Uitgeschakeld",
          description: "Taakbeschrijving",
          content: "Taaknaam",
        },
      },
    },
    advanced: {
      header: "Geavanceerd",
      debugLogging: {
        label: "Debug-logboek inschakelen",
        description: "Of debug-logboeken moeten worden ingeschakeld",
      },
    },
    deprecation: {
      warningMessage:
        "Deze instelling is verouderd en wordt in een toekomstige release verwijderd.",
    },
  },
  createTaskModal: {
    loadingMessage: "Todoist-gegevens laden...",
    successNotice: "Taak succesvol aangemaakt",
    errorNotice: "Kan taak niet aanmaken",
    taskNamePlaceholder: "Taaknaam",
    descriptionPlaceholder: "Beschrijving",
    appendedLinkToContentMessage: "Een link naar deze pagina wordt toegevoegd aan de taaknaam",
    appendedLinkToDescriptionMessage:
      "Een link naar deze pagina wordt toegevoegd aan de taakbeschrijving",
    cancelButtonLabel: "Annuleren",
    addTaskButtonLabel: "Taak toevoegen",
    failedToFindInboxNotice: "Fout: inbox-project niet gevonden",
    dateSelector: {
      buttonLabel: "Vervaldatum instellen",
      dialogLabel: "Vervaldatumkiezer",
      suggestionsLabel: "Suggesties voor vervaldatum",
      datePickerLabel: "Taakdatum",
      emptyDate: "Vervaldatum",
      today: "Vandaag",
      tomorrow: "Morgen",
      nextWeek: "Volgende week",
      noDate: "Geen datum",
      timeDialog: {
        timeLabel: "Tijd",
        saveButtonLabel: "Opslaan",
        cancelButtonLabel: "Annuleren",
      },
    },
    labelSelector: {
      buttonLabel: "Labels instellen",
      buttonText: (num: number) => {
        return `Labels (${num})`;
      },
      labelOptionsLabel: "Labelopties",
    },
    prioritySelector: {
      buttonLabel: "Prioriteit instellen",
      optionsLabel: "Prioriteitsopties voor taken",
      p1: "Prioriteit 1",
      p2: "Prioriteit 2",
      p3: "Prioriteit 3",
      p4: "Prioriteit 4",
    },
    projectSelector: {
      buttonLabel: "Project instellen",
      selectorLabel: "Projectkiezer",
      optionsLabel: "Projectopties",
      search: {
        label: "Projecten filteren",
        placeholder: "Typ een projectnaam",
      },
    },
  },
  onboardingModal: {
    failureNoticeMessage: "Opslaan van API-token mislukt",
    explainer:
      "Om deze plug-in te gebruiken, moet u uw Todoist API-token opgeven. Hiermee kunnen we gegevens lezen en schrijven naar of vanuit uw Todoist-account.",
    todoistGuideHint: {
      before: "U kunt ",
      linkText: "Todoist's gids",
      after: " volgen om uw API-token te vinden.",
    },
    tokenInputLabel: "API-token",
    submitButtonLabel: "Opslaan",
  },
  query: {
    displays: {
      empty: {
        label: "De query retourneerde geen taken",
      },
      error: {
        header: "Fout",
        badRequest:
          "De Todoist API heeft het verzoek afgewezen. Controleer het filter om te zien of het geldig is.",
        unauthorized:
          "Het Todoist API-verzoek mist of heeft onjuiste inloggegevens. Controleer de API-token in de instellingen.",
        unknown:
          "Er is een onbekende fout opgetreden. Controleer de Console in het venster Ontwikkelaarstools voor meer informatie",
      },
      parsingError: {
        header: "Fout: query-parsering mislukt",
        unknownErrorMessage:
          "Er is een onbekende fout opgetreden. Controleer de Console in het venster Ontwikkelaarstools voor meer informatie",
      },
    },
    contextMenu: {
      completeTaskLabel: "Taak voltooien",
      openTaskInAppLabel: "Open taak in Todoist (app)",
      openTaskInBrowserLabel: "Open taak in Todoist (web)",
    },
    failedCloseMessage: "Kan taak niet sluiten",
    header: {
      errorPostfix: "(Fout)",
      refreshTooltip: {
        lastRefreshed: (datetime: string) => `Laatst ververst op: ${datetime}`,
        notRefreshed: "Nog niet opgehaald",
      },
    },
    warning: {
      header: "Waarschuwingen",
      jsonQuery:
        "Deze query is geschreven in JSON. Dit is verouderd en zal in een latere versie worden verwijderd. Gebruik YAML in plaats daarvan.",
      unknownKey: (key: string) =>
        `Onverwachte querysleutel '${key}' gevonden. Is dit een typefout?`,
    },
    groupedHeaders: {
      noDueDate: "Geen vervaldatum",
      overdue: "Achterstallig",
    },
  },
  commands: {
    sync: "Synchroniseer met Todoist",
    addTask: "Taak toevoegen",
    addTaskPageContent: "Taak toevoegen met huidige pagina in taakinhoud",
    addTaskPageDescription: "Taak toevoegen met huidige pagina in taakbeschrijving",
  },
  tokenValidation: {
    emptyTokenError: "API-token mag niet leeg zijn",
    invalidTokenError:
      "Oeps! Todoist herkent deze token niet. Controleer nogmaals en probeer opnieuw!",
  },
  dates: {
    today: "Vandaag",
    tomorrow: "Morgen",
    yesterday: "Gisteren",
    lastWeekday: (weekday: string) => {
      return `Last ${weekday}`;
    },
    dateTime: (date: string, time: string) => {
      return `${date} at ${time}`;
    },
  },
};
