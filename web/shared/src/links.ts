export const urls = {
	site: 'https://luft.lanth.me',
	docs: 'https://docs.luft.lanth.me',
	downloads: 'https://get.luft.lanth.me',
	source: 'https://github.com/Lantharos/Luft'
} as const;

export interface NavLink {
	label: string;
	href: string;
}

export const nav: readonly NavLink[] = [
	{ label: 'Download', href: `${urls.site}/download` },
	{ label: 'Docs', href: urls.docs },
	{ label: 'Source', href: urls.source }
];
