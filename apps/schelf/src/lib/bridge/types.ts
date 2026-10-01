import type { Appearance } from '@luft/ui';

export type Source = 'flatpak' | 'package' | 'appImage';
export type Installation = 'user' | 'system';

export interface AppState extends Appearance {
	files: string[];
	page: string | null;
}

export interface InstalledApp {
	key: string;
	source: Source;
	id: string;
	desktop: string | null;
	name: string;
	summary: string | null;
	icon: string | null;
	version: string | null;
	size: number;
	origin: string;
	installation: Installation | null;
	reference: string | null;
	package: string | null;
	path: string | null;
}

export interface AppUpdate {
	key: string;
	source: Source;
	id: string;
	desktop: string | null;
	name: string;
	icon: string | null;
	from: string | null;
	to: string | null;
	size: number;
	platform: boolean;
	installation: Installation | null;
	reference: string | null;
	package: string | null;
}

export interface Updates {
	apps: AppUpdate[];
	checked: number;
	error: string | null;
}

export interface Permissions {
	shared: string[];
	sockets: string[];
	devices: string[];
	filesystems: string[];
	sessionBus: string[];
	systemBus: string[];
}

export interface FedoraSummary {
	id: string;
	package: string;
	name: string;
	summary: string;
	icon: string | null;
	categories: string[];
	keywords: string[];
	screenshots: number;
}

export interface Screenshot {
	url: string;
	caption: string | null;
}

export interface PackageDetails {
	package: { id: string; name: string; version: string; arch: string; data: string };
	summary: string;
	description: string;
	url: string;
	license: string;
	size: number;
	downloadSize: number;
}

export interface FedoraApp extends Omit<FedoraSummary, 'screenshots'> {
	description: string;
	developer: string | null;
	license: string | null;
	homepage: string | null;
	screenshots: Screenshot[];
	details: PackageDetails | null;
}

export type Stage = 'waiting' | 'preparing' | 'downloading' | 'installing' | 'removing' | 'finishing';
export type Action = 'install' | 'remove' | 'update';

export interface Progress {
	stage: Stage;
	fraction: number | null;
}

export interface Operation {
	id: number;
	key: string;
	members: string[];
	title: string;
	action: Action;
	state: 'queued' | 'running' | 'failed';
	progress: Progress | null;
	error: string | null;
}

export interface Finished {
	keys: string[];
	action: Action;
	succeeded: boolean;
}

export type Job =
	| { kind: 'installFlathub'; id: string }
	| { kind: 'installFlatpakRef'; path: string }
	| { kind: 'addFlatpakRepo'; path: string; name: string }
	| { kind: 'installPackage'; package: string }
	| { kind: 'installPackageFile'; path: string }
	| { kind: 'installAppImage'; path: string }
	| { kind: 'removeFlatpak'; installation: Installation; reference: string }
	| { kind: 'removePackage'; package: string }
	| { kind: 'removeAppImage'; id: string }
	| { kind: 'updateFlatpaks'; installation: Installation; references: string[] }
	| { kind: 'updatePackages'; packages: string[] }
	| { kind: 'updateAppImage'; id: string };

export type OpenedFile =
	| { kind: 'flatpakRef'; path: string; id: string; title: string; branch: string | null; url: string; runtime: boolean; summary: string | null; homepage: string | null; icon: string | null }
	| { kind: 'flatpakRepo'; path: string; name: string; title: string; url: string; summary: string | null; homepage: string | null }
	| { kind: 'package'; path: string; package: string; version: string; summary: string; description: string; license: string; homepage: string | null; size: number; installed: boolean }
	| { kind: 'appImage'; path: string; name: string; summary: string | null; version: string | null; icon: string | null; size: number };

export interface Backend {
	appState(): Promise<AppState>;
	activationFiles(argumentsList: string[], workingDirectory: string | null): Promise<string[]>;
	flathub<T>(path: string): Promise<T>;
	flathubSearch<T>(query: string): Promise<T>;
	fedoraApps(): Promise<FedoraSummary[]>;
	fedoraApp(id: string): Promise<FedoraApp>;
	installed(): Promise<InstalledApp[]>;
	launch(desktop: string): Promise<void>;
	removalPlan(packageName: string): Promise<string[]>;
	permissions(installation: Installation, reference: string): Promise<Permissions>;
	checkUpdates(): Promise<Updates>;
	inspectFile(path: string): Promise<OpenedFile>;
	chooseAppImage(): Promise<string | null>;
	operations(): Promise<Operation[]>;
	start(key: string, title: string, job: Job, members?: string[]): Promise<number>;
	cancel(id: number): Promise<void>;
	openUrl(url: string): Promise<void>;
	onOperations(callback: (operations: Operation[]) => void): () => void;
	onLibraryChanged(callback: (finished: Finished) => void): () => void;
	onActivated(callback: (activation: { arguments: string[]; workingDirectory: string | null }) => void): () => void;
}
