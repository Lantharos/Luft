import { invoke, listen } from '@lantharos/sabine';

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
	['right-index-finger', 'Right index finger'],
	['left-index-finger', 'Left index finger'],
	['right-thumb', 'Right thumb'],
	['left-thumb', 'Left thumb'],
	['right-middle-finger', 'Right middle finger'],
	['left-middle-finger', 'Left middle finger'],
	['right-ring-finger', 'Right ring finger'],
	['left-ring-finger', 'Left ring finger'],
	['right-little-finger', 'Right little finger'],
	['left-little-finger', 'Left little finger']
] as const;

const LABELS: Record<string, string> = Object.fromEntries(FINGERS);

export const fingerLabel = (finger: string) => LABELS[finger] ?? finger;

export const fingerprintReader = () => invoke<boolean>('fingerprint_reader');
export const fingerprints = () => invoke<Fingerprints | null>('fingerprint_list');
export const deleteFingerprint = (finger: string) => invoke<void>('fingerprint_delete', { finger }, { timeoutMs: WAIT_FOR_PERMISSION });

function progressMessage(result: string, swipe: boolean) {
	switch (result) {
		case 'enroll-stage-passed':
			return swipe ? 'Good. Swipe again.' : 'Good. Lift your finger, then place it again.';
		case 'enroll-retry-scan':
			return 'That didn’t read well. Try again.';
		case 'enroll-swipe-too-short':
			return 'Swipe a little slower.';
		case 'enroll-finger-not-centered':
			return 'Center your finger on the sensor.';
		case 'enroll-remove-and-retry':
			return 'Lift your finger and try again.';
		case 'enroll-completed':
			return 'Fingerprint added.';
		case 'enroll-data-full':
			return 'The reader has no room left for another fingerprint.';
		case 'enroll-disconnected':
			return 'The fingerprint reader stopped answering. Try again in a moment.';
		case 'enroll-duplicate':
			return 'The reader already has this finger saved, probably by Windows or another account. Use a different finger.';
		default:
			return 'Couldn’t add this fingerprint. Try again.';
	}
}

export class FingerprintEnrollment {
	phase = $state<EnrollPhase>('choosing');
	message = $state('');
	private result = $state('');
	private passed = $state(0);
	private stopListening: (() => void) | null = null;
	private readonly reader: Pick<Fingerprints, 'swipe' | 'stages'>;

	constructor(reader: Pick<Fingerprints, 'swipe' | 'stages'>) {
		this.reader = reader;
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
		this.message = `${swipe ? 'Swipe' : 'Place'} your ${fingerLabel(finger).toLowerCase()} ${swipe ? 'across' : 'on'} the sensor.`;
		this.stopListening ??= listen<EnrollProgress>(PROGRESS, ({ result, done }) => {
			if (result === 'enroll-stage-passed') this.passed += 1;
			this.message = progressMessage(result, swipe);
			if (!done) return;
			this.result = result;
			this.phase = result === 'enroll-completed' ? 'added' : 'failed';
		});
		try {
			await invoke<void>('fingerprint_enroll', { finger }, { timeoutMs: WAIT_FOR_PERMISSION });
		} catch (reason) {
			this.phase = 'failed';
			this.message = reason instanceof Error ? reason.message : String(reason);
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
