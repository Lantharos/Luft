<script lang="ts">
	import { t } from '@luft/i18n';
	import { EmptyState } from '@luft/ui';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let heading = $derived.by(() => {
		if (!flatbed.scanner) return t('welcome-camera');
		return flatbed.feed === 'glass' ? t('welcome-glass') : t('welcome-feeder');
	});
</script>

<EmptyState title={heading} message={t('welcome-drop')} />
