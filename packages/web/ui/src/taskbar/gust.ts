export type GustFill = string | readonly [top: string, bottom: string];

export interface GustFills {
	disc: GustFill;
	wave: GustFill;
}

export type GustPart = keyof GustFills;

export const GUST_BOX = 52;
export const GUST_SCALE = 0.5;
export const GUST_PARTS: GustPart[] = ['disc', 'wave'];

export const GUST_PATHS: Record<GustPart, string> = {
	disc: 'M0 26a26 26 0 1 0 52 0 26 26 0 1 0-52 0Z',
	wave: 'M.2 24A26 26 0 0 1 51.9 24C43 13 35 33 21 34 11 34.7 4 31 .2 24Z'
};

export const GUST_ON_DARK: GustFills = { disc: '#a3adb8', wave: '#ffffff' };
export const GUST_ON_LIGHT: GustFills = { disc: ['#9aa6b3', '#7c8795'], wave: '#ffffff' };

const gradient = (id: string, [top, bottom]: readonly [string, string]) =>
	`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;

export const gustPartSvg = (part: GustPart, fill: GustFill): string => {
	const paint = typeof fill === 'string' ? { defs: '', fill } : { defs: `<defs>${gradient('fill', fill)}</defs>`, fill: 'url(#fill)' };
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${GUST_BOX}" height="${GUST_BOX}" viewBox="0 0 ${GUST_BOX} ${GUST_BOX}">${paint.defs}<path d="${GUST_PATHS[part]}" fill="${paint.fill}"/></svg>`;
};
