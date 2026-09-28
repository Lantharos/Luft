<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import TextField from './TextField.svelte';

	interface Props {
		value: string;
		label: string;
		showLabel?: boolean;
		placeholder?: string;
		error?: string;
		autocomplete?: 'off' | 'current-password' | 'new-password';
		disabled?: boolean;
		live?: boolean;
		onreveal?: () => void | Promise<void>;
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let { value = $bindable(), label, showLabel = false, placeholder, error, autocomplete = 'off', disabled = false, live = false, onreveal, onkeydown }: Props = $props();

	let revealed = $state(false);

	async function toggle() {
		if (!revealed) await onreveal?.();
		revealed = !revealed;
	}
</script>

<TextField bind:value {label} {showLabel} {placeholder} {error} {autocomplete} {disabled} {live} {onkeydown} type={revealed ? 'text' : 'password'}>
	{#snippet trailing()}
		<button type="button" class="reveal" aria-label={revealed ? 'Hide password' : 'Show password'} {disabled} onclick={toggle}>
			{#if revealed}
				<EyeOff size={16} />
			{:else}
				<Eye size={16} />
			{/if}
		</button>
	{/snippet}
</TextField>

<style>
	.reveal {
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition: background-color 160ms var(--ease), color 160ms var(--ease);
	}

	.reveal:hover:not(:disabled) {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
