export interface Padding {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export interface VirtualLayout {
	itemHeight: number;
	minItemWidth?: number;
	gap?: number;
	padding?: Partial<Padding>;
}

export interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export interface Position {
	x: number;
	y: number;
}

const NO_PADDING: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

export class GridGeometry {
	readonly padding: Padding;
	readonly gap: number;
	readonly columns: number;
	readonly itemWidth: number;
	readonly itemHeight: number;
	readonly pitch: number;
	readonly rows: number;
	readonly height: number;

	constructor(layout: VirtualLayout, width: number, count: number) {
		this.padding = { ...NO_PADDING, ...layout.padding };
		this.gap = layout.gap ?? 0;
		const inner = Math.max(0, width - this.padding.left - this.padding.right);
		this.columns = layout.minItemWidth ? Math.max(1, Math.floor((inner + this.gap) / (layout.minItemWidth + this.gap))) : 1;
		this.itemWidth = Math.max(0, (inner - this.gap * (this.columns - 1)) / this.columns);
		this.itemHeight = layout.itemHeight;
		this.pitch = this.itemHeight + this.gap;
		this.rows = Math.ceil(count / this.columns);
		this.height = this.padding.top + Math.max(0, this.rows * this.pitch - this.gap) + this.padding.bottom;
	}

	position(index: number): Position {
		const row = Math.floor(index / this.columns);
		const column = index % this.columns;
		return { x: this.padding.left + column * (this.itemWidth + this.gap), y: this.padding.top + row * this.pitch };
	}

	rowAt(y: number) {
		return Math.floor((y - this.padding.top) / this.pitch);
	}

	indicesIn(area: Rect, count: number) {
		const indices: number[] = [];
		const firstRow = Math.max(0, this.rowAt(area.top));
		const lastRow = Math.min(this.rows - 1, this.rowAt(area.bottom));
		for (let row = firstRow; row <= lastRow; row++) {
			const top = this.padding.top + row * this.pitch;
			if (top >= area.bottom || top + this.itemHeight <= area.top) continue;
			for (let column = 0; column < this.columns; column++) {
				const index = row * this.columns + column;
				if (index >= count) break;
				const left = this.padding.left + column * (this.itemWidth + this.gap);
				if (left < area.right && left + this.itemWidth > area.left) indices.push(index);
			}
		}
		return indices;
	}
}

export interface VirtualHandle {
	scrollToIndex(index: number, align?: 'nearest' | 'center'): void;
	contentPoint(clientX: number, clientY: number): Position;
	indicesIn(area: Rect): number[];
	metrics(): { columns: number; pageRows: number };
	element(): HTMLDivElement | undefined;
}
