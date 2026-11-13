import type { Project } from './store';

export type ProjectTab = 'overview' | 'releases' | 'stats' | 'channels' | 'people' | 'files';
export type PublisherPage = 'tools' | 'members' | 'verification' | 'domain';

export const PUBLISHER_PAGES: Record<PublisherPage, string> = {
	tools: 'Command-line tools',
	members: 'Members',
	verification: 'Verification',
	domain: 'Download domain'
};

export function projectTabs(project: Project | null): { value: ProjectTab; label: string }[] {
	return [
		{ value: 'overview', label: 'Overview' },
		{ value: 'releases', label: 'Releases' },
		{ value: 'stats', label: 'Stats' },
		{ value: 'channels', label: 'Channels' },
		...(project?.channels.some((channel) => channel.invite_only) ? [{ value: 'people' as const, label: 'People' }] : []),
		{ value: 'files', label: 'Files' }
	];
}
