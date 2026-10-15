<script lang="ts">
	import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
	import { Row } from '@luft/ui';
	import { keepOtherKeys, problem, removeOtherKeys, restart, type AntiCheat, type SigningKey } from '../api';
	import KeyStepsDialog from './KeyStepsDialog.svelte';

	let { antiCheat, key }: { antiCheat: AntiCheat; key: SigningKey } = $props();

	let code = $state<string | null>(null);
	let busy = $state(false);
	let error = $state('');

	let missing = $derived(antiCheat.requirements.find((requirement) => !requirement.met)?.missing);

	let description = $derived.by(() => {
		if (key.removingOtherKeys) return 'Remove the other keys on the blue screen when you restart';
		if (missing) return missing;
		return antiCheat.usesLuftKey ? 'Epic still has to add Luft’s key to its list' : 'Games can check how this computer started';
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
	title={missing ? 'Games with anti-cheat' : 'Ready for games with anti-cheat'}
	{description}
	icon={Gamepad2}
	below={error ? failure : undefined}
>
	{#if key.removingOtherKeys}
		<button type="button" class="button" disabled={busy} onclick={() => attempt(keepOtherKeys)}>Cancel</button>
		<button type="button" class="button" disabled={busy} onclick={() => attempt(restart)}>Restart</button>
	{:else if key.otherKeys.length}
		<button type="button" class="button" disabled={busy} title={key.otherKeys.join(', ')} onclick={remove}>Remove</button>
	{/if}
</Row>

{#if code}
	<KeyStepsDialog {code} removing onclose={() => (code = null)} />
{/if}
