import type { Devices, Tick } from '../types';

const GIB = 1024 ** 3;
const CORES = 16;

export const devices: Devices = {
	cpu: {
		name: 'AMD Ryzen 7 5800X 8-Core Processor',
		logical: CORES,
		physical: 8,
		sockets: 1,
		architecture: 'x86_64',
		virtualization: 'AMD-V',
		maxFrequency: 4854,
		minFrequency: 556,
		governor: 'schedutil',
		caches: [
			{ level: 1, kind: 'Data', size: 32 * 1024, instances: 8 },
			{ level: 1, kind: 'Instruction', size: 32 * 1024, instances: 8 },
			{ level: 2, kind: 'Unified', size: 512 * 1024, instances: 8 },
			{ level: 3, kind: 'Unified', size: 32 * 1024 * 1024, instances: 1 }
		]
	},
	gpus: [
		{
			id: 'gpu:0000:07:00.0',
			name: 'NVIDIA GeForce RTX 3060',
			vendor: 'NVIDIA',
			driver: 'nvidia',
			driverVersion: '615.71.09',
			slot: '0000:07:00.0',
			link: 'PCIe 4.0 ×16',
			integrated: false,
			memoryTotal: 12 * GIB,
			powerCap: 170,
			maxClock: 2100,
			maxMemoryClock: 7501
		}
	],
	drives: [
		{ id: 'drive:nvme0n1', name: 'nvme0n1', model: 'WD_BLACK SN7100 1TB', kind: 'nvme', size: 1000204886016, removable: false, virtual: false, readOnly: false },
		{ id: 'drive:sda', name: 'sda', model: 'ST2000DM008-2UB102', kind: 'hdd', size: 2000398934016, removable: false, virtual: false, readOnly: false },
		{ id: 'drive:sdb', name: 'sdb', model: 'SPCC Solid State Disk', kind: 'ssd', size: 512110190592, removable: false, virtual: false, readOnly: false },
		{ id: 'drive:zram0', name: 'zram0', model: null, kind: 'zram', size: 8 * GIB, removable: false, virtual: true, readOnly: false }
	],
	networks: [
		{ id: 'net:eno1', name: 'eno1', kind: 'ethernet', virtual: false, model: 'RTL8111/8168/8211/8411 PCI Express Gigabit Ethernet Controller', vendor: 'Realtek Semiconductor Co., Ltd.', driver: 'r8169', mac: 'b4:2e:99:3a:51:0c' },
		{ id: 'net:wlp5s0', name: 'wlp5s0', kind: 'wifi', virtual: false, model: 'Wi-Fi 6 AX200', vendor: 'Intel Corporation', driver: 'iwlwifi', mac: '48:51:c5:0e:22:91' },
		{ id: 'net:docker0', name: 'docker0', kind: 'bridge', virtual: true, model: null, vendor: null, driver: null, mac: '02:42:7d:11:9c:04' }
	],
	batteries: [{ id: 'battery:BAT0', name: 'BAT0', model: '5B10W13930', manufacturer: 'Sunwoda', technology: 'Li-poly' }]
};

class Walk {
	constructor(
		private value: number,
		private readonly low: number,
		private readonly high: number,
		private readonly step: number
	) {}

	next() {
		const pull = ((this.low + this.high) / 2 - this.value) * 0.04;
		this.value = Math.min(this.high, Math.max(this.low, this.value + pull + (Math.random() - 0.5) * this.step));
		return this.value;
	}
}

function bursts(chance: number, size: number) {
	let remaining = 0;
	return () => {
		if (remaining > 0) remaining -= 1;
		else if (Math.random() < chance) remaining = 2 + Math.floor(Math.random() * 6);
		return remaining > 0 ? size * (0.4 + Math.random() * 0.6) : size * 0.01 * Math.random();
	};
}

const cores = Array.from({ length: CORES }, (_, index) => new Walk(10 + index * 1.5, 1, 70, 18));
const temperature = new Walk(52, 44, 71, 2);
const memory = new Walk(14.2 * GIB, 12 * GIB, 18 * GIB, 0.25 * GIB);
const gpu = new Walk(22, 3, 70, 14);
const vram = new Walk(3.1 * GIB, 2.4 * GIB, 4.2 * GIB, 0.08 * GIB);
const drives = [
	[bursts(0.25, 180e6), bursts(0.2, 120e6)],
	[bursts(0.05, 90e6), bursts(0.04, 60e6)],
	[bursts(0.08, 40e6), bursts(0.1, 30e6)],
	[bursts(0.1, 8e6), bursts(0.1, 12e6)]
];
const networks = [
	[bursts(0.3, 9e6), bursts(0.2, 1.2e6)],
	[bursts(0.1, 2e6), bursts(0.1, 0.4e6)],
	[bursts(0.05, 0.2e6), bursts(0.05, 0.1e6)]
];
const totals = { drives: drives.map(() => [412e9, 287e9]), networks: networks.map(() => [38e9, 4.1e9]) };
let charge = 82;
let uptime = 3 * 3600 + 17 * 60;

export function tick(time: number, seconds: number, detailed: string | null): Tick {
	uptime += seconds;
	charge = Math.max(5, charge - 0.004 * seconds);
	const coreUsage = cores.map((core) => core.next());
	const used = memory.next();
	const total = 32 * GIB;
	const gpuUsage = gpu.next();
	return {
		time,
		cpu: {
			usage: coreUsage.reduce((sum, value) => sum + value, 0) / CORES,
			cores: coreUsage,
			temperature: temperature.next(),
			frequencies: detailed === 'cpu' ? coreUsage.map((usage) => Math.round(2800 + usage * 28 + Math.random() * 200)) : undefined,
			load: [2.14, 1.87, 1.62],
			threads: 2143,
			switches: 38000 + Math.random() * 9000,
			uptime
		},
		memory: {
			total,
			available: total - used,
			free: 4.1 * GIB,
			buffers: 0.2 * GIB,
			cached: 11.4 * GIB,
			reclaimable: 0.9 * GIB,
			shared: 1.3 * GIB,
			dirty: 4.2e6,
			anon: used - 2 * GIB,
			kernel: 1.1 * GIB,
			committed: 29.6 * GIB,
			swapTotal: 8 * GIB,
			swapFree: 5.9 * GIB,
			swapCached: 0.1 * GIB,
			compressed: detailed === 'memory' ? { stored: 2.1 * GIB, size: 0.62 * GIB } : undefined,
			swaps: detailed === 'memory' ? [{ name: 'zram0', kind: 'compressed', size: 8 * GIB, used: 2.1 * GIB }] : undefined
		},
		gpus: [
			{
				id: 'gpu:0000:07:00.0',
				usage: gpuUsage,
				memoryUsed: vram.next(),
				memoryTotal: 12 * GIB,
				temperature: 44 + gpuUsage * 0.3,
				power: 22 + gpuUsage * 1.6,
				clock: Math.round(210 + gpuUsage * 24),
				memoryClock: gpuUsage > 10 ? 7501 : 405,
				encoder: gpuUsage > 40 ? 12 : 0,
				decoder: 6 + Math.random() * 4,
				fan: gpuUsage > 50 ? 38 : 0
			}
		],
		drives: devices.drives.map((drive, index) => {
			const [read, write] = drives[index].map((next) => next());
			totals.drives[index][0] += read * seconds;
			totals.drives[index][1] += write * seconds;
			return {
				id: drive.id,
				read,
				write,
				busy: Math.min(100, ((read + write) / 4e8) * 100),
				readTotal: totals.drives[index][0],
				writeTotal: totals.drives[index][1],
				temperature: drive.kind === 'nvme' ? 41 : drive.kind === 'hdd' ? 36 : null,
				space: detailed === drive.id ? { used: drive.size * 0.62, size: drive.size * 0.98, mounts: index === 0 ? ['/', '/home', '/boot', '/boot/efi'] : [`/mnt/${drive.name}`] } : undefined
			};
		}),
		networks: devices.networks.map((network, index) => {
			const [received, sent] = networks[index].map((next) => next());
			totals.networks[index][0] += received * seconds;
			totals.networks[index][1] += sent * seconds;
			return {
				id: network.id,
				received,
				sent,
				receivedTotal: totals.networks[index][0],
				sentTotal: totals.networks[index][1],
				link:
					detailed === network.id
						? {
								connected: network.kind !== 'bridge',
								speed: network.kind === 'ethernet' ? 1000 : null,
								mtu: 1500,
								signal: network.kind === 'wifi' ? -54 : null,
								addresses: index === 0 ? ['192.168.1.42/24', 'fd00::5a1c:9e2f:4b77:8c21/64', 'fe80::b62e:99ff:fe3a:510c/64'] : []
							}
						: undefined
			};
		}),
		batteries: [
			{
				id: 'battery:BAT0',
				charge,
				state: 'Discharging',
				power: 9.8 + Math.random(),
				energy: (charge / 100) * 52.6,
				energyFull: 52.6,
				energyDesign: 57,
				voltage: 12.1,
				cycles: 214,
				secondsLeft: ((charge / 100) * 52.6 * 3600) / 10.3,
				pluggedIn: false
			}
		]
	};
}
