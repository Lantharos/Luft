import type { Devices, DriveKind, NetworkKind, Tick } from '$lib/backend/types';
import { networkRate, percent, share } from '$lib/format';
import type { Line } from '$lib/graph/draw';

export interface Resource {
	id: string;
	title: string;
	max?: number;
	floor?: number;
	binary?: boolean;
	lines: (ticks: Tick[]) => Line[];
	summary: (tick: Tick) => string;
}

const NETWORK_FLOOR = 64 * 1024;

export const DRIVE_KINDS: Record<DriveKind, string> = {
	nvme: 'NVMe SSD',
	ssd: 'SSD',
	hdd: 'Hard drive',
	usb: 'USB drive',
	sd: 'SD card',
	emmc: 'Built-in flash',
	optical: 'Optical drive',
	loop: 'Disk image',
	zram: 'Compressed memory',
	mapper: 'Mapped volume',
	encrypted: 'Encrypted volume',
	raid: 'RAID array',
	virtual: 'Virtual drive'
};

export const NETWORK_KINDS: Record<NetworkKind, string> = {
	ethernet: 'Ethernet',
	wifi: 'Wi-Fi',
	bridge: 'Bridge',
	vpn: 'VPN',
	mobile: 'Mobile broadband',
	virtual: 'Virtual network'
};

export function byId<T extends { id: string }>(list: T[], id: string) {
	return list.find((item) => item.id === id);
}

export function shortGpuName(name: string) {
	return name.replace(/^(NVIDIA|AMD|Intel(\(R\))?)\s+/i, '');
}

function unique(titles: string[]) {
	return titles.map((title, index) => (titles.indexOf(title) !== titles.lastIndexOf(title) ? `${title} ${titles.slice(0, index + 1).filter((other) => other === title).length}` : title));
}

export function resources(devices: Devices, showVirtual: boolean): Resource[] {
	const drives = devices.drives.filter((drive) => showVirtual || !drive.virtual);
	const networks = devices.networks.filter((network) => showVirtual || !network.virtual);
	const gpuTitles = unique(devices.gpus.map((gpu) => shortGpuName(gpu.name)));
	const driveTitles = unique(drives.map((drive) => drive.model ?? drive.name));
	const networkTitles = unique(networks.map((network) => NETWORK_KINDS[network.kind]));
	return [
		{
			id: 'cpu',
			title: 'Processor',
			max: 100,
			lines: (ticks) => [{ values: ticks.map((tick) => tick.cpu.usage) }],
			summary: (tick) => percent(tick.cpu.usage)
		},
		{
			id: 'memory',
			title: 'Memory',
			max: 100,
			lines: (ticks) => [{ values: ticks.map((tick) => share(tick.memory.total - tick.memory.available, tick.memory.total)) }],
			summary: (tick) => percent(share(tick.memory.total - tick.memory.available, tick.memory.total))
		},
		...devices.gpus.map(
			(gpu, index): Resource => ({
				id: gpu.id,
				title: gpuTitles[index],
				max: 100,
				lines: (ticks) => [{ values: ticks.map((tick) => byId(tick.gpus, gpu.id)?.usage ?? null) }],
				summary: (tick) => percent(byId(tick.gpus, gpu.id)?.usage ?? null)
			})
		),
		...drives.map(
			(drive, index): Resource => ({
				id: drive.id,
				title: driveTitles[index],
				max: 100,
				lines: (ticks) => [{ values: ticks.map((tick) => byId(tick.drives, drive.id)?.busy ?? null) }],
				summary: (tick) => percent(byId(tick.drives, drive.id)?.busy ?? null)
			})
		),
		...networks.map(
			(network, index): Resource => ({
				id: network.id,
				title: networkTitles[index],
				floor: NETWORK_FLOOR,
				binary: true,
				lines: (ticks) => [
					{ values: ticks.map((tick) => byId(tick.networks, network.id)?.received ?? null) },
					{ values: ticks.map((tick) => byId(tick.networks, network.id)?.sent ?? null), tone: 'soft', fill: false }
				],
				summary: (tick) => {
					const sample = byId(tick.networks, network.id);
					return sample ? `↓ ${networkRate(sample.received)}  ↑ ${networkRate(sample.sent)}` : '–';
				}
			})
		),
		...devices.batteries.map(
			(battery): Resource => ({
				id: battery.id,
				title: devices.batteries.length > 1 ? `Battery ${battery.name}` : 'Battery',
				max: 100,
				lines: (ticks) => [{ values: ticks.map((tick) => byId(tick.batteries, battery.id)?.charge ?? null) }],
				summary: (tick) => percent(byId(tick.batteries, battery.id)?.charge ?? null)
			})
		)
	];
}
