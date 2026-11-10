import { clipboard } from '@lantharos/sabine';
import { fileUri, pathsFromUriList } from '@luft/ui';

const COPIED_FILES = 'x-special/gnome-copied-files';
const URI_LIST = 'text/uri-list';

export type Carried = { paths: string[]; move: boolean };

export function offerFiles(paths: string[], move: boolean) {
	const uris = paths.map(fileUri);
	return clipboard.write({
		[COPIED_FILES]: [move ? 'cut' : 'copy', ...uris].join('\n'),
		[URI_LIST]: uris.map((uri) => `${uri}\r\n`).join(''),
		'text/plain': paths.join('\n')
	});
}

export async function offeredFiles(): Promise<Carried | null> {
	const data = await clipboard.read({ types: [COPIED_FILES, URI_LIST] }).catch(() => null);
	if (!data) return null;
	const text = (type: string) => {
		const value = data[type];
		return typeof value === 'string' ? value : value && new TextDecoder().decode(value);
	};
	const copied = text(COPIED_FILES);
	const [operation, ...uris] = copied ? copied.split('\n') : ['copy', text(URI_LIST) ?? ''];
	const paths = pathsFromUriList(uris.join('\n'));
	return paths.length > 0 ? { paths, move: operation === 'cut' } : null;
}
