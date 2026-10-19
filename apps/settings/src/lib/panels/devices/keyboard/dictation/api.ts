import { activationToken } from '@luft/ui';
import { invoke, listen } from '#lib/bridge.js';

export type Engine = 'parakeet' | 'whisper';

export type EngineChoice = 'automatic' | Engine;

export interface Download {
	received: number;
	total: number;
	problem: string | null;
}

export interface Model {
	id: string;
	engine: Engine;
	name: string;
	licence: string;
	credit: string;
	homepage: string;
	size: number;
	installed: boolean;
	usage: number;
	download: Download | null;
}

export interface Language {
	code: string;
	name: string;
	engine: Engine;
}

export interface Overview {
	models: Model[];
	languages: Language[];
	language: Language;
	engine: Engine;
	engines: Engine[];
	model: string | null;
}

export const overview = () => invoke<Overview>('dictation');
export const onOverview = (callback: (overview: Overview) => void) => listen<Overview>('dictation.changed', callback);
export const install = (model: string) => invoke<void>('dictation_install', { model });
export const cancelInstall = (model: string) => invoke<void>('dictation_cancel', { model });
export const remove = (model: string) => invoke<void>('dictation_remove', { model });
export const openHomepage = async (url: string) => invoke<void>('dictation_open_homepage', { url, token: await activationToken() });
