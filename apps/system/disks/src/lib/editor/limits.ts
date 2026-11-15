import { t } from '@luft/i18n';
import type { Support } from '#lib/bindings.js';
import { alignUp, end, MiB, type Layout, type Part } from './model';

const OFFLINE_SHRINK = 2;
const OFFLINE_GROW = 4;
const ONLINE_SHRINK = 8;
const ONLINE_GROW = 16;
const HEADROOM: Record<string, [number, number]> = { btrfs: [1.25, 256 * MiB] };
const DEFAULT_HEADROOM: [number, number] = [1.1, 64 * MiB];
const SMALLEST: Record<string, number> = { btrfs: 128 * MiB, ext4: 16 * MiB, vfat: 34 * MiB };
const SMALLEST_MOVE = 1024 * MiB;

export interface Limits {
	before: number;
	after: number;
	smallest: number;
	largest: number;
	movable: boolean;
	movesAtStart: boolean;
	notes: string[];
}

function smallestFor(filesystem: string) {
	return SMALLEST[filesystem] ?? MiB;
}

export function neighbours(layout: Layout, part: Part) {
	const index = layout.parts.findIndex((candidate) => candidate.key === part.key);
	const previous = layout.parts[index - 1];
	const next = layout.parts[index + 1];
	let before = previous ? alignUp(end(previous)) : layout.start;
	let after = next ? next.offset : layout.end;
	const extended = layout.extended;
	if (extended && !part.logical) {
		if (part.offset < extended.offset) after = Math.min(after, extended.offset);
		else before = Math.max(before, alignUp(end(extended)));
	}
	if (extended && part.logical) {
		before = Math.max(before, extended.offset + MiB);
		after = Math.min(after, end(extended));
	}
	return { before, after };
}

function resizing(part: Part, support: (filesystem: string) => Support | undefined) {
	if (part.pending || (part.replaced && !part.filesystem)) return { grow: true, shrink: true, smallest: smallestFor(part.filesystem) };
	if (!part.usage) return { grow: true, shrink: true, smallest: MiB };
	if (part.usage !== 'filesystem' || (part.encrypted && !part.system)) return { grow: false, shrink: false, smallest: part.size };
	const flags = support(part.filesystem)?.resize ?? 0;
	const [grows, shrinks] = part.system ? [ONLINE_GROW, ONLINE_SHRINK] : [ONLINE_GROW | OFFLINE_GROW, ONLINE_SHRINK | OFFLINE_SHRINK];
	const known = part.used !== null;
	const [share, margin] = HEADROOM[part.filesystem] ?? DEFAULT_HEADROOM;
	const smallest = known ? Math.max(smallestFor(part.filesystem), alignUp((part.used ?? 0) * share + margin)) : part.size;
	return { grow: (flags & grows) !== 0, shrink: known && (flags & shrinks) !== 0, smallest: Math.min(part.size, smallest) };
}

export function limitsOf(layout: Layout, part: Part, support: (filesystem: string) => Support | undefined): Limits {
	const { before, after } = neighbours(layout, part);
	const notes: string[] = [];
	const size = resizing(part, support);
	const movable = !part.system && !part.logical;
	const movesAtStart = part.system && !part.logical && size.grow && part.offset - before >= SMALLEST_MOVE;
	if (movesAtStart) {
		notes.push(t('disks-editor-note-system-moves'));
	} else if (part.system) {
		notes.push(
			size.grow || size.shrink
				? t('disks-editor-note-system-in-place')
				: t('disks-editor-note-system-fixed')
		);
	} else if (part.logical) {
		notes.push(t('disks-editor-note-logical'));
	}
	if (part.encrypted && !part.replaced && !part.system) notes.push(t('disks-editor-note-encrypted'));
	else if (!part.pending && !part.replaced && part.usage === 'filesystem' && part.used === null && !part.system)
		notes.push(t('disks-editor-note-mount'));
	else if (part.usage && part.usage !== 'filesystem' && !part.encrypted) notes.push(t('disks-editor-note-unknown-contents'));
	if (!part.system && part.mounted) notes.push(t('disks-editor-note-unmounts'));
	const grows = size.grow && !part.logical;
	const start = movable || movesAtStart ? before : part.offset;
	const stop = movable || grows ? after : end(part);
	return {
		before: start,
		after: stop,
		smallest: size.shrink && !part.logical ? size.smallest : part.size,
		largest: grows ? stop - start : part.size,
		movable,
		movesAtStart,
		notes
	};
}
