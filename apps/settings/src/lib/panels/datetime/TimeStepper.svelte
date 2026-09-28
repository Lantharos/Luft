<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';

	interface Props {
		value: number;
		min: number;
		max: number;
		label: string;
		onchange: (value: number) => void;
	}

	const WHEEL_STEP = 50;

	let { value, min, max, label, onchange }: Props = $props();

	let typed = $state('');
	let wheel = 0;

	function step(delta: number) {
		const range = max - min + 1;
		onchange(((((value - min + delta) % range) + range) % range) + min);
	}

	function type(key: string) {
		const combined = Number(typed + key);
		if (typed && combined >= min && combined <= max) {
			onchange(combined);
			typed = '';
			return;
		}
		const digit = Number(key);
		if (digit >= min && digit <= max) onchange(digit);
		typed = digit * 10 > max ? '' : key;
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') step(1);
		else if (event.key === 'ArrowDown') step(-1);
		else if (/^\d$/.test(event.key)) type(event.key);
		else return;
		event.preventDefault();
	}

	function scroll(event: WheelEvent) {
		wheel += event.deltaY;
		while (Math.abs(wheel) >= WHEEL_STEP) {
			step(wheel < 0 ? 1 : -1);
			wheel -= Math.sign(wheel) * WHEEL_STEP;
		}
	}
</script>

<div class="stepper">
	<button type="button" class="arrow" tabindex="-1" aria-label="Increase {label}" onclick={() => step(1)}>
		<ChevronUp size={18} />
	</button>
	<div
		class="value"
		role="spinbutton"
		tabindex="0"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		onkeydown={keydown}
		onwheel={scroll}
		onblur={() => (typed = '')}
	>
		{String(value).padStart(2, '0')}
	</div>
	<button type="button" class="arrow" tabindex="-1" aria-label="Decrease {label}" onclick={() => step(-1)}>
		<ChevronDown size={18} />
	</button>
</div>

<style>
	.stepper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.arrow {
		display: grid;
		height: 26px;
		width: 64px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition: background-color 160ms var(--ease), color 160ms var(--ease);
	}

	.arrow:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.value {
		display: grid;
		height: 56px;
		width: 64px;
		place-items: center;
		border-radius: 16px;
		background: var(--control);
		font-size: 26px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		outline: none;
		transition: background-color 160ms var(--ease), box-shadow 160ms var(--ease);
	}

	.value:hover {
		background: var(--control-hover);
	}

	.value:focus-visible {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}
</style>
