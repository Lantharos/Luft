<script lang="ts">
	import { t } from '@luft/i18n';
	import Keys from './Keys.svelte';

	interface Props {
		accelerators: string[];
		label: string;
		onclick: () => void;
	}

	let { accelerators, label, onclick }: Props = $props();
</script>

<button type="button" class="shortcut" aria-label={t('settings-shortcuts-change', { name: label })} {onclick}>
	<Keys {accelerators} />
</button>

<style>
	.shortcut {
		display: inline-flex;
		min-height: 34px;
		align-items: center;
		border-radius: 12px;
		padding: 4px 6px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.shortcut:hover {
		background: var(--surface-hover);
	}
</style>
