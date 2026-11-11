<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { Need } from '#lib/bindings.js';
	import { opening, type Failed } from '#lib/state/opening.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { failed }: { failed: Failed } = $props();

	const WHAT: Record<Need, string> = {
		library: 'the library',
		program: 'the program',
		perlModule: 'the Perl module',
		pythonModule: 'the Python module',
		typelib: 'the GObject bindings of'
	};

	const failure = $derived(failed.failure);
	const missing = $derived(failure?.missing ?? null);
	const needed = $derived(missing ? `${WHAT[missing.kind]} ${missing.name}` : null);
	const description = $derived.by(() => {
		if (!failure) return failed.error ?? undefined;
		if (needed && failure.package) return `It needs ${needed}, which isn't on this computer. The ${failure.package} package has it.`;
		if (needed) return `It needs ${needed}, which isn't on this computer, and none of the packages Luft can add has it.`;
		return failure.crashed ? 'It crashed right after it started.' : 'It closed right after it started.';
	});

	function add(name: string) {
		void operations.run(failed.app.key, failed.app.name, { kind: 'installSystemPackages', packages: [name] });
		opening.dismiss();
	}
</script>

<Dialog title="{failed.app.name} didn't start" {description} onclose={() => opening.dismiss()}>
	{#if failure && !failure.package && failure.output.length}
		<div class="flex flex-col gap-2">
			<span class="text-[13px] text-[var(--text-muted)]">The last it wrote before closing:</span>
			<pre class="output">{failure.output.join('\n')}</pre>
		</div>
	{/if}
	{#snippet actions()}
		{#if failure?.package}
			{@const name = failure.package}
			<button type="button" class="button" onclick={() => opening.dismiss()}>Cancel</button>
			<button type="button" class="button primary" onclick={() => add(name)}>Add {name}</button>
		{:else}
			<button type="button" class="button primary" onclick={() => opening.dismiss()}>Close</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.output {
		max-height: 220px;
		overflow: auto;
		border-radius: var(--radius-group);
		background: var(--control);
		padding: 10px 12px;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.5;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: var(--text-soft);
	}
</style>
