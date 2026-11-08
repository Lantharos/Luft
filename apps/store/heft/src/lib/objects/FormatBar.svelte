<script lang="ts">
	import Bold from '@lucide/svelte/icons/bold';
	import Heading from '@lucide/svelte/icons/heading';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';

	let { x, y }: { x: number; y: number } = $props();

	const FORMATS = [
		{ label: () => t('format-heading'), icon: Heading, apply: () => document.execCommand('formatBlock', false, document.queryCommandValue('formatBlock') === 'h2' ? 'div' : 'h2') },
		{ label: () => t('format-bold'), icon: Bold, apply: () => document.execCommand('bold') },
		{ label: () => t('format-list'), icon: List, apply: () => document.execCommand('insertUnorderedList') },
		{ label: () => t('format-numbered'), icon: ListOrdered, apply: () => document.execCommand('insertOrderedList') }
	];
</script>

<div class="bar" style:transform="translate({x}px, {y}px)" role="toolbar" aria-label={t('format-label')} tabindex="-1" onpointerdown={(event) => (event.preventDefault(), event.stopPropagation())}>
	{#each FORMATS as format (format.icon)}
		<button type="button" class="icon-button" aria-label={format.label()} {@attach tooltip(format.label())} onclick={format.apply}>
			<format.icon size={17} />
		</button>
	{/each}
</div>

<style>
	.bar {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 5;
		display: flex;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		padding: 4px;
		box-shadow: 0 10px 30px var(--shadow-soft);
	}

	:global([data-posture='tablet']) .bar .icon-button {
		height: 44px;
		width: 44px;
	}
</style>
