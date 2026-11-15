import { t } from '@luft/i18n';
import type { Project } from './store';

export type ProjectTab = 'overview' | 'releases' | 'stats' | 'channels' | 'people' | 'files';
export type PublisherPage = 'tools' | 'members' | 'verification' | 'domain';

const PUBLISHER_PAGE_TITLES: Record<PublisherPage, string> = {
	tools: 'developer-page-tools',
	members: 'developer-page-members',
	verification: 'developer-page-verification',
	domain: 'developer-page-domain'
};

export const PUBLISHER_PAGES = Object.keys(PUBLISHER_PAGE_TITLES) as PublisherPage[];

export const publisherPageTitle = (page: PublisherPage) => t(PUBLISHER_PAGE_TITLES[page]);

export function projectTabs(project: Project | null): { value: ProjectTab; label: string }[] {
	return [
		{ value: 'overview', label: t('developer-tab-overview') },
		{ value: 'releases', label: t('developer-tab-releases') },
		{ value: 'stats', label: t('developer-tab-stats') },
		{ value: 'channels', label: t('developer-tab-channels') },
		...(project?.channels.some((channel) => channel.invite_only) ? [{ value: 'people' as const, label: t('developer-tab-people') }] : []),
		{ value: 'files', label: t('developer-tab-files') }
	];
}
