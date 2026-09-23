<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		target?: HTMLElement | string | null;
		enabled?: boolean;
	}

	let { children, target = null, enabled = true }: Props = $props();

	let wrapper: HTMLDivElement | undefined = $state();
	let resolvedTarget: HTMLElement | null = null;

	function resolveTarget(target: HTMLElement | string | null | undefined): HTMLElement | null {
		if (typeof document === 'undefined') return null;
		if (!target) return document.body;
		if (typeof target === 'string') {
			const element = document.querySelector(target);
			if (element instanceof HTMLElement) return element;
		}
		if (target instanceof HTMLElement) return target;
		return document.body;
	}

	function moveToTarget() {
		if (!enabled || !wrapper) return;
		const next = resolveTarget(target);
		if (!next) return;
		if (wrapper.parentNode !== next) {
			next.appendChild(wrapper);
		}
		resolvedTarget = next;
	}

	onMount(() => {
		moveToTarget();
		return () => {
			if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
		};
	});

	$effect(() => {
		// Track target and enabled
		target;
		enabled;
		untrack(() => moveToTarget());
	});
</script>

{#if enabled}
	<div bind:this={wrapper} data-portal-wrapper style="display: contents;">
		{@render children()}
	</div>
{:else}
	{@render children()}
{/if}
