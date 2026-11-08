const encoder = new TextEncoder();

export interface Raster {
	width: number;
	height: number;
	/** JPEG bytes, or deflated RGB with deflated alpha beside it. */
	jpeg?: Uint8Array;
	rgb?: Uint8Array;
	alpha?: Uint8Array;
}

export interface PdfPage {
	width: number;
	height: number;
	content: string;
	images: Raster[];
	/** Opacity of each graphics state the content names as /G0, /G1… */
	opacities: number[];
}

/** A minimal PDF 1.4 writer: pages of vector drawing commands and pictures. */
export class PdfWriter {
	private readonly objects: (Uint8Array | null)[] = [];

	private reserve() {
		this.objects.push(null);
		return this.objects.length;
	}

	private set(id: number, ...parts: (string | Uint8Array)[]) {
		const chunks = parts.map((part) => (typeof part === 'string' ? encoder.encode(part) : part));
		const bytes = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
		chunks.reduce((at, chunk) => (bytes.set(chunk, at), at + chunk.length), 0);
		this.objects[id - 1] = bytes;
		return id;
	}

	private add(...parts: (string | Uint8Array)[]) {
		return this.set(this.reserve(), ...parts);
	}

	private stream(dictionary: string, data: Uint8Array) {
		return this.add(`<< ${dictionary} /Length ${data.length} >>\nstream\n`, data, '\nendstream');
	}

	private image(raster: Raster) {
		if (raster.jpeg) return this.stream(`/Type /XObject /Subtype /Image /Width ${raster.width} /Height ${raster.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`, raster.jpeg);
		const mask = this.stream(`/Type /XObject /Subtype /Image /Width ${raster.width} /Height ${raster.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`, raster.alpha!);
		return this.stream(`/Type /XObject /Subtype /Image /Width ${raster.width} /Height ${raster.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask ${mask} 0 R`, raster.rgb!);
	}

	async write(pages: PdfPage[]): Promise<Uint8Array> {
		const catalog = this.reserve();
		const tree = this.reserve();
		const kids: number[] = [];
		for (const page of pages) {
			const images = page.images.map((raster, index) => `/I${index} ${this.image(raster)} 0 R`).join(' ');
			const states = page.opacities.map((opacity, index) => `/G${index} ${this.add(`<< /Type /ExtGState /ca ${opacity} /CA ${opacity} >>`)} 0 R`).join(' ');
			const content = this.stream('/Filter /FlateDecode', await deflate(encoder.encode(page.content)));
			kids.push(
				this.add(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 ${page.width.toFixed(2)} ${page.height.toFixed(2)}] /Resources << /XObject << ${images} >> /ExtGState << ${states} >> >> /Contents ${content} 0 R >>`)
			);
		}
		this.set(tree, `<< /Type /Pages /Kids [${kids.map((kid) => `${kid} 0 R`).join(' ')}] /Count ${kids.length} >>`);
		this.set(catalog, `<< /Type /Catalog /Pages ${tree} 0 R >>`);
		const parts: Uint8Array[] = [encoder.encode('%PDF-1.4\n%âã\n')];
		const offsets: number[] = [];
		let size = parts[0].length;
		this.objects.forEach((body, index) => {
			const chunk = concat([encoder.encode(`${index + 1} 0 obj\n`), body!, encoder.encode('\nendobj\n')]);
			offsets.push(size);
			size += chunk.length;
			parts.push(chunk);
		});
		const table = offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
		parts.push(encoder.encode(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${table}trailer\n<< /Size ${offsets.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${size}\n%%EOF\n`));
		return concat(parts);
	}
}

export function concat(parts: Uint8Array[]): Uint8Array {
	const bytes = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
	parts.reduce((at, part) => (bytes.set(part, at), at + part.length), 0);
	return bytes;
}

export async function deflate(data: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}
