import { t } from '@luft/i18n';
import type { RecordingEntry } from '../model';
import type { Stage } from '../processing.svelte';

/** Where a recording's transcript and notes are, in a few words. */
export function stageText(stage: Stage | undefined, recording: RecordingEntry): string {
	const percent = (share: number) => Math.min(99, Math.round(share * 100));
	switch (stage?.kind) {
		case 'done':
			return t('stage-done');
		case 'transcribing':
			return t('stage-transcribing', { percent: percent(stage.share) });
		case 'writing-notes':
			return t('stage-writing-notes', { percent: percent(stage.share) });
		case 'waiting':
			return t(`stage-waiting-${stage.for}`);
		case 'unsupported':
			return t('stage-unsupported');
		case 'missing':
			return t('stage-missing');
		case 'failed':
			return t('stage-failed', { error: stage.error });
		default:
			return recording.processing === 'charger' ? t('stage-waiting-charger') : t('stage-queued');
	}
}
