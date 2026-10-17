import type { StarlightUserConfig } from '@astrojs/starlight/types';

type Sidebar = NonNullable<StarlightUserConfig['sidebar']>;

const group = (label: string, directory: string, collapsed = false) => ({
	label,
	collapsed,
	items: [{ autogenerate: { directory } }]
});

export const sidebar: Sidebar = [
	group('Getting started', 'start'),
	{
		label: 'Using Luft',
		items: [
			group('The desktop', 'desktop'),
			group('Windows and workspaces', 'windows'),
			group('Make it yours', 'personalize')
		]
	},
	group('Apps', 'apps'),
	group('Files and accounts', 'files'),
	group('System', 'system'),
	group('For developers', 'developers'),
	group('Reference', 'reference', true)
];
