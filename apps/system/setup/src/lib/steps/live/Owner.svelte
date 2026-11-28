<script lang="ts">
	import Gift from '@luft/symbols/icons/gift';
	import User from '@luft/symbols/icons/user';
	import { t } from '@luft/i18n';
	import { Choice } from '@luft/ui';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';

	function choose(forSomeoneElse: boolean) {
		install.forSomeoneElse = forSomeoneElse;
		flow.restore(['protect', 'account']);
		flow.next();
	}
</script>

<StepFrame title={t('setup-owner-title')}>
	<div class="-mx-2 flex flex-col gap-1">
		<Choice icon={User} title={t('setup-owner-me')} description={t('setup-owner-me-description')} onclick={() => choose(false)} />
		<Choice icon={Gift} title={t('setup-owner-someone-else')} description={t('setup-owner-someone-else-description')} onclick={() => choose(true)} />
	</div>
</StepFrame>
