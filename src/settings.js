import { writable } from 'svelte/store';

export const Settings = writable({
  fadeToggle: true, 
  autoRefreshToggle: false, 
  autoRefreshInterval: 60,
});