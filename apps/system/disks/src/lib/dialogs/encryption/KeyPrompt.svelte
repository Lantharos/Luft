<script lang="ts">
	import { t } from '@luft/i18n';
	import { tick } from 'svelte';
	import { PasswordField } from '@luft/ui';
	import type { KeyRequest } from '#lib/encryption.svelte.js';

	interface Props {
		request: KeyRequest;
		onsubmit: () => void;
	}

	let { request, onsubmit }: Props = $props();

	let field = $state<{ focus: () => void }>();

	$effect(() => {
		void tick().then(() => field?.focus());
	});
</script>

<PasswordField
	bind:this={field}
	label={t('disks-encryption-key-prompt')}
	bind:value={request.key}
	error={request.error}
	live
	autocomplete="off"
	onkeydown={(event) => event.key === 'Enter' && request.key && onsubmit()}
/>
