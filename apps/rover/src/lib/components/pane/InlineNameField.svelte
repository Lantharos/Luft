<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		value: string;
		label: string;
		unchangedValue: string;
		placeholder?: string;
		selectStem?: boolean;
		class?: string;
		onInput: (value: string) => void;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { value, label, unchangedValue, placeholder = '', selectStem = false, class: className = '', onInput, onConfirm, onCancel }: Props =
		$props();

	let committing = false;

	function focusName(input: HTMLInputElement) {
		untrack(() => {
			input.focus({ preventScroll: true });
			const dot = input.value.lastIndexOf('.');
			if (selectStem && dot > 0) input.setSelectionRange(0, dot);
			else input.select();
		});
	}

	function commit() {
		const trimmed = value.trim();
		if (!trimmed || trimmed === unchangedValue) return onCancel();
		committing = true;
		onConfirm();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== 'Escape' && event.key !== 'F2') return;
		event.preventDefault();
		event.stopPropagation();
		if (event.key === 'Escape') onCancel();
		else commit();
	}

	function handleBlur() {
		if (!committing) onCancel();
	}

	const stop = (event: Event) => event.stopPropagation();
</script>

<input
	{@attach focusName}
	class={['inline-name-field', className]}
	{value}
	{placeholder}
	aria-label={label}
	spellcheck="false"
	autocomplete="off"
	autocapitalize="off"
	oninput={(event) => onInput(event.currentTarget.value)}
	onkeydown={handleKeydown}
	onblur={handleBlur}
	onclick={stop}
	ondblclick={stop}
	onmousedown={stop}
	onpointerdown={stop}
/>

<style>
	.inline-name-field {
		min-width: 0;
		flex: 1;
		border-radius: 6px;
		background: var(--content);
		padding: 2px 6px;
		margin-inline: -6px;
		color: var(--text);
		font-size: inherit;
		caret-color: var(--accent);
		outline: none;
		box-shadow: inset 0 0 0 1.5px var(--accent-line);
	}

	.inline-name-field--grid {
		width: 100%;
		flex: none;
		margin-inline: 0;
		text-align: center;
		font-size: 12.5px;
		line-height: 16px;
	}
</style>
