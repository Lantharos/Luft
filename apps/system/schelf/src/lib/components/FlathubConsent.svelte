<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Access } from '#lib/app/permissions.js';
	import ConsentDialog from './ConsentDialog.svelte';

	let { name, access, onconfirm, onclose }: { name: string; access: Access[]; onconfirm: () => void; onclose: () => void } = $props();
</script>

<ConsentDialog
	title={t('consent-flathub-title', { name })}
	description={t('consent-flathub-description', { name })}
	{access}
	confirm={t('consent-install')}
	{onconfirm}
	{onclose}
/>
