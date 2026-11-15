<script lang="ts">
	import { t } from '@luft/i18n';
	import { app } from '#lib/state/app.svelte.js';
	import Page from './Page.svelte';
</script>

<Page title="">
	<div class="flex flex-col items-start gap-5 pt-[14vh]">
		<h2 class="text-[26px] font-semibold">{t('keys-welcome')}</h2>
		<div class="flex gap-2">
			<button type="button" class="button primary" onclick={() => (app.creating = { kind: 'layout', from: null })}>{t('keys-welcome-layout')}</button>
			<button type="button" class="button" onclick={() => (app.creating = { kind: 'method' })}>{t('keys-welcome-method')}</button>
		</div>
	</div>
</Page>
