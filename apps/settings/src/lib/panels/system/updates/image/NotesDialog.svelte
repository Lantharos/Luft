<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { Release } from '../api';
	import { named } from '../headline';

	let { release, onclose }: { release: Release; onclose: () => void } = $props();
</script>

<Dialog title={named(release, 'settings-updates-notes-title', 'settings-updates-notes-title-new')} {onclose}>
	<p class="soft-scroll max-h-[360px] overflow-y-auto text-[14px] leading-relaxed whitespace-pre-line text-[var(--text-soft)]">{release.notes}</p>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-updates-done')}</button>
	{/snippet}
</Dialog>
