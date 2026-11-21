import { i18n, t } from '@luft/i18n';
import { ago, date } from '@luft/ui';
import type { CheckName, DownloadSource, Platform, ReleaseStatus, ReleaseSummary } from './store';

export type Tone = 'done' | 'active' | 'attention' | 'quiet';

const RELEASE_STATUS: Record<ReleaseStatus, { label: string; tone: Tone }> = {
	uploading: { label: 'developer-status-uploading', tone: 'active' },
	checking: { label: 'developer-status-checking', tone: 'active' },
	failed: { label: 'developer-status-failed', tone: 'attention' },
	'in-review': { label: 'developer-status-in-review', tone: 'active' },
	'changes-requested': { label: 'developer-status-changes-requested', tone: 'attention' },
	rejected: { label: 'developer-status-rejected', tone: 'attention' },
	'rolling-out': { label: 'developer-status-rolling-out', tone: 'active' },
	live: { label: 'developer-status-live', tone: 'done' },
	withdrawn: { label: 'developer-status-withdrawn', tone: 'quiet' },
	pulled: { label: 'developer-status-pulled', tone: 'attention' }
};

export const statusLabel = (status: ReleaseStatus) => t(RELEASE_STATUS[status].label);
export const statusTone = (status: ReleaseStatus) => RELEASE_STATUS[status].tone;

const CHECK_TITLES: Record<CheckName, string> = {
	namespace: 'developer-check-namespace',
	version: 'developer-check-version',
	platforms: 'developer-check-platforms',
	files: 'developer-check-files',
	attestation: 'developer-check-attestation',
	listing: 'developer-check-listing',
	permissions: 'developer-check-permissions',
	impersonation: 'developer-check-impersonation',
	extension: 'developer-check-extension',
	malware: 'developer-check-malware',
	inspection: 'developer-check-inspection',
	diff: 'developer-check-diff',
	licence: 'developer-check-licence'
};

export const checkTitle = (check: CheckName) => t(CHECK_TITLES[check]);

const PLATFORM_NAMES: Record<Platform, string> = {
	'linux-x86_64': 'developer-platform-linux',
	'linux-aarch64': 'developer-platform-linux-arm',
	'windows-x86_64': 'developer-platform-windows',
	'windows-aarch64': 'developer-platform-windows-arm',
	'macos-aarch64': 'developer-platform-macos-apple',
	'macos-x86_64': 'developer-platform-macos-intel',
	'macos-universal': 'developer-platform-macos',
	android: 'developer-platform-android',
	any: 'developer-platform-any',
	luft: 'developer-platform-luft',
	'luft-x86_64': 'developer-platform-luft',
	'luft-aarch64': 'developer-platform-luft-arm'
};

export const platformName = (platform: Platform) => t(PLATFORM_NAMES[platform]);

const SOURCE_NAMES: Record<DownloadSource, string> = {
	app: 'developer-source-app',
	cli: 'developer-source-cli',
	sabine: 'developer-source-sabine',
	other: 'developer-source-other'
};

export const sourceName = (source: DownloadSource) => t(SOURCE_NAMES[source]);

const SHIPPED: ReleaseStatus[] = ['live', 'rolling-out'];

export const shipped = (release: ReleaseSummary) => SHIPPED.includes(release.status);

/** What each channel offers now: its newest release that reached people. */
export function liveOn(releases: ReleaseSummary[], channel: string) {
	return releases.find((release) => release.channel === channel && shipped(release)) ?? null;
}

function formatter<T>(make: (locale: string) => T) {
	let locale = '';
	let made: T;
	return () => {
		if (locale !== i18n.formats) {
			locale = i18n.formats;
			made = make(locale);
		}
		return made;
	};
}

const numbers = formatter((locale) => new Intl.NumberFormat(locale));
const shortNumbers = formatter((locale) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }));
const percents = formatter((locale) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }));
const lists = formatter((locale) => new Intl.ListFormat(locale, { style: 'short', type: 'unit' }));
const days = formatter((locale) => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }));

export const count = (value: number) => numbers().format(value);
export const shortCount = (value: number) => shortNumbers().format(value);
export const percent = (value: number) => percents().format(value / 100);
export const list = (items: string[]) => lists().format(items);
export const chartDay = (day: string) => days().format(new Date(`${day}T00:00:00Z`));

export function rolloutText(release: ReleaseSummary) {
	if (release.status === 'live') return t('developer-rollout-everyone');
	if (release.rollout_paused) return t('developer-rollout-paused', { percent: percent(release.rollout_percent) });
	return t('developer-rollout-share', { percent: percent(release.rollout_percent) });
}

const seconds = (iso: string) => Date.parse(iso) / 1000;

export const day = (iso: string) => date(seconds(iso));
export const since = (iso: string) => ago(seconds(iso));
