export interface Surface {
	invalidate: () => void;
	draw(): void;
	destroy(): void;
}
