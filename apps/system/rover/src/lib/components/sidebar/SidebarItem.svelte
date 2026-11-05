<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		icon: Component;
		label: string;
		active?: boolean;
		dropping?: boolean;
		spinning?: boolean;
		detail?: Snippet;
		trailing?: Snippet;
	}

	let { icon: Icon, label, active = false, dropping = false, spinning = false, detail, trailing, class: className, onclick, ...rest }: Props =
		$props();

	function click(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (event.detail > 0) event.currentTarget.blur();
		onclick?.(event);
	}
</script>

<div class={['sidebar-item', active && 'is-active', dropping && 'is-drop-target', className]}>
	<button class="sidebar-item__main" type="button" aria-current={active ? 'page' : undefined} {...rest} onclick={click}>
		<Icon size={18} class={spinning ? 'animate-spin' : ''} />
		<span class="sidebar-item__text">
			<span class="truncate">{label}</span>
			{@render detail?.()}
		</span>
	</button>
	{@render trailing?.()}
</div>

<style>
	.sidebar-item {
		display: flex;
		min-height: 36px;
		flex: none;
		align-items: center;
		border-radius: var(--radius-pill);
		color: var(--sidebar-text);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate),
			box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.sidebar-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.sidebar-item.is-active {
		background: transparent;
		color: var(--text);
	}

	.sidebar-item.is-drop-target,
	.sidebar-item.is-insert-target {
		background: var(--accent-soft);
		color: var(--text);
		box-shadow: inset 0 0 0 1.5px var(--accent-line);
	}

	.sidebar-item--drive {
		min-height: 44px;
	}

	.sidebar-item__main {
		display: flex;
		min-height: inherit;
		min-width: 0;
		flex: 1;
		align-items: center;
		gap: 11px;
		padding-inline: 12px;
		text-align: left;
		font-size: 14px;
		transition: transform var(--motion-tap) var(--ease-decelerate);
	}

	.sidebar-item__main:active:not(:disabled) {
		transform: scale(0.97);
	}

	.sidebar-item__main:disabled {
		opacity: 0.6;
	}

	.sidebar-item__text {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 5px;
	}
</style>
