<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { CHECK_TITLES } from '../../format';
	import type { CheckResult, Release } from '../../store';
	import { byConcern, CHECK_ICONS } from './checks';

	let { release, onclose, ondetail }: { release: Release; onclose: () => void; ondetail: (check: CheckResult) => void } = $props();
</script>

<Dialog title="Checks of {release.version}" wide {onclose}>
	<ul class="flex flex-col gap-3.5">
		{#each byConcern(release.checks) as check (check.name)}
			{@const Icon = CHECK_ICONS[check.status]}
			<li class="flex items-start gap-3">
				<Icon size={18} class="mt-0.5 flex-none text-[var(--text-soft)]" />
				<span class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="text-[14px] font-medium">{CHECK_TITLES[check.name]}</span>
					<span class="text-[12.5px] text-[var(--text-muted)]">{check.summary}</span>
				</span>
				{#if check.detail !== undefined}
					<button type="button" class="button" onclick={() => ondetail(check)}>Details</button>
				{/if}
			</li>
		{/each}
	</ul>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
