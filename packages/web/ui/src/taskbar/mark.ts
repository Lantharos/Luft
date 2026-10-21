export interface MarkLayer {
	path: string;
	fill: 'shade' | 'ink';
	halo: boolean;
	direction: 1 | -1;
	pivot: [number, number];
}

export const MARK_WIDTH = 187;
export const MARK_HEIGHT = 197;
export const MARK_SCALE = 0.65;
export const PAINTED_MARK_SCALE = 0.8;

export const MARK_LAYERS: MarkLayer[] = [
	{
		path: 'M119.718 130.99C159.986 113.061 161.602 43.9304 179.53 84.1989C197.459 124.467 179.349 171.645 139.081 189.574C98.8128 207.503 51.6341 189.393 33.7053 149.125C15.7766 108.856 79.4495 148.919 119.718 130.99Z',
		fill: 'shade',
		halo: false,
		direction: 1,
		pivot: [0.58, 0.69]
	},
	{
		path: 'M78.4133 63.6013C118.682 45.6726 131.515 -28.4531 149.444 11.8151C167.372 52.0837 149.262 99.2624 108.993 117.191C68.7249 135.12 21.5471 117.009 3.61838 76.7409C-14.3103 36.4724 38.1448 81.5298 78.4133 63.6013Z',
		fill: 'ink',
		halo: true,
		direction: -1,
		pivot: [0.4, 0.3]
	}
];

export interface MarkFills {
	shade: string;
	ink: string;
}

export const markLayerSvg = ({ path }: MarkLayer, fill: string): string =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_WIDTH}" height="${MARK_HEIGHT}" viewBox="0 0 ${MARK_WIDTH} ${MARK_HEIGHT}"><path d="${path}" fill="${fill}"/></svg>`;
