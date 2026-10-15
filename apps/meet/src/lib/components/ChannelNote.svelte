<script lang="ts">
	import { fly } from 'svelte/transition';
	import { session } from '#lib/state/meet.svelte.js';

	const MESSAGES = {
		nightly: 'Meet Luft will use nightly builds',
		latest: 'Meet Luft will use releases again'
	};

	function undo() {
		session.dismissNote();
		void session.switchChannel();
	}
</script>

{#if session.note}
	{#key session.note.id}
		<div class="note" role="status" transition:fly={{ y: 12, duration: 200 }}>
			<span class="min-w-0 truncate">{MESSAGES[session.note.channel]}</span>
			<button class="action" type="button" onclick={undo}>Undo</button>
		</div>
	{/key}
{/if}

<style>
	.note {
		position: absolute;
		bottom: 28px;
		left: 50%;
		z-index: 20;
		display: flex;
		max-width: calc(100% - 48px);
		translate: -50% 0;
		align-items: center;
		gap: 14px;
		padding: 6px 6px 6px 16px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 90%, transparent);
		box-shadow:
			0 16px 48px var(--shadow-soft),
			inset 0 1px 0 var(--hairline);
		backdrop-filter: blur(24px);
		font-size: 13px;
		color: var(--text-soft);
	}

	.action {
		flex: none;
		min-height: 30px;
		padding-inline: 12px;
		border-radius: var(--radius-pill);
		font-weight: 500;
		color: var(--accent);
		transition: background-color 160ms var(--ease);
	}

	.action:hover {
		background: var(--surface-hover);
	}
</style>
