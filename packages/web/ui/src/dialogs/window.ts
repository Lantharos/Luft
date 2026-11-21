import { createContext } from 'svelte';

export interface DialogWindowFit {
	fit(width: number, height: number): void;
}

const [windowFit, provideDialogWindow, inDialogWindow] = createContext<DialogWindowFit>();

export { provideDialogWindow };

export const dialogWindow = () => (inDialogWindow() ? windowFit() : undefined);
