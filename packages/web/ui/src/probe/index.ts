import { invoke, listen } from '@lantharos/sabine';

import { contentOf, nameOf, roleOf, squash } from './names';

export interface Query {
	role?: string;
	name?: string;
	text?: string;
	within?: Query;
	has?: Query;
}

interface Asked {
	id: number;
	query: Query;
}

const MODAL = '[aria-modal="true"]';

const shown = (element: Element) => {
	const { width, height } = element.getBoundingClientRect();
	return width > 0 && height > 0 && element.checkVisibility({ visibilityProperty: true });
};

function topmostModal() {
	const modals = [...document.querySelectorAll(MODAL)].filter(shown);
	return modals.at(-1) ?? document.body;
}

function innermost(elements: Element[]) {
	return elements.filter((element) => !elements.some((other) => other !== element && element.contains(other)));
}

function matching(scope: Element, { role, name, text, has }: Query): Element[] {
	const candidates = [...scope.querySelectorAll('*')];
	const found =
		text !== undefined
			? innermost(candidates.filter((element) => element.textContent.includes(text) && shown(element) && squash(contentOf(element)) === text))
			: candidates.filter((element) => roleOf(element) === role && shown(element) && (name === undefined || nameOf(element) === name));
	return has ? found.filter((element) => matching(element, has).length > 0) : found;
}

function scopeOf(query: Query): Element[] {
	if (!query.within) return [topmostModal()];
	return scopeOf(query.within).flatMap((scope) => matching(scope, query.within!));
}

function hits(element: Element, { x, y, width, height }: DOMRect) {
	const target = document.elementFromPoint(x + width / 2, y + height / 2);
	return target !== null && element.contains(target);
}

function find(query: Query) {
	const scopes = scopeOf(query);
	const matches = scopes.flatMap((scope) => matching(scope, query));
	const alike = query.role && matches.length !== 1 ? scopes.flatMap((scope) => matching(scope, { role: query.role })).map(nameOf) : [];
	return {
		scale: devicePixelRatio,
		alike,
		matches: matches.map((element) => {
			const box = element.getBoundingClientRect();
			return { x: box.x, y: box.y, width: box.width, height: box.height, hit: hits(element, box) };
		})
	};
}

export const answerProbes = () =>
	listen<Asked>('probe.asked', ({ id, query }) => void invoke('probe.answer', { id, reply: JSON.stringify(find(query)) }));
