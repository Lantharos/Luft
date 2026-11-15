import { i18n, t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import type { InstalledApp, Operation } from '#lib/bindings.js';

export function sourceName({ source, origin, listing }: Pick<InstalledApp, 'source' | 'origin' | 'listing'>) {
	if (listing) return source === 'extension' ? t('source-store-extension') : t('source-store');
	if (source === 'appImage') return t('source-file');
	if (source === 'tool') return t('source-tool');
	if (source === 'storeTool') return t('source-store-tool');
	if (source === 'debian') return t('source-ubuntu');
	if (source === 'system') return origin === 'Fedora' ? t('source-system') : t('source-system-from', { origin });
	return origin === 'flathub' ? t('source-flathub') : origin;
}

const VERBS: Record<Operation['action'], [string, string]> = {
	install: ['operation-installing', 'operation-waiting-install'],
	remove: ['operation-removing', 'operation-waiting-remove'],
	update: ['operation-updating', 'operation-waiting-update']
};

function activityId(operation: Operation) {
	const [running, queued] = VERBS[operation.action];
	if (operation.state === 'queued' || operation.progress?.stage === 'waiting') return queued;
	if (operation.progress?.stage === 'preparing') return 'operation-preparing';
	if (operation.progress?.stage === 'downloading') return 'operation-downloading';
	return running;
}

export const activity = (operation: Operation) => t(activityId(operation));

export const namedActivity = (operation: Operation) => t(`${activityId(operation)}.named`, { name: operation.title });

export const percent = (operation: Operation) => (operation.progress?.fraction == null ? null : Math.round(operation.progress.fraction * 100));

let percentLocale = '';
let percents: Intl.NumberFormat;

export function percentText(value: number) {
	if (percentLocale !== i18n.formats) {
		percentLocale = i18n.formats;
		percents = new Intl.NumberFormat(percentLocale, { style: 'percent', maximumFractionDigits: 0 });
	}
	return percents.format(value / 100);
}

export function transferred(operation: Operation) {
	const transfer = operation.progress?.stage === 'downloading' ? operation.progress.transfer : null;
	return transfer ? t('operation-transferred', { done: bytes(transfer.done), total: bytes(transfer.total) }) : null;
}
