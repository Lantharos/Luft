<script lang="ts">
	import { tick } from 'svelte';

	interface Props {
		value: string;
		label: string;
		originalName?: string | null;
		placeholder?: string;
		mode?: 'create' | 'rename';
		itemType?: 'file' | 'folder';
		onInput: (value: string) => void;
		onConfirm: () => void;
		onCancel: () => void;
		class?: string;
		selectNameOnly?: boolean;
	}

	let {
		value,
		label,
		originalName = null,
		placeholder = '',
		mode = 'rename',
		itemType = 'folder',
		onInput,
		onConfirm,
		onCancel,
		class: className = '',
		selectNameOnly = false
	}: Props = $props();
	let input: HTMLInputElement | undefined = $state();
	let hasInteracted = $state(false);
	let justCommitted = false;

	function defaultNameFor(type: 'file' | 'folder') {
		return type === 'folder' ? 'New folder' : 'New file.txt';
	}

	function isUnchanged(currentValue: string) {
		const trimmed = currentValue.trim();
		if (!trimmed) return true;
		if (mode === 'rename') return trimmed === originalName;
		return trimmed === defaultNameFor(itemType);
	}

	function selectNamePortion(element: HTMLInputElement) {
		if (selectNameOnly && mode === 'rename') {
			const dotIndex = element.value.lastIndexOf('.');
			if (dotIndex > 0) {
				element.setSelectionRange(0, dotIndex);
				return;
			}
		}
		element.select();
	}

	async function focusAndSelect() {
		const element = input;
		if (!element) return;
		await tick();
		if (!input || input !== element) return;
		element.focus({ preventScroll: true });
		selectNamePortion(element);
		window.requestAnimationFrame(() => {
			if (!input || input !== element) return;
			input.focus({ preventScroll: true });
			selectNamePortion(input);
		});
	}

	$effect(() => {
		if (input) {
			void focusAndSelect();
		}
	});

	function handleInput(event: Event) {
		hasInteracted = true;
		const target = event.currentTarget as HTMLInputElement;
		onInput(target.value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();
			commit();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			onCancel();
		} else if (event.key === 'F2' || event.code === 'F2') {
			event.preventDefault();
			event.stopPropagation();
			commit();
		} else {
			hasInteracted = true;
		}
	}

	function handleFocus(event: FocusEvent) {
		const target = event.currentTarget as HTMLInputElement;
		if (hasInteracted) return;
		if (selectNameOnly) selectNamePortion(target);
	}

	function handleBlur() {
		if (justCommitted) return;
		onCancel();
	}

	function commit() {
		if (isUnchanged(value)) {
			onCancel();
			return;
		}
		justCommitted = true;
		onConfirm();
	}
</script>

<input
	bind:this={input}
	class={['inline-name-field', className]}
	value={value}
	placeholder={placeholder}
	aria-label={label}
	spellcheck="false"
	autocomplete="off"
	autocorrect="off"
	autocapitalize="off"
	oninput={handleInput}
	onkeydown={handleKeydown}
	onfocus={handleFocus}
	onblur={handleBlur}
	onclick={(event) => event.stopPropagation()}
	ondblclick={(event) => event.stopPropagation()}
	onmousedown={(event) => event.stopPropagation()}
	onpointerdown={(event) => event.stopPropagation()}
/>
