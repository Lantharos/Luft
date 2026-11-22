<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Lock from '@lucide/svelte/icons/lock';
	import { t } from '@luft/i18n';

	interface Props {
		title: string;
		description?: string;
		icon?: Component;
		disabled?: boolean;
		locked?: boolean;
		truncate?: boolean;
		expanded?: boolean;
		onclick?: () => void;
		children?: Snippet;
		below?: Snippet;
	}

	let { title, description, icon: Icon, disabled = false, locked = false, truncate = false, expanded, onclick, children, below }: Props = $props();

	const id = $props.id();
</script>

{#snippet content()}
	<div class="line">
		{#if Icon}
			<span class="icon"><Icon size={20} /></span>
		{/if}
		<div class="text">
			<span class="title">{title}</span>
			{#if locked}
				<span id="{id}-description" class="description managed"><Lock size={12} />{t('ui-row-managed')}</span>
			{:else if description}
				<span id="{id}-description" class="description" class:truncate>{description}</span>
			{/if}
		</div>
		{#if children}
			<div class="trailing" class:locked inert={locked}>{@render children()}</div>
		{/if}
		{#if onclick}
			<ChevronRight size={18} class="shrink-0 text-[var(--text-muted)] transition-transform duration-200 {expanded ? 'rotate-90' : ''}" />
		{/if}
	</div>
{/snippet}

{#if onclick}
	<div class="group">
		<div class="row interactive" class:attached={below} class:disabled>
			<button
				type="button"
				class="opens"
				aria-label={title}
				aria-describedby={description ? `${id}-description` : undefined}
				aria-expanded={expanded}
				{disabled}
				{onclick}
			></button>
			{@render content()}
		</div>
		{#if below}
			<div class="below detached">{@render below()}</div>
		{/if}
	</div>
{:else}
	<div class="row" class:disabled>
		{@render content()}
		{#if below}
			<div class="below">{@render below()}</div>
		{/if}
	</div>
{/if}

<style>
	.row {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 12px;
		padding: 14px 16px;
		text-align: left;
	}

	.group {
		display: flex;
		flex-direction: column;
	}

	.row.attached {
		padding-bottom: 12px;
	}

	.row.disabled {
		opacity: 0.45;
	}

	.interactive {
		position: relative;
		border-top-left-radius: inherit;
		border-top-right-radius: inherit;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.interactive:not(.attached) {
		border-bottom-left-radius: inherit;
		border-bottom-right-radius: inherit;
	}

	.interactive:has(> .opens:hover:not(:disabled)) {
		background: var(--surface-hover);
	}

	.opens {
		position: absolute;
		inset: 0;
		outline-offset: -2px;
	}

	.interactive > .line {
		position: relative;
		pointer-events: none;
	}

	.interactive .trailing :global(:is(button, a, input, textarea, [tabindex])) {
		pointer-events: auto;
	}

	.line {
		display: flex;
		min-height: 28px;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 14px;
	}

	.icon {
		display: grid;
		flex: none;
		place-items: center;
		color: var(--text-soft);
	}

	.text {
		display: flex;
		min-width: 0;
		flex: 1 1 14rem;
		flex-direction: column;
		gap: 2px;
	}

	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title {
		overflow-wrap: break-word;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}

	.description {
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--text-muted);
	}

	.trailing {
		display: flex;
		max-width: 100%;
		flex: none;
		margin-left: auto;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: var(--text-muted);
	}

	.managed {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.trailing.locked {
		opacity: 0.5;
	}

	.trailing > :global(.icon-button:last-child) {
		margin-right: -7px;
	}

	.below {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.detached {
		padding: 0 16px 14px;
	}
</style>
