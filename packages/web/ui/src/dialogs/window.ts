import { createContext } from 'svelte';

export interface DialogWindowFit {
	fit(width: number, height: number): void;
}

export const [dialogWindow, provideDialogWindow] = createContext<DialogWindowFit | undefined>();
