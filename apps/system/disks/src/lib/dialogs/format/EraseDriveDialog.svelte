<script lang="ts">
	import { Dialog, Spinner } from '@luft/ui';
	import TypedName from './TypedName.svelte';

	interface Props {
		name: string;
		title: string;
		description: string;
		action: string;
		run: () => Promise<boolean>;
		onclose: () => void;
	}

	let { name, title, description, action, run, onclose }: Props = $props();

	let matches = $state(false);
	let working = $state(false);

	async function confirm() {
		working = true;
		const done = await run();
		working = false;
		if (done) onclose();
	}
</script>

<Dialog {title} {description} onclose={() => !working && onclose()}>
	<TypedName {name} bind:matches />
	{#snippet actions()}
		<button type="button" class="button" disabled={working} onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" disabled={!matches || working} onclick={confirm}>{#if working}<Spinner />{/if}{action}</button>
	{/snippet}
</Dialog>
