import type { AppState, AppUsage, Catalog, commands, Details, Devices, Signal, Snapshot, Tick } from '#lib/bindings.js';

export type View = Parameters<typeof commands.monitorView>[0];
export type SavedSettings = Parameters<typeof commands.settingsWrite>[0];

export interface Backend extends SystemBackend {
	appState(): Promise<AppState>;
	saveSettings(settings: SavedSettings): Promise<unknown>;
}

export interface SystemBackend {
	view(view: View): Promise<unknown>;
	configure(interval: number, history: number): Promise<unknown>;
	snapshot(after: number): Promise<Snapshot>;
	details(pid: number): Promise<Details>;
	signal(pids: number[], signal: Signal): Promise<unknown>;
	signalApp(key: string, signal: Signal): Promise<unknown>;
	openApp(key: string, token: string | null): Promise<unknown>;
	stopApp(key: string): Promise<unknown>;
	priority(pid: number, nice: number): Promise<unknown>;
	onTick(callback: (tick: Tick) => void): void;
	onDevices(callback: (devices: Devices) => void): void;
	onApps(callback: (apps: AppUsage[]) => void): void;
	onCatalog(callback: (catalog: Catalog) => void): void;
	onProcesses(callback: (rows: Float32Array) => void): void;
}
