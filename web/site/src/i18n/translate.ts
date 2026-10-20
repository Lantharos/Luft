import { FluentBundle, FluentResource, type FluentVariable } from '@fluent/bundle';
import { SOURCE_LOCALE } from './locales';

export type Translate = (id: string, args?: Record<string, FluentVariable>) => string;

const files = import.meta.glob<string>('../../locales/*/*.ftl', { query: '?raw', import: 'default', eager: true });
const bundles = new Map<string, FluentBundle>();

const folderOf = (path: string) => path.split('/').at(-2);

function resource(locale: string) {
	const sources = Object.entries(files).filter(([path]) => folderOf(path) === locale);
	return new FluentResource(sources.map(([, source]) => source).join('\n'));
}

function bundleOf(locale: string) {
	let bundle = bundles.get(locale);
	if (!bundle) {
		bundle = new FluentBundle(locale, { useIsolating: false });
		bundle.addResource(resource(SOURCE_LOCALE));
		if (locale !== SOURCE_LOCALE) bundle.addResource(resource(locale), { allowOverrides: true });
		bundles.set(locale, bundle);
	}
	return bundle;
}

export function translator(locale = SOURCE_LOCALE): Translate {
	const bundle = bundleOf(locale);
	return (id, args) => {
		const pattern = bundle.getMessage(id)?.value;
		if (!pattern) throw new Error(`${id} has no English message`);
		return bundle.formatPattern(pattern, args);
	};
}
