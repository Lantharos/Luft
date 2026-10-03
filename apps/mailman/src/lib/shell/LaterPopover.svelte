<script lang="ts">
	import { Popover } from '@luft/ui';
	import { SNOOZES } from '#lib/app/when.js';

	interface Props {
		anchor: HTMLElement;
		onpick: (at: number) => void;
		onclose: () => void;
	}

	let { anchor, onpick, onclose }: Props = $props();

	const time = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
</script>

<Popover {anchor} label="Later" role="menu" align="end" minWidth={240} {onclose}>
	{#each SNOOZES as moment (moment.id)}
		{@const at = moment.at()}
		<button
			type="button"
			role="menuitem"
			class="option"
			onclick={() => {
				onclose();
				onpick(at);
			}}
		>
			<span>{moment.label}</span>
			<span class="text-[12px] text-[var(--text-muted)]">{time.format(at * 1000)}</span>
		</button>
	{/each}
</Popover>

<style>
	.option {
		display: flex;
		min-height: 38px;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		border-radius: 12px;
		padding-inline: 10px;
		font-size: 13px;
		color: var(--text-soft);
	}

	.option:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
