import { fileUrl } from '@lantharos/sabine';
import { commands } from '#lib/bindings.js';
import type { ThumbnailBatch } from '#lib/bindings.js';
import { extension } from '#lib/files/picture.js';

class Previews {
	urls = $state<Record<string, string | null>>({});

	receive = (batch: ThumbnailBatch) => {
		for (const item of batch.items) this.urls[item.path] = item.thumbnail ? fileUrl(item.thumbnail) : null;
	};

	request(paths: string[]) {
		const missing = paths.filter((path) => !(path in this.urls));
		const pictures = missing.filter((path) => extension(path) !== 'easel');
		if (pictures.length) void commands.requestThumbnails({ paths: pictures, size: 'large' });
		for (const path of missing.filter((path) => extension(path) === 'easel')) {
			this.urls[path] = null;
			commands.documentPreview({ path }).then((preview) => (this.urls[path] = fileUrl(preview)), () => {});
		}
	}
}

export const previews = new Previews();
