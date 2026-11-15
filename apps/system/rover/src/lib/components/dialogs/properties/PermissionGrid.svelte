<script lang="ts">
	import { t } from '@luft/i18n';
	import { Checkbox } from '@luft/ui';

	interface Props {
		mode: number;
		folder: boolean;
		editable: boolean;
		onchange: (mode: number) => void;
	}

	let { mode, folder, editable, onchange }: Props = $props();

	let who = $derived([
		{ name: 'owner', label: t('rover-permissions-owner'), shift: 6 },
		{ name: 'group', label: t('rover-permissions-group'), shift: 3 },
		{ name: 'everyone', label: t('rover-permissions-everyone'), shift: 0 }
	]);

	let rights = $derived([
		{ name: 'read', label: t('rover-permissions-read'), bit: 4 },
		{ name: 'write', label: t('rover-permissions-write'), bit: 2 },
		folder ? { name: 'open', label: t('rover-permissions-open'), bit: 1 } : { name: 'run', label: t('rover-permissions-run'), bit: 1 }
	]);

	function toggle(flag: number, enabled: boolean) {
		onchange(enabled ? mode | flag : mode & ~flag);
	}
</script>

<div class="grid grid-cols-[1fr_repeat(3,64px)] items-center gap-y-1 text-[13px]" role="group" aria-label={t('rover-properties-permissions')}>
	<span></span>
	{#each rights as right (right.bit)}
		<span class="text-center text-[12px] text-[var(--text-muted)]">{right.label}</span>
	{/each}
	{#each who as person (person.shift)}
		<span class="text-[var(--text-soft)]">{person.label}</span>
		{#each rights as right (right.bit)}
			{@const flag = right.bit << person.shift}
			<span class="grid place-items-center">
				<Checkbox
					label={t('rover-permissions-can', { who: person.name, right: right.name })}

					checked={(mode & flag) !== 0}
					disabled={!editable}
					onchange={(checked) => toggle(flag, checked)}
				/>
			</span>
		{/each}
	{/each}
</div>
