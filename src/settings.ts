import { writable } from 'svelte/store';

export const Settings = writable<ISettings>({
  fadeToggle: true, 
  autoRefreshToggle: false, 
  autoRefreshInterval: 60,
});

export interface ISettings {
  fadeToggle: boolean,
  autoRefreshToggle: boolean,
  autoRefreshInterval: number
}
