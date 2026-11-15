<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { checkTitle } from '../../format';
	import type { CheckResult, Release } from '../../store';
	import { byConcern, CHECK_ICONS } from './checks';

	let { release, onclose, ondetail }: { release: Release; onclose: () => void; ondetail: (check: CheckResult) => void } = $props();
</script>

<Dialog title={t('developer-checks-of', { version: release.version })} wide {onclose}>
	<ul class="flex flex-col gap-3.5">
		{#each byConcern(release.checks) as check (check.name)}
			{@const Icon = CHECK_ICONS[check.status]}
			<li class="flex items-start gap-3">
				<Icon size={18} class="mt-0.5 flex-none text-[var(--text-soft)]" />
				<span class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="text-[14px] font-medium">{checkTitle(check.name)}</span>
					<span class="text-[12.5px] text-[var(--text-muted)]">{check.summary}</span>
				</span>
				{#if check.detail !== undefined}
					<button type="button" class="button" onclick={() => ondetail(check)}>{t('developer-checks-details')}</button>
				{/if}
			</li>
		{/each}
	</ul>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('developer-done')}</button>
	{/snippet}
</Dialog>
