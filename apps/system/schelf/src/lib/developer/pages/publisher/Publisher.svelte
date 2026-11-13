<script lang="ts">
	import type { PublisherPage } from '../../pages';
	import { developer } from '../../state/developer.svelte';
	import Domain from './Domain.svelte';
	import Members from './Members.svelte';
	import Tools from './Tools.svelte';
	import Verification from './Verification.svelte';

	let { section }: { section: PublisherPage } = $props();

	const publisher = $derived(developer.publisher);
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-8 pt-2 pb-10">
		{#if publisher}
			{#key publisher.id}
				{#if section === 'members'}
					<Members {publisher} />
				{:else if section === 'verification'}
					<Verification {publisher} />
				{:else if section === 'domain'}
					<Domain {publisher} />
				{:else}
					<Tools {publisher} />
				{/if}
			{/key}
		{/if}
	</div>
</div>
