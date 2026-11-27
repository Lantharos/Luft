import { clipboard } from '@lantharos/sabine';
import { t } from '@luft/i18n';
import type { App } from '#lib/app/app.svelte.js';
import { objectId, type BoardObject, type ShapeKind } from '#lib/board/model.js';
import { moved } from '#lib/board/transform.js';
import type { BoardTool } from '#lib/board/tools/tool.js';
import { addPicture } from '#lib/files/board-file.js';
import { SHAPE_KEYS, TOOL_KEYS } from './hints';
import type { Whiteboard } from './whiteboard.svelte';

const OBJECTS = 'application/x-easel-objects';
const OFFSET = 24;
const TOOLS = new Map(Object.entries(TOOL_KEYS).map(([tool, key]) => [key.toLowerCase(), tool as BoardTool]));
const SHAPES = new Map(Object.entries(SHAPE_KEYS).map(([shape, key]) => [key.toLowerCase(), shape as ShapeKind]));

function copies(objects: BoardObject[], offset: number) {
	const ids = new Map(objects.map((object) => [object.id, objectId()]));
	const groups = new Map<string, string>();
	return objects.map((object) => {
		const copy = moved({ ...object, id: ids.get(object.id)! }, offset, offset);
		if (copy.group) copy.group = groups.get(copy.group) ?? groups.set(copy.group, objectId()).get(copy.group)!;
		if (copy.kind === 'arrow') {
			if (copy.from.attach) copy.from = ids.has(copy.from.attach) ? { ...copy.from, attach: ids.get(copy.from.attach) } : { x: copy.from.x, y: copy.from.y };
			if (copy.to.attach) copy.to = ids.has(copy.to.attach) ? { ...copy.to, attach: ids.get(copy.to.attach) } : { x: copy.to.x, y: copy.to.y };
		}
		return copy;
	});
}

export async function paste(whiteboard: Whiteboard) {
	const { board, viewport } = whiteboard;
	const data = await clipboard.read({ types: [OBJECTS, 'image/png', 'image/jpeg', 'image/webp'] });
	const objects = data[OBJECTS];
	if (typeof objects === 'string') {
		const pasted = copies(JSON.parse(objects) as BoardObject[], OFFSET);
		const frames = pasted.filter((object) => object.kind === 'frame');
		board.commit(t('easel-history-paste'), [...frames, ...board.objects, ...pasted.filter((object) => object.kind !== 'frame')]);
		board.select(pasted.map((object) => object.id));
		return;
	}
	const image = Object.entries(data).find(([type, value]) => type.startsWith('image/') && typeof value !== 'string');
	if (image) await addPicture(board, new Uint8Array(image[1] as Uint8Array), image[0], viewport.toDocument(viewport.width / 2, viewport.height / 2), t('easel-history-paste'));
}

export function boardShortcut(app: App, whiteboard: Whiteboard, event: KeyboardEvent) {
	const target = event.target as HTMLElement | null;
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || app.dialog) return;
	const { board, viewport } = whiteboard;
	const mod = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();
	const run = (action: () => unknown) => {
		event.preventDefault();
		void action();
	};
	const selection = board.selection;
	if (mod) {
		if (key === 'z' && event.shiftKey) return run(() => board.redo());
		if (key === 'z') return run(() => board.undo());
		if (key === 'y') return run(() => board.redo());
		if (key === 's') return run(() => app.save(event.shiftKey));
		if (key === 'o') return run(() => app.chooseAndOpen());
		if (key === 'e') return run(() => (app.dialog = 'export'));
		if (key === 'a') return run(() => (whiteboard.choose('select'), board.select(board.objects.map((object) => object.id))));
		if (key === 'c' && selection.length) return run(() => clipboard.write({ [OBJECTS]: JSON.stringify(selection) }));
		if (key === 'x' && selection.length) return run(async () => {
			await clipboard.write({ [OBJECTS]: JSON.stringify(selection) });
			board.commit(t('easel-history-cut'), board.objects.filter((object) => !board.selected.has(object.id)));
		});
		if (key === 'v') return run(() => paste(whiteboard));
		if (key === 'd' && selection.length) return run(() => {
			const duplicated = copies(selection, OFFSET);
			board.commit(t('easel-history-duplicate'), [...board.objects, ...duplicated]);
			board.select(duplicated.map((object) => object.id));
		});
		if (key === 'g' && selection.length > 1) return run(() => {
			const group = event.shiftKey ? undefined : objectId();
			board.update(t(group ? 'easel-history-group' : 'easel-history-ungroup'), new Map(selection.map((object) => [object.id, { ...object, group }])));
		});
		if (key === '0') return run(() => app.fitBoard());
		if (key === '=' || key === '+') return run(() => viewport.zoomBy(1.25));
		if (key === '-') return run(() => viewport.zoomBy(0.8));
		return;
	}
	if ((key === 'delete' || key === 'backspace') && selection.length) return run(() => board.commit(t('easel-history-delete'), board.objects.filter((object) => !board.selected.has(object.id))));
	if (key === 'escape') return run(() => board.select([]));
	if (key === 'enter' && selection.length === 1 && 'text' in selection[0]) return run(() => whiteboard.edit(selection[0].id));
	if (event.altKey) return;
	const tool = TOOLS.get(key);
	if (tool) return run(() => whiteboard.choose(tool));
	const shape = SHAPES.get(key);
	if (shape) run(() => whiteboard.chooseShape(shape));
}
