import { resolved, t } from '@luft/i18n';
import type { Devices, DriveKind, NetworkKind, Tick } from '#lib/bindings.js';
import { networkRate, percent, share } from '#lib/format.js';
import type { Line } from '#lib/graph/draw.js';

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

export const driveKinds = resolved(
	(): Record<DriveKind, string> => ({
		nvme: t('barometer-drive-kind-nvme'),
		ssd: t('barometer-drive-kind-ssd'),
		hdd: t('barometer-drive-kind-hdd'),
		usb: t('barometer-drive-kind-usb'),
		sd: t('barometer-drive-kind-sd'),
		emmc: t('barometer-drive-kind-emmc'),
		optical: t('barometer-drive-kind-optical'),
		loop: t('barometer-drive-kind-loop'),
		zram: t('barometer-drive-kind-zram'),
		mapper: t('barometer-drive-kind-mapper'),
		encrypted: t('barometer-drive-kind-encrypted'),
		raid: t('barometer-drive-kind-raid'),
		virtual: t('barometer-drive-kind-virtual')
	})
);

export const networkKinds = resolved(
	(): Record<NetworkKind, string> => ({
		ethernet: t('barometer-network-kind-ethernet'),
		wifi: t('barometer-network-kind-wifi'),
		bridge: t('barometer-network-kind-bridge'),
		vpn: t('barometer-network-kind-vpn'),
		mobile: t('barometer-network-kind-mobile'),
		virtual: t('barometer-network-kind-virtual')
	})
);

export function byId<T extends { id: string }>(list: T[], id: string) {
	return list.find((item) => item.id === id);
}

export function shortGpuName(name: string) {
	return name.replace(/^(NVIDIA|AMD|Intel(\(R\))?)\s+/i, '');
}

function unique(titles: string[]) {
	return titles.map((title, index) =>
		titles.indexOf(title) !== titles.lastIndexOf(title) ? t('barometer-numbered', { name: title, number: titles.slice(0, index + 1).filter((other) => other === title).length }) : title
	);
}

export function resources(devices: Devices, showVirtual: boolean): Resource[] {
	const drives = devices.drives.filter((drive) => showVirtual || !drive.virtual);
	const networks = devices.networks.filter((network) => showVirtual || !network.virtual);
	const gpuTitles = unique(devices.gpus.map((gpu) => shortGpuName(gpu.name)));
	const driveTitles = unique(drives.map((drive) => drive.model ?? drive.name));
	const networkTitles = unique(networks.map((network) => networkKinds()[network.kind]));
	return [
		{
			id: 'cpu',
			title: t('barometer-cpu-title'),
			max: 100,
			lines: (ticks) => [{ values: ticks.map((tick) => tick.cpu.usage) }],
			summary: (tick) => percent(tick.cpu.usage)
		},
		{
			id: 'memory',
			title: t('barometer-memory-title'),
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
				title: devices.batteries.length > 1 ? t('barometer-battery-named', { name: battery.name }) : t('barometer-battery-title'),
				max: 100,
				lines: (ticks) => [{ values: ticks.map((tick) => byId(tick.batteries, battery.id)?.charge ?? null) }],
				summary: (tick) => percent(byId(tick.batteries, battery.id)?.charge ?? null)
			})
		)
	];
}
