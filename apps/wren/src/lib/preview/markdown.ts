import { fileUrl, isAvailable } from '@lantharos/sabine';
import { dirname, join } from '$lib/utils/paths';

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;
const BLOCK_RULES = ['paragraph_open', 'heading_open', 'blockquote_open', 'bullet_list_open', 'ordered_list_open', 'table_open', 'hr', 'code_block'];

type RenderEnv = { folder?: string };

let parser: ReturnType<typeof create> | null = null;

function escapeAttribute(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

async function create() {
	const { default: MarkdownIt } = await import('markdown-it');
	const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });
	for (const rule of BLOCK_RULES) {
		const original = markdown.renderer.rules[rule];
		markdown.renderer.rules[rule] = (tokens, index, options, env, self) => {
			const line = tokens[index].map?.[0];
			if (line !== undefined) tokens[index].attrSet('data-line', String(line + 1));
			return original ? original(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
		};
	}
	markdown.renderer.rules.fence = (tokens, index) => {
		const token = tokens[index];
		const language = token.info.trim().split(/\s+/)[0] ?? '';
		const line = token.map ? ` data-line="${token.map[0] + 1}"` : '';
		return `<pre${line} data-language="${escapeAttribute(language)}"><code>${markdown.utils.escapeHtml(token.content)}</code></pre>`;
	};
	const image = markdown.renderer.rules.image!;
	markdown.renderer.rules.image = (tokens, index, options, env, self) => {
		const source = String(tokens[index].attrGet('src') ?? '');
		const { folder } = env as RenderEnv;
		if (isAvailable() && folder && source && !EXTERNAL.test(source)) {
			tokens[index].attrSet('src', fileUrl(source.startsWith('/') ? source : join(folder, decodeURI(source))));
		}
		return image(tokens, index, options, env, self);
	};
	return markdown;
}

export async function renderMarkdown(source: string, path: string | null) {
	parser ??= create();
	const env: RenderEnv = { folder: path ? dirname(path) : undefined };
	return (await parser).render(source, env);
}
