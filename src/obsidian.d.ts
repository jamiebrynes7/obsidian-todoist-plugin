export class App {
    public vault: Vault;
}

export class Vault {
    public adapter: Adapter;
}

export class Adapter {
    public fs: Fs;
    public path: Path;
    public basePath: string;
}

export class Fs {
    existsSync(path: string): boolean;
    // TODO: Figure out what this is.
    readFileSync(path: string): any;
}

export class Path {
    join(...args: string[]): string;
}

export class SettingsContainer {
    empty();
}

export class SettingsTab implements ISettingsTab {
    public containerEl: SettingsContainer;

    constructor(app: any, instance: any);
}

interface ISettingsTab {
    addToggleSetting(title: string, description: string): ISettingValue<boolean>;
    addTextSetting(title: string, description: string): ISettingValue<string>;
    display();
}

export interface ISettingValue<T> {
    getValue() : T;
    setValue(value: T);
    onChange(func: () => void);
}

export type Constructor<T = {}> = new (...args: any[]) => T;
export type Settings = Constructor<typeof SettingsTab & ISettingsTab>;

export class PluginInstance<TData = {}> {
    loadData<TData>(): Promise<TData>;
    saveData<TData>(value: TData);
    
    registerSettingTab(settingsTab: ISettingsTab);
}