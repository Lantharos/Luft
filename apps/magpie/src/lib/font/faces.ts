import { fileSource } from '#lib/bridge.js';

const loaded = new Map<string, Promise<string>>();

export function loadFont(source: string): Promise<string> {
	let family = loaded.get(source);
	if (!family) {
		const name = `magpie-font-${loaded.size + 1}`;
		family = new FontFace(name, `url("${fileSource(source)}")`).load().then((face) => {
			document.fonts.add(face);
			return name;
		});
		family.catch(() => loaded.delete(source));
		loaded.set(source, family);
	}
	return family;
}
