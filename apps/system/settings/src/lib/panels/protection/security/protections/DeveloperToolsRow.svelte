<script lang="ts">
	import Wrench from '@lucide/svelte/icons/wrench';
	import { t } from '@luft/i18n';
	import { ConfirmDialog, errorText, Row, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';

	const WAIT_FOR_PERMISSION = { timeoutMs: 300_000 };

	let on = $state<boolean | null>(null);
	let confirming = $state(false);
	let busy = $state(false);
	let error = $state('');

	async function change(next: boolean) {
		busy = true;
		error = '';
		try {
			await commands.developerToolsSet({ on: next }, WAIT_FOR_PERMISSION);
			on = next;
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}

	function toggle(next: boolean) {
		if (next) confirming = true;
		else void change(false);
	}

	void commands.developerTools().then((current) => (on = current));
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if on !== null}
	<Row title={t('settings-developer-tools')} description={t('settings-developer-tools-description')} icon={Wrench} below={error ? failure : undefined}>
		<Switch label={t('settings-developer-tools')} checked={on} disabled={busy} onchange={toggle} />
	</Row>
{/if}

{#if confirming}
	<ConfirmDialog
		title={t('settings-developer-tools-title')}
		description={t('settings-developer-tools-warning')}
		action={t('settings-protection-turn-on')}
		danger
		run={() => change(true)}
		onclose={() => (confirming = false)}
	/>
{/if}
