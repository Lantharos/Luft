<script lang="ts">
	import { t } from '@luft/i18n';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import type { FontFamily, FontRole } from './api';

	interface Props {
		family: FontFamily;
		divided: boolean;
		onopen: () => void;
		onuse: (role: FontRole) => void;
		onremove: () => void;
	}

	let { family, divided, onopen, onuse, onremove }: Props = $props();
</script>

<div class="font-row" class:divided>
	<button type="button" class="main" {@attach tooltip(t('settings-fonts-open', { family: family.name }))} onclick={onopen}>
		<span class="name">{family.name}</span>
		<span class="sample" style:font-family="'{family.name}', var(--font-sans)" aria-hidden="true">{t('settings-fonts-sample')}</span>
		<span class="styles">{t('settings-fonts-styles', { count: family.styles })}</span>
	</button>
	<MenuButton class="icon-button" label={t('settings-fonts-more-for', { family: family.name })} align="end" {@attach tooltip(t('settings-fonts-more'))}>
		{#snippet trigger()}<Ellipsis size={18} />{/snippet}
		{#snippet children(close)}
			<MenuItem
				onclick={() => {
					close();
					onuse('interface');
				}}>{t('settings-fonts-use-interface')}</MenuItem
			>
			{#if family.monospace}
				<MenuItem
					onclick={() => {
						close();
						onuse('monospace');
					}}>{t('settings-fonts-use-monospace')}</MenuItem
				>
			{/if}
			{#if family.removable}
				<MenuSeparator />
				<MenuItem
					danger
					onclick={() => {
						close();
						onremove();
					}}>{t('settings-fonts-remove')}</MenuItem
				>
			{/if}
		{/snippet}
	</MenuButton>
</div>

<style>
	.font-row {
		display: flex;
		height: 100%;
		align-items: center;
		gap: 4px;
		padding-right: 10px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.divided {
		box-shadow: inset 0 1px 0 var(--hairline);
	}

	.font-row:has(.main:hover) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		height: 100%;
		min-width: 0;
		flex: 1;
		align-items: center;
		gap: 14px;
		padding-inline: 16px 6px;
		text-align: left;
	}

	.sample {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		font-size: 19px;
		color: var(--text-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		width: 30%;
		flex: none;
		overflow: hidden;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.styles {
		flex: none;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
