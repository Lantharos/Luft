<script lang="ts">
	interface Props {
		title: string;
		value: string;
		confirmLabel: string;
		onInput: (value: string) => void;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { title, value, confirmLabel, onInput, onConfirm, onCancel }: Props = $props();
</script>

<div class="fixed inset-0 z-[90] grid place-items-center px-6">
	<button
		class="absolute inset-0 bg-black/45 backdrop-blur-[18px]"
		type="button"
		aria-label="Close dialog"
		onclick={onCancel}
	></button>
	<div
		class="relative z-10 w-full max-w-[380px] rounded-[20px] bg-[var(--surface)] p-5 shadow-[0_24px_80px_var(--shadow-soft),inset_0_1px_0_var(--hairline)]"
		role="dialog"
		aria-modal="true"
		aria-label={title}
	>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				onConfirm();
			}}
		>
			<h2 class="text-[18px] font-medium text-[var(--text)] text-balance">{title}</h2>
			<input
				class="mt-4 h-11 w-full rounded-full bg-[var(--control)] px-4 text-[14px] text-[var(--text)] outline-none shadow-[inset_0_1px_0_var(--hairline)] placeholder:text-[var(--text-muted)] focus:shadow-[inset_0_0_0_2px_var(--accent)]"
				value={value}
				oninput={(event) => onInput(event.currentTarget.value)}
			/>
			<div class="mt-5 flex justify-end gap-2">
				<button class="tool-button px-4" type="button" onclick={onCancel}>Cancel</button>
				<button class="command-button px-4" type="submit">{confirmLabel}</button>
			</div>
		</form>
	</div>
</div>
