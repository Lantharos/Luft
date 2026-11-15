<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { tasks, type Target } from './actions.svelte';

	interface Props {
		target: Target;
	}

	let { target }: Props = $props();
</script>

<Dialog
	title={t('barometer-stuck-title', { name: target.title })}
	description={t('barometer-stuck-description')}
	onclose={() => (tasks.stuck = null)}
>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => (tasks.stuck = null)}>{t('barometer-stuck-wait')}</button>
		<button type="button" class="button danger" onclick={() => tasks.kill(target)}>{t('barometer-force-quit')}</button>
	{/snippet}
</Dialog>
