import type { Translations } from "@/i18n/translation";
import type { DeepPartial } from "@/utils/types";

export const ptBR: DeepPartial<Translations> = {
  notices: {
    migrationFailed: "Falha ao aplicar migrações. Confira o console para mais detalhes.",
  },
  settings: {
    general: {
      header: "Geral",
      links: {
        label: "Links",
        docsButtonLabel: "Docs",
        feedbackButtonLabel: "Comentários",
        donateButtonLabel: "Doar",
      },
      apiToken: {
        label: "Token da API",
        description: "O token da API do Todoist usado para buscar tarefas",
        buttonLabel: "Configurar",
      },
      tokenStorage: {
        label: "Armazenamento do token",
        description: "Onde o plugin deve armazenar o token da API do Todoist",
        options: {
          secrets: "Segredos do Obsidian",
          file: "Em arquivo",
        },
      },
    },
    autoRefresh: {
      header: "Atualização automática",
      toggle: {
        label: "Ativar atualização automática",
        description: "Se as consultas devem ser atualizadas automaticamente em um intervalo definido",
      },
      interval: {
        label: "Intervalo da atualização automática",
        description:
          "O intervalo, em segundos, em que as consultas serão atualizadas automaticamente por padrão",
      },
    },
    rendering: {
      header: "Renderização",
      taskFadeAnimation: {
        label: "Ativar animação de fade para as tarefas",
        description: "Se as tarefas devem esmaecer ao serem criadas ou concluídas",
      },
      dateIcon: {
        label: "Ativar ícone de datas",
        description: "Se as datas devem incluir um ícone",
      },
      projectIcon: {
        label: "Ativar ícone de projeto e seção",
        description: "Se os projetos e seções devem incluir um ícone",
      },
      labelsIcon: {
        label: "Ativar ícone de etiqueta",
        description: "Se as etiquetas devem incluir um ícone",
      },
    },
    taskCreation: {
      header: "Criação de tarefas",
      wrapLinksInParens: {
        label: "Adicionar parênteses aos links de página",
        description:
          "Quando ativado, coloca parênteses nos links de página do Obsidian nas tarefas criadas por comando",
      },
      addTaskButtonAddsPageLink: {
        label: "Botão de adicionar tarefa adiciona link da página",
        description:
          "Quando ativado, o botão de adicionar tarefa nas consultas vai colocar um link da página na tarefa no local especificado",
        options: {
          off: "Desativado",
          description: "Descrição da tarefa",
          content: "Nome da tarefa",
        },
      },
      defaultDueDate: {
        label: "Data de vencimento padrão",
        description: "A data de vencimento padrão que será usada ao criar novas tarefas",
        options: {
          none: "Sem padrão",
        },
      },
      defaultProject: {
        label: "Projeto padrão",
        description: "O projeto padrão que será usado ao criar novas tarefas",
        placeholder: "Selecione um projeto",
        noDefault: "Caixa de entrada",
        deletedWarning: "Este projeto não existe mais",
        deleted: "excluído",
      },
      defaultLabels: {
        label: "Etiquetas padrão",
        description: "As etiquetas padrão que serão usadas ao criar novas tarefas",
        buttonAddLabel: "Adicionar etiqueta",
        buttonNoAvailableLabels: "Nenhuma etiqueta disponível",
        noLabels: "Nenhuma etiqueta configurada",
        deletedWarning: "Esta etiqueta não existe mais",
        deleted: "excluída",
      },
      defaultAddTaskAction: {
        label: "Ação padrão para adicionar tarefa",
        description: "A ação padrão ao clicar no botão Adicionar tarefa",
        options: {
          add: "Adicionar tarefa",
          addCopyApp: "Adicionar tarefa e copiar link (APP)",
          addCopyWeb: "Adicionar tarefa e copiar link (Web)",
        },
      },
    },
    advanced: {
      header: "Avançado",
      debugLogging: {
        label: "Ativar registro de depuração",
        description: "Se o registro de depuração deve ser ativado",
      },
      buildStamp: {
        label: "Identificador da build",
        description: "Identificador da build deste plugin",
      },
    },
    deprecation: {
      warningMessage: "Esta configuração foi descontinuada e será removida em uma versão futura.",
    },
  },
  createTaskModal: {
    loadingMessage: "Carregando dados do Todoist...",
    successNotice: "Tarefa criada com sucesso",
    errorNotice: "Falha ao criar tarefa",
    taskNamePlaceholder: "Nome da tarefa",
    descriptionPlaceholder: "Descrição",
    appendedLinkToContentMessage: "Um link para esta página colocado no nome da tarefa",
    appendedLinkToDescriptionMessage: "Um link para esta página será colocado na descrição da tarefa",
    cancelButtonLabel: "Cancelar",
    addTaskButtonLabel: "Adicionar tarefa",
    addTaskAndCopyAppLabel: "Adicionar tarefa e copiar link (APP)",
    addTaskAndCopyWebLabel: "Adicionar tarefa e copiar link (Eeb)",
    actionMenuLabel: "Menu de ação para adicionar tarefa",
    linkCopiedNotice: "Tarefa criada e link copiado para a área de transferência",
    linkCopyFailedNotice:
      "Tarefa criada, mas não foi possível copiar o link para a área de transferência",
    failedToFindInboxNotice: "Erro: não foi possível encontrar o projeto Caixa de entrada",
    defaultProjectDeletedNotice: (projectName: string) =>
      `O projeto padrão "${projectName}" não existe mais. Usando a Caixa de entrada no lugar.`,
    defaultLabelsDeletedNotice: (labelNames: string) =>
      `As etiquetas padrão não existem mais: ${labelNames}. Ignorando etiquetas excluídas.`,
    dateSelector: {
      buttonLabel: "Definir data de vencimento",
      dialogLabel: "Seletor de data de vencimento",
      suggestionsLabel: "Sugestões de data de vencimento",
      datePickerLabel: "Data da tarefa",
      emptyDate: "Data de vencimento",
      noDate: "Sem data",
      timeDialog: {
        timeLabel: "Horário",
        saveButtonLabel: "Salvar",
        cancelButtonLabel: "Cancelar",
        durationLabel: "Duração",
        noDuration: "Sem duração",
        duration: (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;

          if (hours === 0) {
            return `${mins}min`;
          }

          return `${hours}h ${mins}min`;
        },
      },
    },
    deadlineSelector: {
      buttonLabel: "Definir prazo",
      dialogLabel: "Seletor de prazo",
      suggestionsLabel: "Sugestões de prazo",
      datePickerLabel: "Data do prazo",
      placeholder: "Prazo",
      noDeadline: "Sem prazo",
    },
    labelSelector: {
      buttonLabel: "Definir etiquetas",
      buttonText: (num: number) => {
        return `Etiquetas (${num})`;
      },
      labelOptionsLabel: "Opções de etiqueta",
    },
    prioritySelector: {
      buttonLabel: "Definir prioridade",
      optionsLabel: "Opções de prioridade da tarefa",
      p1: "Prioridade 1",
      p2: "Prioridade 2",
      p3: "Prioridade 3",
      p4: "Prioridade 4",
    },
    projectSelector: {
      buttonLabel: "Definir projeto",
      selectorLabel: "Seletor de projeto",
      optionsLabel: "Opções de projeto",
      search: {
        label: "Filtrar projetos",
        placeholder: "Digite o nome de um projeto",
      },
    },
    optionsSelector: {
      buttonLabel: "Definir opções",
      optionsLabel: "Opções da tarefa",
      addLinkToContent: "Adicionar link ao conteúdo",
      addLinkToDescription: "Adicionar link à descrição",
      doNotAddLink: "Não adicionar link",
    },
  },
  onboardingModal: {
    failureNoticeMessage: "Falha ao salvar o token da API",
    explainer:
      "Para usar este plugin, você deve fornecer seu token da API do Todoist. Isso permite ler e gravar dados na sua conta do Todoist.",
    todoistGuideHint: {
      before: "Você pode seguir o ",
      linkText: "guia do Todoist",
      after: " para encontrar seu token da API.",
    },
    tokenInputLabel: "Token da API",
    submitButtonLabel: "Salvar",
    pasteButtonLabel: "Colar da área de transferência",
  },
  query: {
    displays: {
      empty: {
        label: "A consulta não retornou tarefas",
      },
      error: {
        header: "Erro",
        badRequest:
          "A API do Todoist rejeitou a solicitação. Verifique o filtro para garantir que ele seja válido.",
        unauthorized:
          "A solicitação para a API do Todoist não tem credenciais ou está com credenciais incorretas. Verifique o token da API nas configurações.",
        serverError:
          "A API do Todoist retornou um erro. Confira a página de status do Todoist: https://status.todoist.net/ e tente novamente mais tarde.",
        unknown:
          "Ocorreu um erro desconhecido. Confira o Console na janela de Ferramentas de Desenvolvedor para mais informações",
      },
      parsingError: {
        header: "Erro: falha ao analisar a consulta",
        unknownErrorMessage:
          "Ocorreu um erro desconhecido. Confira o Console na janela de Ferramentas de Desenvolvedor para mais informações",
      },
    },
    contextMenu: {
      completeTaskLabel: "Concluir tarefa",
      openTaskInAppLabel: "Abrir tarefa no Todoist (APP)",
      openTaskInBrowserLabel: "Abrir tarefa no Todoist (Web)",
    },
    failedCloseMessage: "Falha ao fechar tarefa",
    header: {
      errorPostfix: "(Erro)",
      refreshTooltip: {
        lastRefreshed: (datetime: string) => `Atualizado última vez às: ${datetime}`,
        notRefreshed: "Ainda não consultado",
      },
    },
    warning: {
      header: "Avisos",
      jsonQuery:
        "Esta consulta foi escrita usando JSON. Isso foi descontinuado e será removido em uma versão futura. Use YAML no lugar.",
      unknownKey: (key: string) =>
        `Chave de consulta inesperada encontrada: '${key}'. É um erro de digitação?`,
      dueAndTime:
        "As opções de exibição 'due' e 'time' estão definidas. A opção 'time' será ignorada quando 'due' estiver presente.",
      projectAndSection:
        "As opções de exibição 'project' e 'section' estão definidas. A opção 'section' será ignorada quando 'project' estiver presente.",
    },
    groupedHeaders: {
      noDueDate: "Sem data de vencimento",
      overdue: "Atrasadas",
    },
  },
  commands: {
    sync: "Sincronizar com Todoist",
    addTask: "Adicionar tarefa",
    addTaskPageContent: "Adicionar tarefa com a página atual no nome da tarefa",
    addTaskPageDescription: "Adicionar tarefa com a página atual na descrição da tarefa",
  },
  tokenValidation: {
    emptyTokenError: "O token da API não pode estar vazio",
    invalidTokenError: "Opa! O Todoist não reconhece este token. Confira e tente novamente!",
  },
  dates: {
    today: "Hoje",
    tomorrow: "Amanhã",
    yesterday: "Ontem",
    nextWeek: "Semana que vem",
    lastWeekday: (weekday: string) => {
      return `${weekday} passada`;
    },
    dateTime: (date: string, time: string) => {
      return `${date} às ${time}`;
    },
    dateTimeDuration: (date: string, startTime: string, endTime: string) => {
      return `${date} às ${startTime} - ${endTime}`;
    },
    dateTimeDurationDifferentDays: (
      startDate: string,
      startTime: string,
      endDate: string,
      endTime: string,
    ): string => {
      return `${startDate} às ${startTime} - ${endDate} às ${endTime}`;
    },
    timeDuration: (startTime: string, endTime: string) => {
      return `${startTime} - ${endTime}`;
    },
    timeDurationDifferentDays: (startTime: string, endDate: string, endTime: string) => {
      return `${startTime} - ${endDate} às ${endTime}`;
    },
  },
};
