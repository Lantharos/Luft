import { fileUrl } from '@lantharos/sabine';
import MarkdownIt from 'markdown-it';
import { isDesktopRuntime } from '#lib/runtime.js';
import { joinPath, parentPath } from '#lib/utils/paths.js';

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

export function renderMarkdown(source: string, path: string) {
	const markdown = new MarkdownIt({ linkify: true, typographer: true });
	const folder = parentPath(path);
	const renderImage = markdown.renderer.rules.image!;
	markdown.renderer.rules.image = (tokens, index, options, env, self) => {
		const src = String(tokens[index].attrGet('src') ?? '');
		if (isDesktopRuntime() && src && !EXTERNAL.test(src)) {
			tokens[index].attrSet('src', fileUrl(src.startsWith('/') ? src : joinPath(folder, decodeURI(src))));
		}
		return renderImage(tokens, index, options, env, self);
	};
	return markdown.render(source);
}
