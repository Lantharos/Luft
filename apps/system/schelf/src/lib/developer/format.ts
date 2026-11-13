import { ago, date } from '@luft/ui';
import type { CheckName, Platform, ReleaseStatus, ReleaseSummary } from './store';

export type Tone = 'done' | 'active' | 'attention' | 'quiet';

export const RELEASE_STATUS: Record<ReleaseStatus, { label: string; tone: Tone }> = {
	uploading: { label: 'Uploading', tone: 'active' },
	checking: { label: 'Checking', tone: 'active' },
	failed: { label: 'Needs a fix', tone: 'attention' },
	'in-review': { label: 'In review', tone: 'active' },
	'changes-requested': { label: 'Changes requested', tone: 'attention' },
	rejected: { label: 'Rejected', tone: 'attention' },
	'rolling-out': { label: 'Rolling out', tone: 'active' },
	live: { label: 'Live', tone: 'done' },
	withdrawn: { label: 'Withdrawn', tone: 'quiet' },
	pulled: { label: 'Stopped by Schelf', tone: 'attention' }
};

export const CHECK_TITLES: Record<CheckName, string> = {
	namespace: 'Namespace',
	version: 'Version',
	platforms: 'Systems',
	files: 'Files',
	attestation: 'Build provenance',
	listing: 'Listing',
	permissions: 'Permissions',
	impersonation: 'Name and icon',
	extension: 'Extension manifest',
	malware: 'Malware scan',
	inspection: 'What the app can do',
	diff: 'Source changes',
	licence: 'Licence'
};

export const PLATFORM_NAMES: Record<Platform, string> = {
	'linux-x86_64': 'Linux',
	'linux-aarch64': 'Linux on Arm',
	'windows-x86_64': 'Windows',
	'windows-aarch64': 'Windows on Arm',
	'macos-aarch64': 'macOS on Apple silicon',
	'macos-x86_64': 'macOS on Intel',
	'macos-universal': 'macOS',
	android: 'Android',
	any: 'Any system',
	luft: 'Luft',
	'luft-x86_64': 'Luft',
	'luft-aarch64': 'Luft on Arm'
};

const SHIPPED: ReleaseStatus[] = ['live', 'rolling-out'];

export const shipped = (release: ReleaseSummary) => SHIPPED.includes(release.status);

/** What each channel offers now: its newest release that reached people. */
export function liveOn(releases: ReleaseSummary[], channel: string) {
	return releases.find((release) => release.channel === channel && shipped(release)) ?? null;
}

const number = new Intl.NumberFormat('en');
const short = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export const count = (value: number) => number.format(value);
export const shortCount = (value: number) => short.format(value);

export function rolloutText(release: ReleaseSummary) {
	if (release.status === 'live') return 'Everyone has it';
	if (release.rollout_paused) return `Paused at ${release.rollout_percent}%`;
	return `${release.rollout_percent}% of people`;
}

const seconds = (iso: string) => Date.parse(iso) / 1000;

export const day = (iso: string) => date(seconds(iso));
export const since = (iso: string) => ago(seconds(iso));
