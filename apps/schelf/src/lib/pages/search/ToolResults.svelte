<script lang="ts">
	import type { ToolSummary } from '#lib/bridge/types.js';
	import AppArt from '#lib/components/AppArt.svelte';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import { backend } from '#lib/state/backend.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { query, found = $bindable(null) }: { query: string; found?: number | null } = $props();

	let tools = $state<ToolSummary[] | null>(null);
	let error = $state<string | null>(null);

	$effect(() => {
		const current = query;
		tools = null;
		error = null;
		backend()
			.searchTools(current)
			.then((result) => {
				if (current === query) tools = result;
			})
			.catch((reason) => {
				if (current === query) error = String(reason);
			});
	});

	$effect(() => {
		found = error ? null : (tools?.length ?? null);
	});

	const key = (tool: ToolSummary) => `tool/${tool.package}`;

	function install(tool: ToolSummary) {
		const operation = operations.forKey(key(tool));
		if (operation?.state === 'failed') void operations.cancel(operation.id);
		void operations.run(key(tool), tool.package, { kind: 'installTool', package: tool.package });
	}

	function open(tool: ToolSummary) {
		const installed = library.tool(tool.package);
		if (installed) navigation.push({ page: 'app', target: { installed: installed.key }, name: installed.name });
	}
</script>

{#if error}
	<p class="px-1.5 text-[14px] text-[var(--text-muted)]">Command-line tools can't be searched right now. {error}</p>
{:else if tools === null || tools.length}
	<section class="flex flex-col gap-2">
		<div class="flex flex-col gap-0.5 px-1.5">
			<h2 class="text-[17px] font-semibold">Command-line tools</h2>
			<p class="text-[13px] text-[var(--text-muted)]">They install into your tools container, and you run them in Tern.</p>
		</div>
		{#if tools === null}
			<div class="flex flex-col gap-1" aria-busy="true">
				{#each { length: 3 } as _, index (index)}
					<div class="skeleton h-[60px] w-full"></div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col gap-0.5">
				{#each tools as tool (tool.package)}
					{@const operation = operations.forKey(key(tool))}
					{@const installed = library.tool(tool.package)}
					<div class="row">
						<button type="button" class="main" disabled={!installed} onclick={() => open(tool)}>
							<AppArt icon={null} source="tool" size={40} />
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate text-[14px] font-medium text-[var(--text)]">{tool.package}</span>
								<span class="truncate text-[12.5px]" class:failed={operation?.state === 'failed'}>{operation?.state === 'failed' ? operation.error : tool.summary}</span>
							</span>
						</button>
						{#if operation && operation.state !== 'failed'}
							<ProgressButton {operation} />
						{:else if installed}
							<span class="px-3 text-[13px] text-[var(--text-muted)]">Installed</span>
						{:else}
							<button type="button" class="button" onclick={() => install(tool)}>Install</button>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.row {
		display: flex;
		min-height: 60px;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-group);
		padding-right: 12px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.row:has(.main:not(:disabled):hover) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		min-width: 0;
		flex: 1;
		align-items: center;
		gap: 14px;
		align-self: stretch;
		padding-left: 14px;
		text-align: left;
		color: var(--text-muted);
	}

	.main:disabled {
		cursor: default;
	}

	.failed {
		color: var(--danger);
	}
</style>
