<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Archive from '@lucide/svelte/icons/archive';
	import Check from '@lucide/svelte/icons/check';
	import Clock from '@lucide/svelte/icons/clock';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Star from '@lucide/svelte/icons/star';
	import Trash from '@lucide/svelte/icons/trash-2';
	import type { ThreadRow } from '$lib/api';
	import { shortDate, until } from '$lib/app/format';

	interface Props {
		row: ThreadRow;
		selected: boolean;
		chosen: boolean;
		onopen: () => void;
		onchoose: (range: boolean) => void;
		onarchive: () => void;
		ontrash: () => void;
		onlater: (anchor: HTMLElement) => void;
		onmenu: (event: MouseEvent) => void;
	}

	let { row, selected, chosen, onopen, onchoose, onarchive, ontrash, onlater, onmenu }: Props = $props();

	let unread = $derived(row.unread > 0);
	let name = $derived(row.draft && row.count === 1 ? 'Draft' : row.senderName || row.sender);
	let when = $derived(row.snoozedUntil ? until(row.snoozedUntil) : shortDate(row.date));

	function act(event: MouseEvent, run: () => void) {
		event.stopPropagation();
		run();
	}
</script>

<div
	class="row"
	class:selected
	class:chosen
	class:unread
	role="option"
	aria-selected={selected || chosen}
	tabindex="-1"
	onclick={(event) => (event.shiftKey || event.ctrlKey || event.metaKey ? onchoose(event.shiftKey) : onopen())}
	oncontextmenu={(event) => {
		event.preventDefault();
		onmenu(event);
	}}
	onkeydown={(event) => event.key === 'Enter' && onopen()}
>
	{#if chosen}
		<span class="check" aria-hidden="true"><Check size={11} strokeWidth={3} /></span>
	{:else}
		<span class="dot" aria-hidden="true"></span>
	{/if}
	<div class="min-w-0 flex-1">
		<div class="flex items-baseline gap-2">
			<span class="sender truncate">{name}</span>
			{#if row.count > 1}
				<span class="muted flex-none">{row.count}</span>
			{/if}
			<span class="flex-1"></span>
			{#if row.flagged}
				<Star size={13} class="star flex-none self-center" />
			{/if}
			{#if row.attachments}
				<Paperclip size={13} class="muted flex-none self-center" />
			{/if}
			<span class="date muted flex-none">{when}</span>
		</div>
		<p class="subject truncate">{row.subject || '(no subject)'}</p>
		<p class="snippet muted truncate">{row.snippet}</p>
	</div>
	<div class="actions" data-no-drag>
		<button type="button" class="icon-button" aria-label="Archive" onclick={(event) => act(event, onarchive)} {@attach tooltip('Archive (E)')}>
			<Archive size={16} />
		</button>
		<button type="button" class="icon-button" aria-label="Later" onclick={(event) => act(event, () => onlater(event.currentTarget as HTMLElement))} {@attach tooltip('Later (B)')}>
			<Clock size={16} />
		</button>
		<button type="button" class="icon-button" aria-label="Delete" onclick={(event) => act(event, ontrash)} {@attach tooltip('Delete (#)')}>
			<Trash size={16} />
		</button>
	</div>
</div>

<style>
	.row {
		position: relative;
		display: flex;
		height: 100%;
		align-items: flex-start;
		gap: 10px;
		border-radius: 16px;
		padding: 11px 14px 0 12px;
		cursor: default;
		transition: background-color 120ms var(--ease);
	}

	.row:hover {
		background: var(--surface);
	}

	.row.selected {
		background: var(--surface-hover);
	}

	.row.chosen {
		background: var(--accent-soft);
	}

	.check {
		display: grid;
		height: 15px;
		width: 15px;
		flex: none;
		place-items: center;
		margin: 3px -4px 0;
		border-radius: 50%;
		background: var(--accent);
		color: var(--accent-text);
	}

	.dot {
		margin-top: 7px;
		height: 7px;
		width: 7px;
		flex: none;
		border-radius: 50%;
	}

	.unread .dot {
		background: var(--accent);
	}

	.sender {
		font-size: 14px;
		color: var(--text-soft);
	}

	.unread .sender,
	.unread .subject {
		color: var(--text);
		font-weight: 600;
	}

	.subject {
		margin-top: 1px;
		font-size: 13.5px;
		color: var(--text-soft);
	}

	.muted {
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.snippet {
		margin-top: 1px;
	}

	.date {
		font-variant-numeric: tabular-nums;
	}

	.row :global(.star) {
		color: var(--accent);
		fill: currentColor;
	}

	.actions {
		position: absolute;
		top: 6px;
		right: 8px;
		display: flex;
		gap: 2px;
		border-radius: var(--radius-pill);
		padding: 2px;
		background: var(--popover);
		box-shadow: 0 6px 20px var(--shadow-faint);
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms var(--ease);
	}

	.actions .icon-button {
		height: 28px;
		width: 28px;
	}

	.row:hover .actions {
		opacity: 1;
		pointer-events: auto;
	}
</style>
