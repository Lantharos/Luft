<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { account } from '#lib/state/account.svelte.js';
	import { channelName } from './channels.js';

	const notices = $derived(account.notices);
	const [first] = $derived(notices.lost);

	const title = $derived.by(() => {
		if (!first) return 'Your schelf.store sign-in ended';
		if (notices.lost.length > 1) return 'You no longer have access to some apps';
		return `You no longer have access to the ${channelName(first.channel)} version of ${first.name}`;
	});
	const description = $derived(first ? 'What you installed stays and gets the public versions from now on.' : 'Sign in again to keep getting what you were invited to.');

	async function signIn() {
		await account.dismiss();
		account.show();
	}
</script>

<Dialog {title} {description} onclose={() => account.dismiss()}>
	{#snippet actions()}
		{#if first}
			<button type="button" class="button primary" onclick={() => account.dismiss()}>OK</button>
		{:else}
			<button type="button" class="button" onclick={() => account.dismiss()}>Not now</button>
			<button type="button" class="button primary" onclick={signIn}>Sign in</button>
		{/if}
	{/snippet}
</Dialog>
