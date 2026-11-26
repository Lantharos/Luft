import { getContext, setContext } from 'svelte';
import type { App } from './app.svelte';

const KEY = Symbol('app');

export const provideApp = (app: App) => setContext(KEY, app);
export const useApp = () => getContext<App>(KEY);
