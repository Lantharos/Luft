<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Spinner, TextField } from '@luft/ui';
	import { install } from '#lib/state/install.svelte.js';

	interface Props {
		onskip: () => void;
	}

	let { onskip }: Props = $props();

	const LENGTH = 12;

	let field = $state<TextField>();
	let typed = $state('');
	let opening = $state(false);
	let problem = $state('');

	let characters = $derived(typed.replace(/[^0-9a-z]/gi, '').toUpperCase().slice(0, LENGTH));

	$effect(() => {
		typed = characters.match(/.{1,4}/g)?.join('-') ?? '';
	});

	$effect(() => field?.focus());

	async function open() {
		if (characters.length < LENGTH || opening) return;
		opening = true;
		problem = '';
		try {
			await install.openBox(typed);
		} catch (error) {
			problem = String(error);
		} finally {
			opening = false;
		}
	}
</script>

<Dialog title={t('setup-box-title')} description={t('setup-box-description')} onclose={() => {}}>
	<TextField
		bind:this={field}
		bind:value={typed}
		label={t('setup-box-code')}
		placeholder="XXXX-XXXX-XXXX"
		error={problem}
		live
		disabled={opening}
		onkeydown={(event) => event.key === 'Enter' && void open()}
	/>
	{#snippet actions()}
		<button type="button" class="button" disabled={opening} onclick={onskip}>{t('setup-box-skip')}</button>
		<button type="button" class="button primary" disabled={characters.length < LENGTH || opening} onclick={open}>{#if opening}<Spinner />{/if}{t('setup-box-open')}</button>
	{/snippet}
</Dialog>
