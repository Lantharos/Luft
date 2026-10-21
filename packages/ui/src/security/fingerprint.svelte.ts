import { errorText } from '../text/errors';
import { invoke, listen } from '@lantharos/sabine';
import { t } from '@luft/i18n';

const WAIT_FOR_PERMISSION = 300_000;
const PROGRESS = 'fingerprint.enroll';

export interface Fingerprints {
	swipe: boolean;
	stages: number;
	enrolled: string[];
}

interface EnrollProgress {
	result: string;
	done: boolean;
}

export type EnrollPhase = 'choosing' | 'scanning' | 'added' | 'failed';

export const FINGERS = [
	['right-index-finger', 'ui-finger-right-index', 'ui-finger-right-index.inline'],
	['left-index-finger', 'ui-finger-left-index', 'ui-finger-left-index.inline'],
	['right-thumb', 'ui-finger-right-thumb', 'ui-finger-right-thumb.inline'],
	['left-thumb', 'ui-finger-left-thumb', 'ui-finger-left-thumb.inline'],
	['right-middle-finger', 'ui-finger-right-middle', 'ui-finger-right-middle.inline'],
	['left-middle-finger', 'ui-finger-left-middle', 'ui-finger-left-middle.inline'],
	['right-ring-finger', 'ui-finger-right-ring', 'ui-finger-right-ring.inline'],
	['left-ring-finger', 'ui-finger-left-ring', 'ui-finger-left-ring.inline'],
	['right-little-finger', 'ui-finger-right-little', 'ui-finger-right-little.inline'],
	['left-little-finger', 'ui-finger-left-little', 'ui-finger-left-little.inline']
] as const;

const MESSAGES = new Map<string, readonly [string, string]>(FINGERS.map(([finger, title, inline]) => [finger, [title, inline]]));

export const fingerLabel = (finger: string) => {
	const messages = MESSAGES.get(finger);
	return messages ? t(messages[0]) : finger;
};

export const fingerInSentence = (finger: string) => {
	const messages = MESSAGES.get(finger);
	return messages ? t(messages[1]) : finger;
};

export const fingerprintReader = () => invoke<boolean>('fingerprint_reader');
export const fingerprints = () => invoke<Fingerprints | null>('fingerprint_list');
export const deleteFingerprint = (finger: string) => invoke<void>('fingerprint_delete', { finger }, { timeoutMs: WAIT_FOR_PERMISSION });

const PROGRESS_MESSAGES: Record<string, string> = {
	'enroll-retry-scan': 'ui-fingerprint-retry',
	'enroll-swipe-too-short': 'ui-fingerprint-swipe-too-short',
	'enroll-finger-not-centered': 'ui-fingerprint-not-centered',
	'enroll-remove-and-retry': 'ui-fingerprint-remove-and-retry',
	'enroll-completed': 'ui-fingerprint-added',
	'enroll-data-full': 'ui-fingerprint-full',
	'enroll-disconnected': 'ui-fingerprint-disconnected',
	'enroll-duplicate': 'ui-fingerprint-duplicate'
};

function progressMessage(result: string, swipe: boolean) {
	if (result === 'enroll-stage-passed') return t(swipe ? 'ui-fingerprint-stage-passed-swipe' : 'ui-fingerprint-stage-passed');
	return t(PROGRESS_MESSAGES[result] ?? 'ui-fingerprint-failed');
}

export class FingerprintEnrollment {
	phase = $state<EnrollPhase>('choosing');
	private describe = $state<() => string>(() => '');
	private result = $state('');
	private passed = $state(0);
	private stopListening: (() => void) | null = null;
	private readonly reader: Pick<Fingerprints, 'swipe' | 'stages'>;

	constructor(reader: Pick<Fingerprints, 'swipe' | 'stages'>) {
		this.reader = reader;
	}

	get message() {
		return this.describe();
	}

	get needsOtherFinger() {
		return this.result === 'enroll-duplicate';
	}

	get readerFull() {
		return this.result === 'enroll-data-full';
	}

	get progress() {
		if (this.phase === 'added') return 1;
		return this.reader.stages > 0 ? Math.min(this.passed / this.reader.stages, 1) : 0;
	}

	async start(finger: string) {
		const { swipe } = this.reader;
		this.phase = 'scanning';
		this.passed = 0;
		this.result = '';
		this.describe = () => t(swipe ? 'ui-fingerprint-swipe' : 'ui-fingerprint-place', { finger: fingerInSentence(finger) });
		this.stopListening ??= listen<EnrollProgress>(PROGRESS, ({ result, done }) => {
			if (result === 'enroll-stage-passed') this.passed += 1;
			this.describe = () => progressMessage(result, swipe);
			if (!done) return;
			this.result = result;
			this.phase = result === 'enroll-completed' ? 'added' : 'failed';
		});
		try {
			await invoke<void>('fingerprint_enroll', { finger }, { timeoutMs: WAIT_FOR_PERMISSION });
		} catch (reason) {
			this.phase = 'failed';
			const message = errorText(reason);
			this.describe = () => message;
		}
	}

	cancel() {
		if (this.phase === 'scanning') void invoke<void>('fingerprint_stop');
	}

	choose() {
		this.cancel();
		this.phase = 'choosing';
	}

	destroy() {
		this.cancel();
		this.stopListening?.();
	}
}
