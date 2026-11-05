<script lang="ts" module>
	export const COLLAPSED = 5;
</script>

<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';

	let { hidden, expanded = $bindable() }: { hidden: number; expanded: boolean } = $props();
</script>

<Row title={expanded ? t('settings-more-fewer') : t('settings-more-show', { count: hidden })} {expanded} onclick={() => (expanded = !expanded)} />
