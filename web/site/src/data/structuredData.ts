import { urls } from '@luft/web';

const PUBLISHER = `${urls.site}/#publisher`;

export function homeStructuredData(description: string) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': PUBLISHER,
				name: 'Lantharos',
				url: 'https://lanth.me',
				logo: `${urls.site}/logo.png`,
				sameAs: [urls.source]
			},
			{
				'@type': 'WebSite',
				name: 'Luft',
				url: `${urls.site}/`,
				publisher: { '@id': PUBLISHER }
			},
			{
				'@type': 'SoftwareApplication',
				name: 'Luft',
				description,
				url: `${urls.site}/`,
				downloadUrl: `${urls.site}/download`,
				applicationCategory: 'OperatingSystem',
				image: `${urls.site}/og.jpg`,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
				publisher: { '@id': PUBLISHER }
			}
		]
	};
}
