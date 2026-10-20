import { urls } from '@luft/web';
import type { localize } from '../i18n/pages';

type Page = ReturnType<typeof localize>;

export const nav = ({ t, href }: Page) => [
	{ label: t('site-nav-download'), href: href('download') },
	{ label: t('site-nav-docs'), href: urls.docs },
	{ label: t('site-nav-source'), href: urls.source }
];
