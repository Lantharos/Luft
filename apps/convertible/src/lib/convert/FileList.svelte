<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { bytes, fileDragStart, IconButton, Select, VirtualScroller } from '@luft/ui';
	import type { FileEntry } from '#lib/bindings.js';
	import { session } from '#lib/state/session.svelte.js';

	const LAYOUT = { itemHeight: 48 };

	function overrideChoices(file: FileEntry) {
		const follow = file.family ? session.choices[file.family] : undefined;
		const label = follow ? file.targets.find((target) => target.id === follow)?.label ?? follow : t('list-no-format');
		return [{ value: '', label }, ...file.targets.map((target) => ({ value: target.id, label: target.label }))];
	}

	function override(file: FileEntry, value: string) {
		if (value) session.overrides.set(file.path, value);
		else session.overrides.delete(file.path);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col px-3 pb-3">
	<VirtualScroller class="soft-scroll min-h-0 flex-1" items={session.files} key={(file) => file.path} layout={LAYOUT} role="list" aria-label={t('list-files')}>
		{#snippet children(file)}
			<div
				class="row"
				class:chosen={session.selected === file.path}
				role="button"
				tabindex="0"
				draggable="true"
				ondragstart={fileDragStart(file.path)}
				onclick={() => (session.selected = file.path)}
				onkeydown={(event) => {
					if (event.key === 'Enter') session.selected = file.path;
					if (event.key === 'Delete') session.remove(file.path);
				}}
			>
				<span class="min-w-0 flex-1">
					<span class="block truncate text-[13px]">{file.name}</span>
					<span class="block truncate text-[12px] text-[var(--text-muted)]">
						{file.format ? `${file.label} · ${bytes(file.size)}` : t('list-unknown')}
					</span>
				</span>
				{#if file.format && session.selected === file.path}
					<span class="w-[150px] shrink-0">
						<Select label={t('list-override', { name: file.name })} options={overrideChoices(file)} value={session.overrides.get(file.path) ?? ''} onchange={(value) => override(file, value)} />
					</span>
				{:else if session.targetOf(file)}
					<span class="shrink-0 text-[13px] text-[var(--text-muted)]">{file.targets.find((target) => target.id === session.targetOf(file))?.label}</span>
				{/if}
				<IconButton icon={X} label={t('list-remove', { name: file.name })} onclick={() => session.remove(file.path)} />
			</div>
		{/snippet}
	</VirtualScroller>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 44px;
		padding: 0 8px 0 12px;
		border-radius: 10px;
		cursor: default;
	}

	.row:hover {
		background: var(--surface-hover);
	}

	.row.chosen {
		background: var(--surface);
	}

	.row:focus-visible {
		outline: 2px solid var(--control-focus);
		outline-offset: -2px;
	}
</style>
