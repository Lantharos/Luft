<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		wide?: boolean;
		onclose: () => void;
		children?: Snippet;
		actions: Snippet;
	}

	let { title, description, wide = false, onclose, children, actions }: Props = $props();

	const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

	let panel = $state<HTMLDivElement>();

	$effect(() => {
		const previous = document.activeElement as HTMLElement | null;
		panel?.focus();
		return () => previous?.focus();
	});

	function trap(event: KeyboardEvent) {
		if (event.key !== 'Tab' || !panel) return;
		const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
		if (!focusable.length) return event.preventDefault();
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement;
		if (event.shiftKey && (active === first || active === panel)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onclose()} />

<div class="overlay" role="presentation" onpointerdown={(event) => event.target === event.currentTarget && onclose()}>
	<div bind:this={panel} class="dialog" class:wide role="dialog" aria-modal="true" aria-label={title} tabindex="-1" onkeydown={trap}>
		<div class="flex flex-col gap-1.5">
			<h2 class="text-[17px] font-semibold">{title}</h2>
			{#if description}
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{description}</p>
			{/if}
		</div>
		{#if children}
			<div class="body soft-scroll">{@render children()}</div>
		{/if}
		<div class="flex justify-end gap-2">{@render actions()}</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: center;
		background: rgba(8, 8, 7, 0.45);
		animation: fade 180ms var(--ease);
	}

	.dialog {
		display: flex;
		width: min(420px, calc(100vw - 48px));
		max-height: calc(100vh - 48px);
		flex-direction: column;
		gap: 20px;
		padding: 22px;
		border-radius: 24px;
		background: var(--popover);
		box-shadow: 0 24px 64px var(--shadow-soft);
		outline: none;
		animation: rise 220ms var(--ease);
	}

	.wide {
		width: min(560px, calc(100vw - 48px));
	}

	.body {
		display: flex;
		min-height: 0;
		flex-direction: column;
		gap: 12px;
		overflow-x: hidden;
		overflow-y: auto;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
	}
</style>
