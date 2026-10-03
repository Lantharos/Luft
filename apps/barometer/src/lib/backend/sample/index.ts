import { encode } from '../rows';
import type { AppUsage, Backend, Catalog, Details, Devices, Signal, Tick, View } from '../types';
import { advance, apps, createProcesses } from './processes';
import { devices, tick } from './system';

const PRELOADED = 240;

let interval = 1000;
let history = 60;
let view: View = { page: '', visible: false, reset: false, expanded: [], disk: true, gpu: true };
let timer: ReturnType<typeof setInterval> | undefined;
let settings: Record<string, unknown> | null = null;
const ticks: Tick[] = [];
const processes = createProcesses(Date.now());
const listeners = {
	tick: [] as ((tick: Tick) => void)[],
	apps: [] as ((apps: AppUsage[]) => void)[],
	catalog: [] as ((catalog: Catalog) => void)[],
	processes: [] as ((rows: Float32Array) => void)[]
};

const start = Date.now() - PRELOADED * interval;
for (let index = 0; index < PRELOADED; index++) ticks.push(tick(start + index * interval, interval / 1000, null));

function schedule() {
	clearInterval(timer);
	timer = setInterval(step, interval);
}

function step() {
	const next = tick(Date.now(), interval / 1000, view.visible ? view.page : null);
	ticks.push(next);
	while (ticks.length && ticks[0].time < next.time - history * 1000) ticks.shift();
	if (!view.visible) return;
	listeners.tick.forEach((listener) => listener(next));
	if (view.page === 'apps' || view.page === 'processes') sendTasks();
}

function shown() {
	return view.page === 'apps' ? processes.filter((process) => process.app && view.expanded.includes(process.app)) : processes;
}

function sendTasks() {
	advance(processes, interval / 1000);
	if (view.page === 'apps') {
		const usage = apps.map((app) => usageOf(app.key, app.name));
		listeners.apps.forEach((listener) => listener(usage));
	}
	const rows = encode(shown());
	listeners.processes.forEach((listener) => listener(rows));
}

function usageOf(key: string, name: string): AppUsage {
	const members = processes.filter((process) => process.app === key);
	const sum = (pick: (process: (typeof members)[number]) => number) => members.reduce((total, process) => total + pick(process), 0);
	return {
		key,
		name,
		icon: null,
		cpu: sum((process) => process.cpu),
		memory: sum((process) => process.memory),
		read: sum((process) => process.read),
		write: sum((process) => process.write),
		readTotal: sum((process) => process.readTotal),
		writeTotal: sum((process) => process.writeTotal),
		gpu: Math.min(100, sum((process) => process.gpu)),
		vram: sum((process) => process.vram),
		encoder: 0,
		decoder: 0,
		processes: members.length,
		threads: sum((process) => process.threads),
		paused: members.length > 0 && members.every((process) => process.state === 'T')
	};
}

function signal(pids: number[], kind: Signal) {
	if (kind === 'stop' || kind === 'continue') {
		for (const process of processes) if (pids.includes(process.pid)) process.state = kind === 'stop' ? 'T' : 'S';
		return;
	}
	if (processes.some((process) => pids.includes(process.pid) && process.uid === 0)) throw new Error('Authentication was cancelled');
	const ended = new Set(pids);
	for (let index = processes.length - 1; index >= 0; index--) if (ended.has(processes[index].pid)) processes.splice(index, 1);
	sendCatalog({ reset: false, added: [], removed: pids, apps: [] });
}

function sendCatalog(catalog: Catalog) {
	listeners.catalog.forEach((listener) => listener(catalog));
}

function details(pid: number): Details {
	const process = processes.find((candidate) => candidate.pid === pid);
	if (!process) throw new Error('This process has already ended');
	return {
		pid,
		ppid: process.ppid,
		parent: 'systemd',
		arguments: process.command.split(' '),
		executable: process.command.split(' ')[0],
		directory: process.uid === 0 ? null : '/home/kristof',
		user: process.user,
		state: process.state,
		threads: process.threads,
		nice: process.nice,
		started: process.started,
		cgroup: process.app ? `/user.slice/user-1000.slice/user@1000.service/app.slice/app-kestrel-${process.app.replace('.desktop', '')}-${pid}.scope` : '/system.slice',
		container: process.app === 'com.spotify.Client.desktop' ? 'Flatpak' : null,
		openFiles: process.uid === 0 ? null : 40 + (pid % 90),
		oomScore: 668,
		resident: process.memory * 1.3,
		anonymous: process.memory,
		fileBacked: process.memory * 0.25,
		shared: process.memory * 0.05,
		swap: 0,
		virtualSize: process.memory * 9,
		switches: pid * 31
	};
}

export const sample: Backend = {
	appState: async () => ({ translucent: false, palette: null, scheme: 'dark', settings }),
	saveSettings: async (value) => void (settings = value),
	view: async (next) => {
		view = next;
		if (!view.visible || (view.page !== 'apps' && view.page !== 'processes')) return;
		sendCatalog({ reset: true, added: processes.map(({ base: _base, ...entry }) => entry), removed: [], apps });
		setTimeout(sendTasks, 300);
	},
	configure: async (nextInterval, nextHistory) => {
		interval = nextInterval;
		history = nextHistory;
		schedule();
	},
	snapshot: async (after) => ({ devices: structuredClone(devices) as Devices, ticks: ticks.filter((candidate) => candidate.time > after) }),
	details: async (pid) => details(pid),
	signal: async (pids, kind) => signal(pids, kind),
	signalApp: async (key, kind) =>
		signal(
			processes.filter((process) => process.app === key).map((process) => process.pid),
			kind
		),
	priority: async (pid, nice) => {
		const process = processes.find((candidate) => candidate.pid === pid);
		if (process) process.nice = nice;
	},
	onTick: (callback) => void listeners.tick.push(callback),
	onDevices: () => {},
	onApps: (callback) => void listeners.apps.push(callback),
	onCatalog: (callback) => void listeners.catalog.push(callback),
	onProcesses: (callback) => void listeners.processes.push(callback)
};

schedule();
