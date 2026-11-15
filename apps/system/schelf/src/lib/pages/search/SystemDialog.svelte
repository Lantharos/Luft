<script lang="ts">
	import { t } from '@luft/i18n';
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';

	let { name, onclose, oninstall }: { name: string; onclose: () => void; oninstall: () => void } = $props();

	function install() {
		oninstall();
		onclose();
	}
</script>

<ConsentDialog
	title={t('search-system-title', { name })}
	description={t('search-system-dialog', { name })}
	facts={[t('search-system-everyone'), t('search-system-starts'), t('search-system-updates')]}
	confirm={t('search-install')}
	onconfirm={install}
	{onclose}
/>
