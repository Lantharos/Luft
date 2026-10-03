<script lang="ts">
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

<p class="px-1 text-[13px] leading-relaxed text-[var(--text-soft)]">This computer doesn’t have a key for it. Enter its passphrase or recovery key.</p>
<PasswordField
	bind:this={field}
	label="Passphrase or recovery key"
	bind:value={request.key}
	error={request.error}
	live
	autocomplete="off"
	onkeydown={(event) => event.key === 'Enter' && request.key && onsubmit()}
/>
