export interface ToolEvent {
	x: number;
	y: number;
	localX: number;
	localY: number;
	pressure: number;
	pointer: string;
	shift: boolean;
	alt: boolean;
	ctrl: boolean;
	eraser: boolean;
	samples: { x: number; y: number; pressure: number }[];
}

export interface ToolHandler {
	readonly cursor?: string;
	down(event: ToolEvent): void;
	move?(event: ToolEvent): void;
	up?(event: ToolEvent): void;
	hover?(event: ToolEvent): void;
	key?(event: KeyboardEvent): boolean;
	commit?(): void;
	cancel?(): void;
}
