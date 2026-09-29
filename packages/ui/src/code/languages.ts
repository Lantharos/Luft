import { LanguageDescription, type LanguageSupport } from '@codemirror/language';
import { languages as known } from '@codemirror/language-data';

const markdown = LanguageDescription.of({
	name: 'Markdown',
	extensions: ['md', 'markdown', 'mkd', 'mdx'],
	load: () => import('@codemirror/lang-markdown').then((module) => module.markdown({ codeLanguages: languages }))
});

const svelte = LanguageDescription.of({
	name: 'Svelte',
	extensions: ['svelte'],
	load: () => import('@codemirror/lang-html').then((module) => module.html())
});

const log = LanguageDescription.of({
	name: 'Log',
	extensions: ['log'],
	load: () => import('./log').then((module) => module.log)
});

export const languages: readonly LanguageDescription[] = [
	...known.map((language) => (language.name === 'Markdown' ? markdown : language)),
	svelte,
	log
].sort((a, b) => a.name.localeCompare(b.name));

function basename(path: string) {
	return path.slice(path.lastIndexOf('/') + 1);
}

export function findLanguage(nameOrPath: string): LanguageDescription | null {
	return LanguageDescription.matchLanguageName(languages, nameOrPath, false) ?? LanguageDescription.matchFilename(languages, basename(nameOrPath));
}

export function loadLanguage(nameOrPath: string): Promise<LanguageSupport | null> {
	const language = findLanguage(nameOrPath);
	if (!language) return Promise.resolve(null);
	return language.support ? Promise.resolve(language.support) : language.load();
}
