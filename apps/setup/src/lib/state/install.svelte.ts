import {
	commands,
	events,
	type Drive,
	type Encryption,
	type Hardware,
	type InstallerState,
	type Intent,
	type LinuxSystem,
	type Survey,
	type Target,
	type WindowsChoices,
} from '#lib/bindings.js';
import { NO_HARDWARE, WAIT_FOR_PERSON } from '#lib/bridge/system.js';
import { regional } from './regional.svelte.js';

const NAME_FALLBACK = 'luft';
const SURVEY_TIMEOUT = { timeoutMs: 120_000 };

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
	target = $state<Target | null>(null);
	windowsChoices = $state<Required<WindowsChoices>>({ fastStartupOff: true, universalClock: true, bluetooth: true });
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
		this.status = await commands.installerState();
		const stop = events.installerChanged((status) => (this.status = status));
		if (this.status?.phase === 'live') void this.look();
		return stop;
	}

	async look() {
		this.surveying = true;
		this.surveyError = '';
		try {
			this.survey = await commands.installerSurvey(SURVEY_TIMEOUT);
			regional.suggestFrom(this.survey.hints);
		} catch (error) {
			this.surveyError = String(error);
		} finally {
			this.surveying = false;
		}
	}

	async install(target: Target, encryption: Encryption | null) {
		this.starting = true;
		this.startError = '';
		try {
			await commands.installerInstall(
				{ target, variant: this.hardware.nvidia ? 'nvidia' : 'default', windows: $state.snapshot(this.windowsChoices), encryption },
				WAIT_FOR_PERSON
			);
			this.replacing = target.kind === 'replace' ? (this.systems.find((system) => system.id === target.system) ?? null) : null;
			this.status = await commands.installerState();
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
		return commands.installerConfigure(
			{
				locale: regional.language.locale,
				keyboard: $state.snapshot(regional.keyboard),
				timezone: regional.zone,
				hostname: `${name}-${this.hardware.portable ? 'laptop' : 'computer'}`
			},
			WAIT_FOR_PERSON
		);
	}

	async createAccount(name: string, fullName: string, password: string) {
		this.user = name;
		await this.configure();
		await commands.installerAccount({ name, fullName, password }, WAIT_FOR_PERSON);
	}

	encryptable(target: Target) {
		return target.kind !== 'replace' || !this.systems.find((system) => system.id === target.system)?.keepsOld;
	}

	drive(block: string): Drive | null {
		return this.survey?.drives.find((drive) => drive.block === block) ?? null;
	}
}

export const install = new InstallState();
