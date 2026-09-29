<script lang="ts">
	import { Checkbox } from '@luft/ui';

	interface Props {
		mode: number;
		folder: boolean;
		editable: boolean;
		onchange: (mode: number) => void;
	}

	let { mode, folder, editable, onchange }: Props = $props();

	const WHO = [
		{ label: 'Owner', shift: 6 },
		{ label: 'Group', shift: 3 },
		{ label: 'Everyone', shift: 0 }
	];

	let rights = $derived([
		{ label: 'Read', bit: 4 },
		{ label: 'Write', bit: 2 },
		{ label: folder ? 'Open' : 'Run', bit: 1 }
	]);

	function toggle(flag: number, enabled: boolean) {
		onchange(enabled ? mode | flag : mode & ~flag);
	}
</script>

<div class="grid grid-cols-[1fr_repeat(3,64px)] items-center gap-y-1 text-[13px]" role="group" aria-label="Permissions">
	<span></span>
	{#each rights as right (right.bit)}
		<span class="text-center text-[12px] text-[var(--text-muted)]">{right.label}</span>
	{/each}
	{#each WHO as who (who.shift)}
		<span class="text-[var(--text-soft)]">{who.label}</span>
		{#each rights as right (right.bit)}
			{@const flag = right.bit << who.shift}
			<span class="grid place-items-center">
				<Checkbox
					label={`${who.label} can ${right.label.toLowerCase()}`}
					checked={(mode & flag) !== 0}
					disabled={!editable}
					onchange={(checked) => toggle(flag, checked)}
				/>
			</span>
		{/each}
	{/each}
</div>
