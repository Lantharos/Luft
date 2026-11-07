<script lang="ts">
	import { completeWord } from './words';

	interface Props {
		value: string;
		label: string;
		error?: string;
		onnext?: () => void;
	}

	let { value = $bindable(), label, error = '', onnext }: Props = $props();

	const id = $props.id();

	let input = $state<HTMLInputElement>();
	const completed = $derived(completeWord(value));
	const rest = $derived(completed && value.length < completed.length ? completed.slice(value.length) : '');

	export function focus() {
		input?.focus({ preventScroll: true });
	}

	function change(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.value.toLowerCase().replace(/[^a-z]/g, '');
		event.currentTarget.value = value;
	}

	function keydown(event: KeyboardEvent) {
		if (event.key !== ' ' && event.key !== 'Enter' && event.key !== 'Tab') return;
		if (event.key === ' ') event.preventDefault();
		if (completed) value = completed;
		if (event.key !== 'Tab' && onnext) {
			event.preventDefault();
			onnext();
		}
	}
</script>

<div class="field">
	<label class="label" for={id}>{label}</label>
	<div class="control">
		<input
			bind:this={input}
			{id}
			class="text-field"
			class:invalid={Boolean(error)}
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			aria-invalid={Boolean(error)}
			{value}
			oninput={change}
			onkeydown={keydown}
			onblur={() => completed && (value = completed)}
		/>
		{#if rest}
			<span class="completion" aria-hidden="true"><span class="typed">{value}</span>{rest}</span>
		{/if}
	</div>
	{#if error}
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
		box-shadow: inset 0 0 0 1px var(--control-edge);
	}

	.text-field:focus {
		box-shadow: inset 0 0 0 1.5px var(--control-focus);
	}

	.invalid,
	.invalid:focus {
		box-shadow: inset 0 0 0 1.5px var(--danger);
	}

	.completion {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		padding-inline: 14px;
		font-size: 13px;
		white-space: pre;
		color: var(--text-muted);
		pointer-events: none;
	}

	.typed {
		color: transparent;
	}

	.error {
		padding-inline: 14px;
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--danger);
	}
</style>
