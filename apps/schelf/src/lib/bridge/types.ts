import type { Appearance } from '@luft/ui';

export type Source = 'flatpak' | 'appImage' | 'tool' | 'debian' | 'system';
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
	commands: string[];
	services: string[];
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

export interface ToolSummary {
	package: string;
	summary: string;
}

export interface SourceKey {
	fingerprint: string;
	user: string;
}

export interface RepositoryDraft {
	file: string;
	text: string;
	keys: Record<string, string>;
}

export interface CheckedSource {
	draft: RepositoryDraft;
	described: { file: string; sources: { id: string; name: string; url: string }[]; keys: SourceKey[] };
	added: boolean;
}

export interface AddedSource {
	file: string;
	name: string;
	url: string;
	packages: string[];
}

export interface Permissions {
	shared: string[];
	sockets: string[];
	devices: string[];
	filesystems: string[];
	sessionBus: string[];
	systemBus: string[];
}

export interface Screenshot {
	url: string;
	caption: string | null;
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
	| { kind: 'installFlatpakBundle'; path: string }
	| { kind: 'installDeb'; path: string }
	| { kind: 'removeDeb'; package: string }
	| { kind: 'updateDebs'; packages: string[] }
	| { kind: 'addFlatpakRepo'; path: string; name: string }
	| { kind: 'installAppImage'; path: string }
	| { kind: 'installTool'; package: string }
	| { kind: 'installToolFile'; path: string }
	| { kind: 'removeFlatpak'; installation: Installation; reference: string }
	| { kind: 'removeAppImage'; id: string }
	| { kind: 'removeTool'; package: string }
	| { kind: 'updateFlatpaks'; installation: Installation; references: string[] }
	| { kind: 'updateAppImage'; id: string }
	| { kind: 'updateTools'; packages: string[] }
	| { kind: 'installSystemPackages'; packages: string[] }
	| { kind: 'installSystemPackageFile'; path: string; package: string; repository: RepositoryDraft | null }
	| { kind: 'removeSystemPackages'; packages: string[] }
	| { kind: 'removeRepository'; file: string };

export type OpenedFile =
	| { kind: 'flatpakRef'; path: string; id: string; title: string; branch: string | null; url: string; runtime: boolean; summary: string | null; homepage: string | null; icon: string | null }
	| { kind: 'flatpakBundle'; path: string; id: string; title: string; branch: string; summary: string | null; icon: string | null; size: number; runtime: string | null; origin: string | null }
	| {
			kind: 'deb';
			path: string;
			package: string;
			name: string;
			version: string;
			summary: string;
			description: string;
			homepage: string | null;
			size: number;
			icon: string | null;
			installed: boolean;
			runsHere: boolean;
			flathub: { id: string; name: string; summary: string | null; icon: string | null; verified: boolean } | null;
	  }
	| { kind: 'flatpakRepo'; path: string; name: string; title: string; url: string; summary: string | null; homepage: string | null }
	| {
			kind: 'package';
			path: string;
			package: string;
			version: string;
			summary: string;
			description: string;
			license: string;
			homepage: string | null;
			size: number;
			installed: boolean;
			system: boolean;
			desktop: string | null;
			repository: CheckedSource | null;
			repositoryError: string | null;
			verified: boolean;
	  }
	| { kind: 'appImage'; path: string; name: string; summary: string | null; version: string | null; icon: string | null; size: number };

export interface Backend {
	appState(): Promise<AppState>;
	activationFiles(argumentsList: string[], workingDirectory: string | null): Promise<string[]>;
	flathub<T>(path: string): Promise<T>;
	flathubSearch<T>(query: string): Promise<T>;
	installed(): Promise<InstalledApp[]>;
	launch(desktop: string): Promise<void>;
	searchTools(query: string): Promise<ToolSummary[]>;
	searchSystem(query: string): Promise<ToolSummary[]>;
	sources(): Promise<AddedSource[]>;
	fetchSource(source: string): Promise<CheckedSource>;
	addSource(draft: RepositoryDraft): Promise<void>;
	permissions(installation: Installation, reference: string): Promise<Permissions>;
	fullAccess(id: string, source: Source): Promise<boolean>;
	setFullAccess(id: string, source: Source, on: boolean): Promise<void>;
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
