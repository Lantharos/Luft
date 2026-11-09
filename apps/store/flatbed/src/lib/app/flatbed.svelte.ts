import { invoke } from '@lantharos/sabine';
import { t } from '@luft/i18n';
import { errorText, Toasts } from '@luft/ui';
import { commands, events, type AppState, type DocumentView, type Feed, type Mode, type PageView, type ScanError, type Scanner, type Settings } from '#lib/bindings.js';

export const CAMERA = 'camera';

/** Everything the window shows: the pages, the scanners, and what's going on. */
class Flatbed {
	document = $state.raw<DocumentView>({ mode: 'colour', pages: [] });
	scanners = $state.raw<Scanner[]>([]);
	settings = $state.raw<Settings>({ languages: [], paper: 'automatic', fine: false, addresses: [], scanner: null });
	readingLanguages = $state.raw<string[] | null>(null);
	source = $state(CAMERA);
	feed = $state<Feed>('glass');
	scanning = $state(false);
	preview = $state<string | null>(null);
	camera = $state(false);
	saving = $state<number | null>(null);
	toasts = new Toasts();

	scanner = $derived(this.scanners.find((scanner) => scanner.id === this.source) ?? null);
	pages = $derived(this.document.pages);

	start(state: AppState) {
		this.document = state.document;
		this.scanners = state.scanners;
		this.settings = state.settings;
		this.readingLanguages = state.readingLanguages;
		this.pickSource(state.settings.scanner);
		const stops = [
			events.documentChanged((document) => (this.document = document)),
			events.scannersChanged((scanners) => {
				this.scanners = scanners;
				if (this.source === CAMERA || !scanners.some((scanner) => scanner.id === this.source)) this.pickSource(this.settings.scanner);
			}),
			events.scanPreview((bytes) => this.showPreview(bytes)),
			events.scanFinished((problem) => this.finished(problem)),
			events.saveProgress((fraction) => (this.saving = fraction))
		];
		return () => stops.forEach((stop) => stop());
	}

	/** The scanner chosen last, else the first one found, else the camera. */
	private pickSource(preferred: string | null) {
		const chosen = this.scanners.find((scanner) => scanner.id === preferred) ?? this.scanners[0];
		this.choose(chosen?.id ?? CAMERA, false);
	}

	choose(source: string, remember = true) {
		this.source = source;
		const feeds = this.scanners.find((scanner) => scanner.id === source)?.feeds ?? [];
		if (!feeds.includes(this.feed)) this.feed = feeds[0] ?? 'glass';
		if (remember && source !== CAMERA) void this.saveSettings({ ...this.settings, scanner: source });
	}

	async saveSettings(settings: Settings) {
		this.settings = settings;
		await commands.settingsSave(settings);
	}

	private showPreview(bytes: Uint8Array) {
		if (this.preview) URL.revokeObjectURL(this.preview);
		this.preview = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'image/jpeg' }));
	}

	private finished(problem: ScanError | null) {
		this.scanning = false;
		if (this.preview) URL.revokeObjectURL(this.preview);
		this.preview = null;
		if (problem && problem.kind !== 'cancelled') this.toasts.show(scanProblem(problem), { failed: true });
	}

	async scan() {
		if (!this.scanner || this.scanning) return;
		this.scanning = true;
		try {
			await commands.scanStart({ scanner: this.scanner.id, feed: this.feed });
		} catch (error) {
			this.scanning = false;
			this.toasts.show(errorText(error), { failed: true });
		}
	}

	cancel() {
		void commands.scanCancel();
	}

	setMode(mode: Mode) {
		this.document = { ...this.document, mode };
		void commands.documentMode({ mode });
	}

	async importPictures(paths: string[]) {
		if (!paths.length) return;
		const added = await commands.importPictures({ paths });
		if (added < paths.length) this.toasts.show(t('import-unreadable', { count: paths.length - added }), { failed: true });
	}

	async choosePictures() {
		await this.importPictures(await commands.choosePictures({ title: t('import-title'), filter: t('import-filter') }));
	}

	reorder(pages: PageView[]) {
		this.document = { ...this.document, pages };
		void commands.pagesReorder({ ids: pages.map((page) => page.id) });
	}

	remove(page: PageView) {
		this.document = { ...this.document, pages: this.pages.filter((other) => other.id !== page.id) };
		void commands.pageRemove({ id: page.id });
	}

	turn(page: PageView, quarters: number) {
		void commands.pageTurn({ id: page.id, quarters });
	}
}

export function scanProblem(problem: ScanError): string {
	switch (problem.kind) {
		case 'busy':
			return t('scan-busy');
		case 'feederEmpty':
			return t('scan-feeder-empty');
		case 'gone':
			return t('scan-gone');
		case 'failed':
			return t('scan-failed', { reason: problem.message });
		default:
			return '';
	}
}

/** The camera's newest frame with the corners of the paper it sees. */
export async function cameraFrame(): Promise<{ frame: ImageBitmap | ImageData; corners: number[] | null } | null> {
	const bytes = await invoke<Uint8Array>('camera_frame', {});
	const CORNERS = 32;
	const HEADER = 12;
	if (bytes.length <= CORNERS + HEADER) return null;
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const corners = Array.from({ length: 8 }, (_, index) => view.getFloat32(index * 4, true));
	const pixels = bytes.subarray(CORNERS + HEADER);
	const frame =
		bytes[CORNERS] === 0
			? await createImageBitmap(new Blob([pixels as BlobPart], { type: 'image/jpeg' }))
			: new ImageData(new Uint8ClampedArray(pixels.buffer as ArrayBuffer, pixels.byteOffset, pixels.byteLength), view.getUint32(CORNERS + 4, true), view.getUint32(CORNERS + 8, true));
	return { frame, corners: corners.some(Number.isNaN) ? null : corners };
}

export const flatbed = new Flatbed();
