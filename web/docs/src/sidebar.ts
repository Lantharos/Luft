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
	group('Apps', 'apps', true),
	group('Files and accounts', 'files'),
	group('System', 'system'),
	{
		label: 'For developers',
		collapsed: true,
		items: [
			'developers/architecture',
			'developers/building',
			'developers/testing',
			'developers/testing-vms',
			'developers/contributing',
			'developers/translating',
			group('Apps and the desktop', 'developers/desktop', true),
			group('The system', 'developers/system', true),
			group('Security', 'security', true)
		]
	},
	group('Extensions', 'extensions')
];
