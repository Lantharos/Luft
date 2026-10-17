import * as installer from '#lib/api/installer.js';
import type { Drive, InstallerState, Intent, LinuxSystem, Survey, Target, WindowsChoices } from '#lib/api/installer.js';
import { NO_HARDWARE, type Hardware } from '#lib/api/system.js';
import { regional } from './regional.svelte.js';

const NAME_FALLBACK = 'luft';

class InstallState {
	status = $state<InstallerState | null>(null);
	survey = $state<Survey | null>(null);
	surveyError = $state('');
	surveying = $state(false);
	starting = $state(false);
	startError = $state('');
	user = $state('');
	intent = $state<Intent | null>(null);
	replacing = $state<LinuxSystem | null>(null);
	windowsChoices = $state<WindowsChoices>({ fastStartupOff: true, universalClock: true, bluetooth: true });
	private hardware = NO_HARDWARE;

	started = $derived(this.status !== null && this.status.stage !== 'idle');
	failed = $derived(this.status?.stage === 'failed');
	finished = $derived(this.status?.stage === 'finished');
	windowsDrive = $derived(this.survey?.drives.find((drive) => drive.windows && !drive.blocked) ?? null);
	usableDrives = $derived(this.survey?.drives.filter((drive) => !drive.blocked && !drive.removable && !drive.meet) ?? []);
	meet = $derived(this.survey?.meet?.space ? this.survey.meet : null);
	systems = $derived(this.survey?.systems ?? []);
	freeSpaces = $derived(
		this.survey?.drives.filter((drive) => !drive.blocked).flatMap((drive) => drive.free.map((space) => ({ drive, space }))) ?? []
	);

	async start(hardware: Hardware, intent: Intent | null) {
		this.hardware = hardware;
		this.intent = intent;
		this.status = await installer.state();
		const stop = installer.onChanged((status) => (this.status = status));
		if (this.status?.phase === 'live') void this.look();
		return stop;
	}

	async look() {
		this.surveying = true;
		this.surveyError = '';
		try {
			this.survey = await installer.survey();
			regional.suggestFrom(this.survey.hints, this.survey.firmwareLanguage);
		} catch (error) {
			this.surveyError = String(error);
		} finally {
			this.surveying = false;
		}
	}

	async install(target: Target) {
		this.starting = true;
		this.startError = '';
		try {
			await installer.install(target, this.hardware.nvidia ? 'nvidia' : 'default', $state.snapshot(this.windowsChoices));
			this.replacing = target.kind === 'replace' ? (this.systems.find((system) => system.id === target.system) ?? null) : null;
			this.status = await installer.state();
			await this.configure();
			return true;
		} catch (error) {
			this.startError = String(error);
			return false;
		} finally {
			this.starting = false;
		}
	}

	configure() {
		const name = this.user || this.replacing?.owner?.name || NAME_FALLBACK;
		return installer.configure({
			locale: regional.language.locale,
			keyboard: $state.snapshot(regional.keyboard),
			timezone: regional.zone,
			hostname: `${name}-${this.hardware.portable ? 'laptop' : 'computer'}`
		});
	}

	async createAccount(name: string, fullName: string, password: string) {
		this.user = name;
		await this.configure();
		await installer.createAccount(name, fullName, password);
	}

	drive(block: string): Drive | null {
		return this.survey?.drives.find((drive) => drive.block === block) ?? null;
	}
}

export const install = new InstallState();
