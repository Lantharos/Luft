<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import VcsBadge from '$lib/components/file-manager/VcsBadge.svelte';
	import {
		primaryActionLabel,
		projectTypeLabel,
		projectSummary,
		statusLabel,
		workspaceLabel
	} from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		vcs: VcsState;
	}

	let { vcs }: Props = $props();

	let modifiedCount = $derived.by(() =>
		Math.max(
			0,
			(vcs.project?.changedCount ?? 0) -
				(vcs.project?.addedCount ?? 0) -
				(vcs.project?.deletedCount ?? 0) -
				(vcs.project?.conflictedCount ?? 0)
		)
	);
</script>

{#if vcs.panelOpen && vcs.project}
	<aside
		class="flex h-full w-[400px] min-w-[340px] max-w-[42vw] shrink-0 flex-col bg-[var(--surface)] text-[var(--text)] shadow-[inset_1px_0_0_var(--hairline),inset_0_1px_0_var(--hairline)]"
		aria-label="Version Control"
	>
		<header class="flex h-12 shrink-0 items-center justify-between gap-3 px-4 shadow-[inset_0_-1px_0_var(--hairline)]">
			<div class="min-w-0">
				<div class="text-[14px] font-medium">Changes</div>
				<div class="truncate text-[12px] text-[var(--text-muted)]">{projectSummary(vcs.project)}</div>
			</div>
			<button
				class="tool-button h-8 min-h-8 w-8 min-w-8"
				type="button"
				aria-label="Collapse version control"
				onclick={() => (vcs.panelOpen = false)}
			>
				<Icon name="chevron-right" size={16} />
			</button>
		</header>

		<div class="grid gap-3 px-4 py-4 shadow-[inset_0_-1px_0_var(--hairline)]">
			<div class="grid gap-1">
				<div class="text-[14px] font-medium">{projectTypeLabel(vcs.project)}</div>
				{#if vcs.project.branchOrWorkspace}
					<div class="text-[12px] text-[var(--text-muted)]">
						{workspaceLabel(vcs.project)}: {vcs.project.branchOrWorkspace}
					</div>
				{/if}
				<div class="text-[12px] text-[var(--text-muted)]">
					{vcs.project.changedCount} changed {vcs.project.changedCount === 1 ? 'file' : 'files'}
					{#if vcs.project.addedCount || modifiedCount || vcs.project.deletedCount}
						· {vcs.project.addedCount} added · {modifiedCount} modified · {vcs.project.deletedCount} deleted
					{/if}
				</div>
				{#if vcs.project.kind === 'git' && (vcs.project.ahead || vcs.project.behind)}
					<div class="text-[12px] text-[var(--text-muted)]">
						{#if vcs.project.ahead}Ahead {vcs.project.ahead}{/if}
						{#if vcs.project.ahead && vcs.project.behind} · {/if}
						{#if vcs.project.behind}Behind {vcs.project.behind}{/if}
					</div>
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<button
					class="command-button"
					type="button"
					disabled={vcs.project.changedCount === 0 || Boolean(vcs.busy)}
					onclick={() => vcs.openSaveDialog()}
				>
					<Icon name="check" size={16} />
					<span>{primaryActionLabel(vcs.project)}</span>
				</button>
				<button class="command-button" type="button" disabled={Boolean(vcs.busy)} onclick={() => vcs.sync()}>
					<Icon name="refresh" size={16} />
					<span>Sync</span>
				</button>
				<button class="tool-button" type="button" aria-label="Refresh VCS status" onclick={() => vcs.refreshNow()}>
					<Icon name="refresh" size={16} />
				</button>
			</div>

			{#if vcs.error}
				<div class="rounded-[14px] bg-[rgba(224,170,170,0.12)] px-3 py-2 text-[12px] text-[var(--danger)]">
					{vcs.error}
				</div>
			{/if}
		</div>

		<div class="grid min-h-0 flex-1 grid-rows-[minmax(128px,38%)_minmax(0,1fr)]">
			<section class="soft-scroll min-h-0 overflow-auto px-3 py-3" aria-label="Changed files">
				{#if vcs.changedFiles.length === 0}
					<div class="grid h-full place-items-center text-[13px] text-[var(--text-muted)]">No local changes</div>
				{:else}
					<div class="grid gap-3">
						{#each vcs.changeGroups as group (group.status)}
							<div>
								<div class="px-2 pb-1 text-[12px] text-[var(--text-muted)]">
									{statusLabel(group.status)}
								</div>
								<div class="grid gap-1">
									{#each group.files as file (file.path)}
										<button
											class={[
												'flex min-h-9 items-center gap-2 rounded-[12px] px-2 text-left text-[13px] text-[var(--text-soft)] transition-[background-color,color] duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
												vcs.diffPath === file.path ? 'bg-[var(--selection)] text-[var(--text)]' : ''
											]}
											type="button"
											onclick={() => vcs.loadDiff(file.path)}
										>
											<VcsBadge status={file.status} />
											<span class="min-w-0 flex-1 truncate">{file.path}</span>
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<section class="soft-scroll min-h-0 overflow-auto bg-[var(--content)] px-4 py-3 shadow-[inset_0_1px_0_var(--hairline)]" aria-label="Diff preview">
				{#if vcs.isDiffLoading}
					<div class="text-[13px] text-[var(--text-muted)]">Loading diff...</div>
				{:else if vcs.diff}
					<pre class="whitespace-pre-wrap break-words font-mono text-[12px] leading-5 text-[var(--text-soft)]">{vcs.diff}</pre>
				{:else}
					<div class="text-[13px] text-[var(--text-muted)]">Select a file to preview changes</div>
				{/if}
			</section>
		</div>
	</aside>
{/if}
