import { writable } from "svelte/store";

export const defaultSettings: ISettings = {
  fadeToggle: true,

  autoRefreshToggle: false,
  autoRefreshInterval: 60,

  renderDescription: true,

  renderDate: true,
  renderDateIcon: true,

  renderProject: true,
  renderProjectIcon: true,

  renderLabels: true,
  renderLabelsIcon: true,

  shouldWrapLinksInParens: false,

  debugLogging: false,
};

export const settings = writable<ISettings>({ ...defaultSettings });

export interface ISettings {
  fadeToggle: boolean;
  autoRefreshToggle: boolean;
  autoRefreshInterval: number;

  renderDescription: boolean;

  renderDate: boolean;
  renderDateIcon: boolean;

  renderProject: boolean;
  renderProjectIcon: boolean;

  renderLabels: boolean;
  renderLabelsIcon: boolean;

  shouldWrapLinksInParens: boolean;

  debugLogging: boolean;
}
