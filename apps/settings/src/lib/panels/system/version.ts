import { i18n, t } from '@luft/i18n';

const NIGHTLY = '-nightly.';

export function versionLabel(version: string) {
	const [release, number] = version.split(NIGHTLY);
	return number ? t('settings-version-nightly', { release, number }) : version;
}

export function builtOn(seconds: number) {
	const date = new Date(seconds * 1000);
	const year = date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric';
	return new Intl.DateTimeFormat(i18n.formats, { day: 'numeric', month: 'long', year }).format(date);
}
