<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		value: string;
		label: string;
		placeholder?: string;
		error?: string;
		invalid?: boolean;
		touched?: boolean;
		type?: 'text' | 'password' | 'url';
		inputmode?: HTMLInputAttributes['inputmode'];
		autocomplete?: HTMLInputAttributes['autocomplete'];
		disabled?: boolean;
		live?: boolean;
		onkeydown?: (event: KeyboardEvent) => void;
		trailing?: Snippet;
	}

	let {
		value = $bindable(),
		label,
		placeholder,
		error = '',
		invalid = false,
		touched = $bindable(false),
		type = 'text',
		inputmode,
		autocomplete = 'off',
		disabled = false,
		live = false,
		onkeydown,
		trailing
	}: Props = $props();

	let input = $state<HTMLInputElement>();
	let shown = $derived((live || touched) && (invalid || Boolean(error)));

	export function focus() {
		input?.focus();
	}
</script>

<div class="field">
	<div class="control">
		<input
			bind:this={input}
			class="text-field"
			class:invalid={shown}
			class:padded={trailing}
			{type}
			{placeholder}
			{inputmode}
			{autocomplete}
			{disabled}
			spellcheck="false"
			aria-label={label}
			aria-invalid={Boolean(shown)}
			bind:value
			onblur={() => (touched = true)}
			{onkeydown}
		/>
		{#if trailing}
			<div class="trailing">{@render trailing()}</div>
		{/if}
	</div>
	{#if shown && error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 6px;
	}

	.control {
		position: relative;
	}

	.text-field {
		color: var(--text);
	}

	.text-field:disabled {
		opacity: 0.4;
	}

	.padded {
		padding-right: 44px;
	}

	.invalid,
	.invalid:focus {
		box-shadow: inset 0 0 0 1.5px var(--danger);
	}

	.trailing {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
	}

	.error {
		padding-inline: 14px;
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--danger);
	}
</style>
