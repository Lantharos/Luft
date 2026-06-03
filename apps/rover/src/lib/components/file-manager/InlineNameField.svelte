<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		value: string;
		label: string;
		onInput: (value: string) => void;
		onConfirm: () => void;
		onCancel: () => void;
		class?: string;
	}

	let { value, label, onInput, onConfirm, onCancel, class: className = '' }: Props = $props();
	let input: HTMLInputElement;

	onMount(() => {
		input.focus();
		input.select();
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			onConfirm();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			onCancel();
		}
	}
</script>

<input
	bind:this={input}
	class={['inline-name-field', className]}
	value={value}
	aria-label={label}
	spellcheck="false"
	oninput={(event) => onInput(event.currentTarget.value)}
	onkeydown={handleKeydown}
	onblur={onConfirm}
	onclick={(event) => event.stopPropagation()}
	onmousedown={(event) => event.stopPropagation()}
/>
