<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented } from '@luft/ui';
	import type { QuickEdit } from './quick.svelte';

	let { quick }: { quick: QuickEdit } = $props();
</script>

<Segmented
	label={t('easel-hide-kind')}
	value={quick.hideKind}
	options={[
		{ value: 'blur', label: t('easel-hide-blur') },
		{ value: 'redact', label: t('easel-hide-redact') }
	]}
	onchange={(value) => (quick.hideKind = value)}
/>
<span class="text-[13px] text-(--text-muted)">{t('easel-hide-hint')}</span>
