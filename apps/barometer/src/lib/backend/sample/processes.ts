import type { Usage } from '../rows';
import type { AppInfo, ProcessEntry } from '../types';

const MIB = 1024 ** 2;

export const apps: AppInfo[] = [
	{ key: 'helium.desktop', name: 'Helium', icon: null },
	{ key: 'com.lantharos.tern.desktop', name: 'Tern', icon: null },
	{ key: 'com.lantharos.rover.desktop', name: 'Rover', icon: null },
	{ key: 'com.lantharos.draft.desktop', name: 'Draft', icon: null },
	{ key: 'com.lantharos.barometer.desktop', name: 'Barometer', icon: null },
	{ key: 'discord.desktop', name: 'Discord', icon: null },
	{ key: 'com.spotify.Client.desktop', name: 'Spotify', icon: null },
	{ key: 'steam.desktop', name: 'Steam', icon: null },
	{ key: 'dev.zed.Zed.desktop', name: 'Zed', icon: null }
];

interface Template {
	name: string;
	command: string;
	app?: string;
	user?: string;
	count?: number;
	cpu: number;
	memory: number;
	gpu?: number;
	vram?: number;
}

const templates: Template[] = [
	{ name: 'systemd', command: '/usr/lib/systemd/systemd --switched-root --system --deserialize=49', user: 'root', cpu: 0.1, memory: 18 },
	{ name: 'systemd-journald', command: '/usr/lib/systemd/systemd-journald', user: 'root', cpu: 0.2, memory: 42 },
	{ name: 'NetworkManager', command: '/usr/sbin/NetworkManager --no-daemon', user: 'root', cpu: 0.1, memory: 21 },
	{ name: 'dbus-broker', command: 'dbus-broker --log 4 --controller 9 --machine-id 5c1e --max-bytes 536870912', cpu: 0.2, memory: 6 },
	{ name: 'kestrel', command: '/usr/bin/kestrel', cpu: 3.2, memory: 412, gpu: 4, vram: 280 },
	{ name: 'Xwayland', command: '/usr/bin/Xwayland :0 -rootless -noreset -accessx', cpu: 0.4, memory: 96, gpu: 0.5, vram: 40 },
	{ name: 'pipewire', command: '/usr/bin/pipewire', cpu: 0.8, memory: 24 },
	{ name: 'wireplumber', command: '/usr/bin/wireplumber', cpu: 0.2, memory: 31 },
	{ name: 'pipewire-pulse', command: '/usr/bin/pipewire-pulse', cpu: 0.3, memory: 18 },
	{ name: 'xdg-desktop-portal', command: '/usr/libexec/xdg-desktop-portal', cpu: 0, memory: 22 },
	{ name: 'gvfsd', command: '/usr/libexec/gvfsd', cpu: 0, memory: 9 },
	{ name: 'ollama', command: '/usr/local/bin/ollama serve', user: 'ollama', cpu: 0.1, memory: 64 },
	{ name: 'sshd', command: 'sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups', user: 'root', cpu: 0, memory: 8 },
	{ name: 'containerd', command: '/usr/bin/containerd', user: 'root', cpu: 0.3, memory: 48 },
	{ name: 'helium', command: '/opt/helium/helium', app: 'helium.desktop', cpu: 4.1, memory: 612, gpu: 3, vram: 360 },
	{ name: 'helium', command: '/opt/helium/helium --type=renderer --crashpad-handler-pid=5406 --enable-crash-reporter', app: 'helium.desktop', count: 11, cpu: 1.6, memory: 190 },
	{ name: 'helium', command: '/opt/helium/helium --type=gpu-process --crashpad-handler-pid=5406', app: 'helium.desktop', cpu: 2.3, memory: 240, gpu: 8, vram: 520 },
	{ name: 'tern', command: '/home/kristof/.local/share/sabine/apps/com.lantharos.tern/tern', app: 'com.lantharos.tern.desktop', cpu: 0.4, memory: 38 },
	{ name: 'sabine-host', command: 'sabine-host --type=renderer --lang=en-US', app: 'com.lantharos.tern.desktop', count: 3, cpu: 0.6, memory: 120 },
	{ name: 'fish', command: '/usr/bin/fish', app: 'com.lantharos.tern.desktop', count: 3, cpu: 0, memory: 12 },
	{ name: 'cargo', command: 'cargo build --release', app: 'com.lantharos.tern.desktop', cpu: 3.4, memory: 380 },
	{ name: 'rustc', command: 'rustc --crate-name barometer_lib --edition=2024 src/lib.rs', app: 'com.lantharos.tern.desktop', count: 4, cpu: 92, memory: 520 },
	{ name: 'rover', command: '/home/kristof/.local/share/sabine/apps/com.lantharos.rover/rover', app: 'com.lantharos.rover.desktop', cpu: 0.2, memory: 64 },
	{ name: 'sabine-host', command: 'sabine-host --type=renderer', app: 'com.lantharos.rover.desktop', count: 2, cpu: 0.3, memory: 110 },
	{ name: 'draft', command: '/home/kristof/.local/share/sabine/apps/com.lantharos.draft/draft', app: 'com.lantharos.draft.desktop', cpu: 0.1, memory: 44 },
	{ name: 'sabine-host', command: 'sabine-host --type=renderer', app: 'com.lantharos.draft.desktop', count: 2, cpu: 0.5, memory: 150 },
	{ name: 'barometer', command: '/home/kristof/.local/share/sabine/apps/com.lantharos.barometer/barometer', app: 'com.lantharos.barometer.desktop', cpu: 0.3, memory: 21 },
	{ name: 'sabine-host', command: 'sabine-host --type=renderer', app: 'com.lantharos.barometer.desktop', count: 2, cpu: 0.4, memory: 96 },
	{ name: 'Discord', command: '/usr/lib64/discord/Discord', app: 'discord.desktop', cpu: 1.2, memory: 310, gpu: 1, vram: 120 },
	{ name: 'Discord', command: '/usr/lib64/discord/Discord --type=renderer', app: 'discord.desktop', count: 3, cpu: 0.9, memory: 240 },
	{ name: 'spotify', command: '/app/extra/share/spotify/spotify', app: 'com.spotify.Client.desktop', cpu: 1.8, memory: 280, gpu: 1, vram: 90 },
	{ name: 'spotify', command: '/app/extra/share/spotify/spotify --type=renderer', app: 'com.spotify.Client.desktop', count: 2, cpu: 0.7, memory: 160 },
	{ name: 'steam', command: '/home/kristof/.local/share/Steam/ubuntu12_32/steam -srt-logger-opened', app: 'steam.desktop', cpu: 0.6, memory: 220 },
	{ name: 'steamwebhelper', command: './steamwebhelper -lang=en_US -cachedir=/home/kristof/.local/share/Steam/config/htmlcache', app: 'steam.desktop', count: 4, cpu: 0.3, memory: 140 },
	{ name: 'zed-editor', command: '/usr/lib/zed/zed-editor', app: 'dev.zed.Zed.desktop', cpu: 1.1, memory: 460, gpu: 2, vram: 180 },
	{ name: 'rust-analyzer', command: '/home/kristof/.local/share/zed/languages/rust-analyzer/rust-analyzer', app: 'dev.zed.Zed.desktop', cpu: 6.2, memory: 1850 }
];

export interface SampleProcess extends ProcessEntry, Usage {
	base: { cpu: number; memory: number; gpu: number; vram: number };
}

export function createProcesses(now: number): SampleProcess[] {
	let pid = 1;
	const processes: SampleProcess[] = [];
	for (const template of templates) {
		for (let copy = 0; copy < (template.count ?? 1); copy++) {
			pid += 17 + ((pid * 7) % 211);
			const cpu = template.cpu * (0.6 + ((pid % 7) / 7) * 0.8);
			processes.push({
				pid,
				ppid: 1,
				name: template.name,
				command: template.command,
				user: template.user ?? 'kristof',
				uid: template.user ? 0 : 1000,
				app: template.app ?? null,
				started: now / 1000 - 3600 * 3 + pid,
				cpu,
				memory: template.memory * MIB,
				read: 0,
				write: 0,
				gpu: template.gpu ?? 0,
				vram: (template.vram ?? 0) * MIB,
				encoder: 0,
				decoder: 0,
				nice: template.user === 'root' ? -2 : 0,
				state: cpu > 50 ? 'R' : 'S',
				threads: 1 + (pid % 23),
				userTime: pid * 1.3,
				systemTime: pid * 0.2,
				readTotal: pid * 3.1 * MIB,
				writeTotal: pid * 0.7 * MIB,
				base: { cpu, memory: template.memory * MIB, gpu: template.gpu ?? 0, vram: (template.vram ?? 0) * MIB }
			});
		}
	}
	return processes;
}

export function advance(processes: SampleProcess[], seconds: number) {
	for (const process of processes) {
		if (process.state === 'T') {
			process.cpu = 0;
			continue;
		}
		const jitter = 0.5 + Math.random();
		process.cpu = process.base.cpu * jitter;
		process.memory = process.base.memory * (0.98 + Math.random() * 0.04);
		process.gpu = process.base.gpu * jitter;
		process.read = Math.random() < 0.08 ? Math.random() * 12 * MIB : 0;
		process.write = Math.random() < 0.06 ? Math.random() * 6 * MIB : 0;
		process.readTotal += process.read * seconds;
		process.writeTotal += process.write * seconds;
		process.userTime += (process.cpu / 100) * seconds * 0.8;
		process.systemTime += (process.cpu / 100) * seconds * 0.2;
	}
}
