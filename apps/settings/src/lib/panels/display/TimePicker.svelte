<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';

	interface Props {
		value: number;
		label: string;
		twelveHour: boolean;
		onchange: (value: number) => void;
	}

	const GAP = 6;
	const POPOVER_HEIGHT = 260;
	const MINUTES_PER_DAY = 24 * 60;
	const NUDGE_MINUTES = 15;
	const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
	const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

	let { value, label, twelveHour, onchange }: Props = $props();

	let trigger = $state<HTMLButtonElement>();
	let open = $state(false);
	let position = $state({ left: 0, top: 0, above: false });

	let total = $derived(Math.round(value * 60) % MINUTES_PER_DAY);
	let hour = $derived(Math.floor(total / 60));
	let minute = $derived(total % 60);

	const pad = (number: number) => String(number).padStart(2, '0');
	const meridiem = (hour: number) => (hour < 12 ? 'AM' : 'PM');
	const hourLabel = (hour: number) => (twelveHour ? `${hour % 12 || 12} ${meridiem(hour)}` : pad(hour));
	const timeLabel = (hour: number, minute: number) => (twelveHour ? `${hour % 12 || 12}:${pad(minute)} ${meridiem(hour)}` : `${pad(hour)}:${pad(minute)}`);

	function set(minutes: number) {
		const wrapped = (minutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
		if (wrapped !== total) onchange(wrapped / 60);
	}

	function show() {
		const box = trigger!.getBoundingClientRect();
		const above = window.innerHeight - box.bottom < POPOVER_HEIGHT && box.top > window.innerHeight / 2;
		position = { left: box.left, top: above ? box.top - GAP : box.bottom + GAP, above };
		open = true;
	}

	function keydown(event: KeyboardEvent) {
		const nudge = { ArrowUp: NUDGE_MINUTES, ArrowDown: -NUDGE_MINUTES }[event.key];
		if (event.key === 'Escape' && open) {
			open = false;
		} else if (nudge !== undefined) {
			set(total + nudge);
		} else {
			return;
		}
		event.preventDefault();
	}

	function centerSelected(column: HTMLElement) {
		column.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'center' });
	}
</script>

<svelte:window onblur={() => (open = false)} onresize={() => (open = false)} />

<button
	bind:this={trigger}
	type="button"
	class="trigger"
	class:open
	aria-haspopup="dialog"
	aria-expanded={open}
	aria-label="{label}, {timeLabel(hour, minute)}"
	onclick={() => (open ? (open = false) : show())}
	onkeydown={keydown}
>
	<span class="tabular-nums">{timeLabel(hour, minute)}</span>
	<Clock size={15} class="text-[var(--text-muted)]" />
</button>

{#if open}
	<div class="backdrop" role="presentation" onpointerdown={() => (open = false)}></div>
	<div class="popover" class:above={position.above} role="dialog" aria-label={label} style:left="{position.left}px" style:top="{position.top}px">
		<div class="column soft-scroll" role="listbox" aria-label="Hour" {@attach centerSelected}>
			{#each HOURS as option (option)}
				<button type="button" role="option" aria-selected={option === hour} onclick={() => set(option * 60 + minute)}>
					{hourLabel(option)}
				</button>
			{/each}
		</div>
		<div class="column soft-scroll" role="listbox" aria-label="Minute" {@attach centerSelected}>
			{#each MINUTES as option (option)}
				<button type="button" role="option" aria-selected={option === minute} onclick={() => set(hour * 60 + option)}>
					{pad(option)}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.trigger {
		display: inline-flex;
		height: 36px;
		min-width: 110px;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding-inline: 14px 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text);
		transition: background-color 160ms var(--ease);
	}

	.trigger:hover,
	.trigger.open {
		background: var(--control-hover);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
	}

	.popover {
		position: fixed;
		z-index: 41;
		display: flex;
		gap: 4px;
		height: 260px;
		padding: 6px;
		border-radius: 18px;
		background: var(--popover);
		box-shadow: 0 12px 40px var(--shadow-soft);
		animation: open 160ms var(--ease);
	}

	.popover.above {
		transform: translateY(-100%);
		animation-name: open-above;
	}

	.column {
		display: flex;
		width: 76px;
		flex-direction: column;
		gap: 2px;
		overflow-y: auto;
	}

	.column button {
		flex: none;
		min-height: 32px;
		border-radius: 12px;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		color: var(--text-soft);
		transition: background-color 120ms var(--ease);
	}

	.column button:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.column button[aria-selected='true'] {
		background: var(--accent);
		color: var(--accent-text);
	}

	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}

	@keyframes open-above {
		from {
			opacity: 0;
			transform: translateY(calc(-100% + 4px));
		}
	}
</style>
