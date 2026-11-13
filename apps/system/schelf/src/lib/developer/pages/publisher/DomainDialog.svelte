<script lang="ts">
	import { Dialog, TextField } from '@luft/ui';

	const DOMAIN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.){2,}[a-z]{2,63}$/;

	let { onclose, onchoose }: { onclose: () => void; onchoose: (domain: string) => void } = $props();

	let name = $state('');
	let field = $state<ReturnType<typeof TextField>>();
	const domain = $derived(name.trim().toLowerCase());
	const valid = $derived(DOMAIN.test(domain));

	$effect(() => {
		const frame = requestAnimationFrame(() => field?.focus());
		return () => cancelAnimationFrame(frame);
	});
</script>

<Dialog title="Use your own domain" description="One under a domain you own, like get.example.com." {onclose}>
	<TextField bind:this={field} bind:value={name} label="Domain" placeholder="get.example.com" onkeydown={(event) => event.key === 'Enter' && valid && onchoose(domain)} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid} onclick={() => onchoose(domain)}>Continue</button>
	{/snippet}
</Dialog>
