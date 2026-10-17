export const urls = {
	site: 'https://luft.computer',
	docs: 'https://docs.luft.computer',
	downloads: 'https://get.luft.computer',
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
