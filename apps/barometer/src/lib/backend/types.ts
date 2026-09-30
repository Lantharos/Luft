import type { Appearance } from '@luft/ui';

export interface Cache {
	level: number;
	kind: string;
	size: number;
	instances: number;
}

export interface CpuInfo {
	name: string;
	logical: number;
	physical: number;
	sockets: number;
	architecture: string;
	virtualization: string | null;
	maxFrequency: number | null;
	minFrequency: number | null;
	governor: string | null;
	caches: Cache[];
}

export interface GpuInfo {
	id: string;
	name: string;
	vendor: string;
	driver: string | null;
	driverVersion: string | null;
	slot: string;
	link: string | null;
	integrated: boolean;
	memoryTotal: number | null;
	powerCap: number | null;
	maxClock: number | null;
	maxMemoryClock: number | null;
}

export type DriveKind = 'nvme' | 'ssd' | 'hdd' | 'usb' | 'sd' | 'emmc' | 'optical' | 'loop' | 'zram' | 'mapper' | 'encrypted' | 'raid' | 'virtual';

export interface DriveInfo {
	id: string;
	name: string;
	model: string | null;
	kind: DriveKind;
	size: number;
	removable: boolean;
	virtual: boolean;
	readOnly: boolean;
}

export type NetworkKind = 'wifi' | 'ethernet' | 'bridge' | 'vpn' | 'mobile' | 'virtual';

export interface NetworkInfo {
	id: string;
	name: string;
	kind: NetworkKind;
	virtual: boolean;
	model: string | null;
	vendor: string | null;
	driver: string | null;
	mac: string | null;
}

export interface BatteryInfo {
	id: string;
	name: string;
	model: string | null;
	manufacturer: string | null;
	technology: string | null;
}

export interface Devices {
	cpu: CpuInfo;
	gpus: GpuInfo[];
	drives: DriveInfo[];
	networks: NetworkInfo[];
	batteries: BatteryInfo[];
}

export interface CpuSample {
	usage: number;
	cores: number[];
	temperature: number | null;
	frequencies?: number[];
	load: [number, number, number];
	threads: number;
	switches: number;
	uptime: number;
}

export interface SwapDevice {
	name: string;
	kind: string;
	size: number;
	used: number;
}

export interface MemorySample {
	total: number;
	available: number;
	free: number;
	buffers: number;
	cached: number;
	reclaimable: number;
	shared: number;
	dirty: number;
	anon: number;
	kernel: number;
	committed: number;
	swapTotal: number;
	swapFree: number;
	swapCached: number;
	compressed?: { stored: number; size: number };
	swaps?: SwapDevice[];
}

export interface GpuSample {
	id: string;
	usage: number | null;
	memoryUsed: number | null;
	memoryTotal: number | null;
	temperature: number | null;
	power: number | null;
	clock: number | null;
	memoryClock: number | null;
	encoder: number | null;
	decoder: number | null;
	fan: number | null;
}

export interface DriveSample {
	id: string;
	read: number;
	write: number;
	busy: number;
	readTotal: number;
	writeTotal: number;
	temperature: number | null;
	space?: { used: number; size: number; mounts: string[] };
}

export interface NetworkSample {
	id: string;
	received: number;
	sent: number;
	receivedTotal: number;
	sentTotal: number;
	link?: { connected: boolean; speed: number | null; mtu: number | null; signal: number | null; addresses: string[] };
}

export interface BatterySample {
	id: string;
	charge: number;
	state: string;
	power: number | null;
	energy: number | null;
	energyFull: number | null;
	energyDesign: number | null;
	voltage: number | null;
	cycles: number | null;
	secondsLeft: number | null;
	pluggedIn: boolean;
}

export interface Tick {
	time: number;
	cpu: CpuSample;
	memory: MemorySample;
	gpus: GpuSample[];
	drives: DriveSample[];
	networks: NetworkSample[];
	batteries: BatterySample[];
}

export interface Snapshot {
	devices: Devices;
	ticks: Tick[];
}

export interface AppInfo {
	key: string;
	name: string;
	icon: string | null;
}

export interface ProcessEntry {
	pid: number;
	ppid: number;
	name: string;
	command: string;
	user: string;
	uid: number;
	app: string | null;
	started: number;
}

export interface Catalog {
	reset: boolean;
	added: ProcessEntry[];
	removed: number[];
	apps: AppInfo[];
}

export interface Details {
	pid: number;
	ppid: number;
	parent: string | null;
	arguments: string[];
	executable: string | null;
	directory: string | null;
	user: string;
	state: string;
	threads: number;
	nice: number;
	started: number;
	cgroup: string;
	container: string | null;
	openFiles: number | null;
	oomScore: number | null;
	resident: number | null;
	anonymous: number | null;
	fileBacked: number | null;
	shared: number | null;
	swap: number | null;
	virtualSize: number | null;
	switches: number | null;
}

export interface AppUsage {
	key: string;
	name: string;
	icon: string | null;
	cpu: number;
	memory: number;
	read: number;
	write: number;
	readTotal: number;
	writeTotal: number;
	gpu: number;
	vram: number;
	encoder: number;
	decoder: number;
	processes: number;
	threads: number;
	paused: boolean;
}

export interface View {
	page: string;
	visible: boolean;
	reset: boolean;
	expanded: string[];
	disk: boolean;
	gpu: boolean;
}

export type Signal = 'end' | 'kill' | 'stop' | 'continue';

export interface AppState extends Appearance {
	settings: Record<string, unknown> | null;
}

export interface Backend {
	appState(): Promise<AppState>;
	saveSettings(settings: Record<string, unknown>): Promise<void>;
	view(view: View): Promise<void>;
	configure(interval: number, history: number): Promise<void>;
	snapshot(after: number): Promise<Snapshot>;
	details(pid: number): Promise<Details>;
	signal(pids: number[], signal: Signal): Promise<void>;
	signalApp(key: string, signal: Signal): Promise<void>;
	priority(pid: number, nice: number): Promise<void>;
	onTick(callback: (tick: Tick) => void): void;
	onDevices(callback: (devices: Devices) => void): void;
	onApps(callback: (apps: AppUsage[]) => void): void;
	onCatalog(callback: (catalog: Catalog) => void): void;
	onProcesses(callback: (rows: Float32Array) => void): void;
}
