<script lang="ts">
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
		input.focus({ preventScroll: true });
		const dot = input.value.lastIndexOf('.');
		if (selectStem && dot > 0) input.setSelectionRange(0, dot);
		else input.select();
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
