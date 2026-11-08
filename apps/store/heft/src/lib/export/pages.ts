import { fileUrl } from '@lantharos/sabine';
import { HIGHLIGHTER_OPACITY, onDark } from '#lib/ink/color.js';
import { traceStroke, type PathSink } from '#lib/ink/geometry.js';
import { library } from '#lib/library/library.svelte.js';
import { pageSize, paperOf, type PageEntry } from '#lib/library/model.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import type { PageObject } from '#lib/page/objects.js';
import { LOOKS, ruling } from '#lib/paper/templates.js';
import { pdfImage } from '#lib/pdf/render.js';
import { sourcePath } from '#lib/pdf/sources.js';
import { deflate, type PdfPage, type Raster } from './writer';

const POINT = 0.75;
const RASTER_SCALE = 2;
const n = (value: number) => (Math.round(value * 100) / 100).toString();

/** PDF path operators, traced in page units through the page's flipped transform. */
class PdfPath implements PathSink {
	ops: string[] = [];

	moveTo(x: number, y: number) {
		this.ops.push(`${n(x)} ${n(y)} m`);
	}

	lineTo(x: number, y: number) {
		this.ops.push(`${n(x)} ${n(y)} l`);
	}

	closePath() {
		this.ops.push('h');
	}

	arc(x: number, y: number, radius: number) {
		const k = radius * 0.5523;
		this.ops.push(
			`${n(x + radius)} ${n(y)} m`,
			`${n(x + radius)} ${n(y + k)} ${n(x + k)} ${n(y + radius)} ${n(x)} ${n(y + radius)} c`,
			`${n(x - k)} ${n(y + radius)} ${n(x - radius)} ${n(y + k)} ${n(x - radius)} ${n(y)} c`,
			`${n(x - radius)} ${n(y - k)} ${n(x - k)} ${n(y - radius)} ${n(x)} ${n(y - radius)} c`,
			`${n(x + k)} ${n(y - radius)} ${n(x + radius)} ${n(y - k)} ${n(x + radius)} ${n(y)} c`
		);
	}
}

const rgb = (color: number) => `${n(((color >> 16) & 255) / 255)} ${n(((color >> 8) & 255) / 255)} ${n((color & 255) / 255)}`;

const cssRgb = (css: string) => Number.parseInt(css.slice(1), 16);

/** Our SVG rule paths (M, H and V only) as PDF line operators. */
function rules(path: string): string {
	const ops: string[] = [];
	let x = 0;
	let y = 0;
	for (const [, command, values] of path.matchAll(/([MHV])([-\d. ]+)/g)) {
		const numbers = values.trim().split(/\s+/).map(Number);
		if (command === 'M') {
			[x, y] = numbers;
			ops.push(`${n(x)} ${n(y)} m`);
		} else if (command === 'H') ops.push(`${n((x = numbers[0]))} ${n(y)} l`);
		else ops.push(`${n(x)} ${n((y = numbers[0]))} l`);
	}
	return ops.join('\n');
}

async function pixels(canvas: HTMLCanvasElement): Promise<Raster> {
	const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
	const color = new Uint8Array(canvas.width * canvas.height * 3);
	const alpha = new Uint8Array(canvas.width * canvas.height);
	for (let index = 0, pixel = 0; index < data.length; index += 4, pixel++) {
		color.set([data[index], data[index + 1], data[index + 2]], pixel * 3);
		alpha[pixel] = data[index + 3];
	}
	return { width: canvas.width, height: canvas.height, rgb: await deflate(color), alpha: await deflate(alpha) };
}

async function jpeg(canvas: HTMLCanvasElement): Promise<Raster> {
	const blob = await new Promise<Blob>((resolve) => canvas.toBlob((made) => resolve(made!), 'image/jpeg', 0.88));
	return { width: canvas.width, height: canvas.height, jpeg: new Uint8Array(await blob.arrayBuffer()) };
}

/** A text box drawn as a picture, the way it shows on the page. */
export async function textCanvas(object: PageObject, dark: boolean): Promise<HTMLCanvasElement> {
	const color = dark ? '#ececea' : '#1d1d1f';
	const style = `font: 16px/1.45 sans-serif; color: ${color}; padding: 2px 4px; overflow-wrap: anywhere; width: ${object.width}px; box-sizing: border-box;`;
	const measure = document.createElement('div');
	measure.style.cssText = `${style} position: fixed; left: -10000px; top: 0;`;
	measure.innerHTML = object.html ?? '';
	document.body.append(measure);
	const [width, height] = [Math.ceil(object.width), Math.ceil(Math.max(object.height, measure.offsetHeight))];
	measure.remove();
	const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="${style}">${new XMLSerializer().serializeToString(new DOMParser().parseFromString(object.html ?? '', 'text/html').body).replace(/^<body[^>]*>|<\/body>$/g, '')}</div></foreignObject></svg>`;
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	await image.decode();
	const canvas = document.createElement('canvas');
	canvas.width = width * RASTER_SCALE;
	canvas.height = height * RASTER_SCALE;
	canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
	return canvas;
}

export async function pictureCanvas(path: string): Promise<HTMLCanvasElement> {
	const bitmap = await createImageBitmap(await (await fetch(fileUrl(path))).blob());
	const canvas = document.createElement('canvas');
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
	return canvas;
}

export interface ExportOptions {
	paper: boolean;
}

/** One page as PDF drawing: its paper or book page, its ink as vector paths, and its text and pictures. */
export async function pdfPage(notebook: OpenNotebook, entry: PageEntry, options: ExportOptions): Promise<PdfPage> {
	const paper = paperOf(notebook.meta, entry);
	const look = LOOKS[paper.color];
	const size = pageSize(paper, entry);
	const document = (await notebook.load(entry.id)).document;
	const images: Raster[] = [];
	const opacities = [HIGHLIGHTER_OPACITY];
	const ops = [`${POINT} 0 0 ${-POINT} 0 ${n(size.height * POINT)} cm`];
	const place = (raster: Raster, x: number, y: number, width: number, height: number) => {
		ops.push(`q ${n(width)} 0 0 ${n(-height)} ${n(x)} ${n(y + height)} cm /I${images.length} Do Q`);
		images.push(raster);
	};
	if (entry.pdf) {
		place(await jpeg(await pdfImage(sourcePath(notebook, entry.pdf.source), entry.pdf.index, Math.round(size.width * RASTER_SCALE))), 0, 0, size.width, size.height);
	} else if (options.paper) {
		ops.push(`${rgb(cssRgb(look.background))} rg 0 0 ${n(size.width)} ${n(size.height)} re f`);
		const ruled = ruling(paper, size.width, size.height);
		if (ruled.lines) ops.push(`${rgb(cssRgb(look.line))} RG 0.6 w`, rules(ruled.lines), 'S');
		if (ruled.accents) ops.push(`${rgb(cssRgb(paper.template === 'lined' ? look.accent : look.line))} RG 0.9 w`, rules(ruled.accents), 'S');
	}
	const dark = look.dark && (options.paper || !!entry.pdf);
	for (const highlighter of [true, false]) {
		for (const stroke of document.strokes) {
			if ((stroke.tool === 'highlighter') !== highlighter) continue;
			const path = traceStroke(new PdfPath(), stroke.points);
			ops.push(`q ${highlighter ? '/G0 gs ' : ''}${rgb(dark ? onDark(stroke.color) : stroke.color)} rg`, ...path.ops, 'f Q');
		}
	}
	for (const object of document.objects) {
		if (object.kind === 'text') {
			const canvas = await textCanvas(object, dark);
			place(await pixels(canvas), object.x, object.y, object.width, canvas.height / RASTER_SCALE);
		}
		else place(await jpeg(await pictureCanvas(`${library.root}/${notebook.folder}/assets/${object.asset}`)), object.x, object.y, object.width, object.height);
	}
	return { width: size.width * POINT, height: size.height * POINT, content: ops.join('\n'), images, opacities };
}
