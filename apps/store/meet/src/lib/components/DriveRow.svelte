<script lang="ts">
	import type { Component } from 'svelte';
	import Usb from '@lucide/svelte/icons/usb';

	interface Props {
		icon?: Component<{ size?: number }>;
		title: string;
		detail: string;
		selected: boolean;
		disabled?: boolean;
		onclick: () => void;
	}

	let { icon: Icon = Usb, title, detail, selected, disabled = false, onclick }: Props = $props();
</script>

<button type="button" class="drive" class:selected role="radio" aria-checked={selected} {disabled} {onclick}>
	<span class="icon"><Icon size={20} /></span>
	<span class="flex min-w-0 flex-1 flex-col text-left">
		<span class="truncate text-[15px] font-medium">{title}</span>
		<span class="truncate text-[13px] text-[var(--text-muted)]">{detail}</span>
	</span>
	<span class="dot" aria-hidden="true"></span>
</button>

<style>
	.drive {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 14px;
		border-radius: 16px;
		padding: 11px 16px 11px 12px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.drive:hover:not(:disabled),
	.drive.selected {
		background: var(--surface-hover);
	}

	.drive:disabled {
		opacity: 0.45;
	}

	.icon {
		display: grid;
		height: 38px;
		width: 38px;
		flex: none;
		place-items: center;
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.dot {
		height: 20px;
		width: 20px;
		flex: none;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.5px var(--text-muted);
		transition: box-shadow var(--motion-quick) var(--ease-decelerate);
	}

	.selected .dot {
		box-shadow:
			inset 0 0 0 6px var(--accent),
			inset 0 0 0 20px var(--accent-text);
	}
</style>
