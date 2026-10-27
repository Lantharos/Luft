<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { Release } from '#lib/bindings.js';
	import { named } from '../headline';

	let { release, onclose }: { release: Release; onclose: () => void } = $props();
</script>

<Dialog title={named(release, 'settings-updates-notes-title', 'settings-updates-notes-title-new')} {onclose}>
	<div class="soft-scroll flex max-h-[360px] flex-col gap-4 overflow-y-auto">
		{#each release.notes ?? [] as section (section.title)}
			<section class="flex flex-col gap-1.5">
				<h3 class="text-[13px] font-semibold text-[var(--text)]">{section.title}</h3>
				<ul class="flex flex-col gap-1 text-[14px] leading-relaxed text-[var(--text-soft)]">
					{#each section.changes as change, index (index)}
						<li>{change}</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-updates-done')}</button>
	{/snippet}
</Dialog>
