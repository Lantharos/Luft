import type { AppInfo, Catalog, Details, Devices, Entry, Signal, Tick } from '#lib/bindings.js';
import { encode } from '../rows';
import type { SystemBackend, View } from '../types';
import { advance, apps, createProcesses } from './processes';
import { devices, tick } from './system';

const PRELOADED = 240;
const UNIT = 'cgroup:';

let interval = 1000;
let history = 60;
let view: View = { page: '', visible: false, reset: false, expanded: [], system: false, everything: false, disk: true, gpu: true };
let timer: ReturnType<typeof setInterval> | undefined;
const ticks: Tick[] = [];
const processes = createProcesses(Date.now());
const background = new Set(['com.lantharos.mailman.desktop']);
const listeners = {
	tick: [] as ((tick: Tick) => void)[],
	entries: [] as ((entries: Entry[]) => void)[],
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
	if (view.page === 'processes') sendTasks();
}

function shown() {
	return view.everything ? processes : processes.filter((process) => view.expanded.includes(process.app ?? ''));
}

function owners(): AppInfo[] {
	const known = new Map(apps.map((app) => [app.key, app]));
	return [...new Set(processes.map((process) => process.app ?? ''))].map((key) => known.get(key) ?? { key, name: key.split('/').at(-1)!.replace('.service', ''), icon: null });
}

function sendTasks() {
	advance(processes, interval / 1000);
	const list = owners()
		.map((app) => entryOf(app))
		.filter((entry) => entry.processes > 0 && (entry.group !== 'system' || view.system || view.everything));
	listeners.entries.forEach((listener) => listener(list));
	const rows = encode(shown());
	listeners.processes.forEach((listener) => listener(rows));
}

function entryOf({ key, name, icon }: AppInfo): Entry {
	const members = processes.filter((process) => process.app === key);
	const desktop = !key.includes(':');
	const windowed = desktop && !background.has(key);
	const sum = (pick: (process: (typeof members)[number]) => number) => members.reduce((total, process) => total + pick(process), 0);
	return {
		key,
		name,
		icon,
		group: windowed ? 'apps' : desktop ? 'background' : 'system',
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
		paused: members.length > 0 && members.every((process) => process.state === 'T'),
		responding: true,
		main: members[0]?.pid ?? null,
		windows: windowed ? [{ pid: members[0]?.pid ?? 0, title: name, responding: true }] : []
	};
}

function membersOf(key: string) {
	return processes.filter((process) => process.app === key).map((process) => process.pid);
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
		directory: process.uid === 0 ? null : '/home/mara',
		user: process.user,
		state: process.state,
		threads: process.threads,
		nice: process.nice,
		started: process.started,
		cgroup: process.app?.startsWith(UNIT) ? process.app.slice(UNIT.length) : `/user.slice/user-1000.slice/user@1000.service/app.slice/app-kestrel-${process.app?.replace('.desktop', '')}-${pid}.scope`,
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

export const sample: SystemBackend = {
	view: async (next) => {
		view = next;
		if (!view.visible || view.page !== 'processes') return;
		sendCatalog({ reset: true, added: processes.map(({ base: _base, ...entry }) => entry), removed: [], apps: owners() });
		setTimeout(sendTasks, 300);
	},
	configure: async (nextInterval, nextHistory) => {
		interval = nextInterval;
		history = nextHistory;
		schedule();
	},
	snapshot: async (after) => ({ devices: structuredClone(devices) as Devices, ticks: ticks.filter((candidate) => candidate.time > after) }),
	details: async (pid) => details(pid),
	signal: async (listed, kind) =>
		signal(
			listed.map((process) => process.pid),
			kind
		),
	signalApp: async (key, kind) => signal(membersOf(key), kind),
	openApp: async (key) => void background.delete(key),
	stopApp: async (key) => {
		signal(membersOf(key), 'end');
		background.delete(key);
	},
	priority: async (pid, nice) => {
		const process = processes.find((candidate) => candidate.pid === pid);
		if (process) process.nice = nice;
	},
	priorityApp: async (key, nice) => {
		for (const process of processes) if (process.app === key) process.nice = nice;
	},
	onTick: (callback) => void listeners.tick.push(callback),
	onDevices: () => {},
	onEntries: (callback) => void listeners.entries.push(callback),
	onCatalog: (callback) => void listeners.catalog.push(callback),
	onProcesses: (callback) => void listeners.processes.push(callback)
};

schedule();
