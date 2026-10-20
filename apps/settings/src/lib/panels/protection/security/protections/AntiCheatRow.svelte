<script lang="ts">
	import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
	import { t } from '@luft/i18n';
	import { Row, tooltip } from '@luft/ui';
	import { keepOtherKeys, problem, removeOtherKeys, restart, type AntiCheat, type SigningKey } from '../api';
	import KeyStepsDialog from './KeyStepsDialog.svelte';

	let { antiCheat, key }: { antiCheat: AntiCheat; key: SigningKey } = $props();

	let code = $state<string | null>(null);
	let busy = $state(false);
	let error = $state('');

	let missing = $derived(antiCheat.requirements.find((requirement) => !requirement.met)?.missing);

	let description = $derived.by(() => {
		if (key.removingOtherKeys) return t('settings-security-anti-cheat-removing');
		if (missing) return missing;
		return antiCheat.usesLuftKey ? t('settings-security-anti-cheat-luft-key') : t('settings-security-anti-cheat-ready-description');
	});

	async function attempt(action: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}

	const remove = () => attempt(async () => (code = await removeOtherKeys()));
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

<Row
	title={missing ? t('settings-security-anti-cheat') : t('settings-security-anti-cheat-ready')}
	{description}
	icon={Gamepad2}
	below={error ? failure : undefined}
>
	{#if key.removingOtherKeys}
		<button type="button" class="button" disabled={busy} onclick={() => attempt(keepOtherKeys)}>{t('settings-protection-cancel')}</button>
		<button type="button" class="button" disabled={busy} onclick={() => attempt(restart)}>{t('settings-protection-restart')}</button>
	{:else if key.otherKeys.length}
		<button type="button" class="button" disabled={busy} {@attach tooltip(key.otherKeys.join(', '))} onclick={remove}>{t('settings-protection-remove')}</button>
	{/if}
</Row>

{#if code}
	<KeyStepsDialog {code} removing onclose={() => (code = null)} />
{/if}
