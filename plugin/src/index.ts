import { settings, SettingsTab } from "./settings";
import type { ISettings } from "./settings";
import debug from "./log";
import { App, Notice, Plugin, requestUrl } from "obsidian";
import type { PluginManifest } from "obsidian";
import TodoistApiTokenModal from "./modals/enterToken/enterTokenModal";
import CreateTaskModal from "./modals/createTask/createTaskModal";
import { QueryInjector } from "./query/injector";
import { getTokenPath } from "./token";
import { TodoistAdapter } from "./data";
import { TodoistApiClient } from "./api";
import type { RequestParams, WebFetcher, WebResponse } from "./api/fetcher";

export default class TodoistPlugin extends Plugin {
    public options: ISettings | null;

    private todoistAdapter: TodoistAdapter = new TodoistAdapter();

    constructor(app: App, pluginManifest: PluginManifest) {
        super(app, pluginManifest);
        this.options = null;

        settings.subscribe((value) => {
            debug({
                msg: "Settings changed",
                context: value,
            });

            this.options = value;
        });
    }

    async onload() {
        const queryInjector = new QueryInjector(this.todoistAdapter)
        this.registerMarkdownCodeBlockProcessor("todoist", queryInjector.onNewBlock.bind(queryInjector));
        this.addSettingTab(new SettingsTab(this.app, this));

        this.addCommand({
            id: "todoist-sync",
            name: "Sync with Todoist",
            callback: async () => {
                debug("Syncing with Todoist API");
                this.todoistAdapter.sync();
            },
        });

        this.addCommand({
            id: "todoist-add-task",
            name: "Add Todoist task",
            callback: () => {
                if (this.options === null) {
                    new Notice("Failed to load settings, cannot open task creation modal.");
                    return;
                }

                new CreateTaskModal(
                    this.app,
                    this.todoistAdapter,
                    this.options,
                    false
                );
            },
        });

        this.addCommand({
            id: "todoist-add-task-current-page",
            name: "Add Todoist task with the current page",
            callback: () => {
                if (this.options === null) {
                    new Notice("Failed to load settings, cannot open task creation modal.");
                    return;
                }

                new CreateTaskModal(
                    this.app,
                    this.todoistAdapter,
                    this.options,
                    true
                );
            },
        });

        await this.loadOptions();

        const token = await this.getToken();
        if (token.length === 0) {
            alert(
                "Provided token was empty, please enter it in the settings and restart Obsidian or reload plugin."
            );
            return;
        }
        const api = new TodoistApiClient(token, new ObsidianFetcher());
        await this.todoistAdapter.initialize(api)
    }

    private async getToken(): Promise<string> {
        const tokenPath = getTokenPath(app.vault);

        try {
            const token = await this.app.vault.adapter.read(tokenPath);
            return token;
        } catch (e) {
            const tokenModal = new TodoistApiTokenModal(this.app);
            await tokenModal.waitForClose;
            const token = tokenModal.token;

            await this.app.vault.adapter.write(tokenPath, token);
            return token;
        }
    }

    async loadOptions(): Promise<void> {
        const options = await this.loadData();

        settings.update((old) => {
            return {
                ...old,
                ...(options || {}),
            };
        });

        await this.saveData(this.options);
    }

    async writeOptions(changeOpts: (settings: ISettings) => void): Promise<void> {
        settings.update((old) => {
            changeOpts(old);
            return old;
        });
        await this.saveData(this.options);
    }
}

class ObsidianFetcher implements WebFetcher {
    public async fetch(params: RequestParams): Promise<WebResponse> {
        const response = await requestUrl({
            url: params.url,
            method: params.method,
            body: params.body,
            headers: params.headers,
            throw: false,
        });

        return {
            statusCode: response.status,
            body: response.text,
        }
    }

}
