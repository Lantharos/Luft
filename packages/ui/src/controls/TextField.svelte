<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		value: string;
		label: string;
		showLabel?: boolean;
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
		showLabel = false,
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

	const id = $props.id();

	let input = $state<HTMLInputElement>();
	let shown = $derived((live || touched) && (invalid || Boolean(error)));

	export function focus() {
		input?.focus();
	}
</script>

<div class="field">
	{#if showLabel}
		<label class="label" for={id}>{label}</label>
	{/if}
	<div class="control">
		<input
			bind:this={input}
			{id}
			class="text-field"
			class:invalid={shown}
			class:padded={trailing}
			{type}
			{placeholder}
			{inputmode}
			{autocomplete}
			{disabled}
			spellcheck="false"
			aria-label={showLabel ? undefined : label}
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

	.label {
		padding-inline: 4px;
		font-size: 13px;
		color: var(--text-soft);
	}

	.text-field {
		color: var(--text);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	.text-field:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
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
