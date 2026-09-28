<script lang="ts">
	interface Props {
		checked: boolean;
		label: string;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	}

	let { checked, label, disabled = false, onchange }: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	class="switch"
	class:on={checked}
	onclick={() => onchange(!checked)}
>
	<span class="knob"></span>
</button>

<style>
	.switch {
		position: relative;
		flex: none;
		height: 26px;
		width: 44px;
		border-radius: var(--radius-pill);
		background: var(--control);
		transition: background-color 200ms var(--ease), opacity 200ms var(--ease);
	}

	.switch:hover:not(:disabled) {
		background: var(--control-hover);
	}

	.switch.on,
	.switch.on:hover:not(:disabled) {
		background: var(--accent);
	}

	.switch:disabled {
		opacity: 0.4;
	}

	.knob {
		position: absolute;
		top: 3px;
		left: 3px;
		height: 20px;
		width: 20px;
		border-radius: var(--radius-pill);
		background: var(--text);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: transform 220ms var(--ease), background-color 200ms var(--ease);
	}

	.on .knob {
		transform: translateX(18px);
		background: var(--accent-text);
	}

	.switch:active:not(:disabled) .knob {
		width: 23px;
	}

	.on:active:not(:disabled) .knob {
		transform: translateX(15px);
	}
</style>
