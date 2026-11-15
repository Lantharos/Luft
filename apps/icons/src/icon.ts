import { isStroke, runs, type Shape } from './drawing.js';

export interface Colours {
	plate: string;
	ink: string;
	shade: string;
}

const STROKE = 'stroke-linecap="round" stroke-linejoin="round"';

function element(shape: Shape, colour: string): string {
	const attributes = Object.entries(shape.attributes).map(([name, value]) => `${name}="${value}"`);
	if (isStroke(shape)) attributes.unshift(`fill="none" stroke="${colour}" ${STROKE}`);
	return `<${shape.tag} ${attributes.join(' ')}/>`;
}

export function appIcon(shapes: Shape[], colours: Colours): string {
	const groups = runs(shapes, (first, second) => first.layer === second.layer).map(group => {
		const colour = colours[group[0].layer];
		return [`\t<g fill="${colour}">`, ...group.map(shape => `\t\t${element(shape, colour)}`), '\t</g>'];
	});
	return [
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
		`\t<rect width="64" height="64" rx="14" fill="${colours.plate}"/>`,
		...groups.flat(),
		'</svg>',
		'',
	].join('\n');
}
