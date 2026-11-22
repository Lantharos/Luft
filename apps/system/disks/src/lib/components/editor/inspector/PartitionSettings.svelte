<script lang="ts">
	import { tick } from 'svelte';
	import { t } from '@luft/i18n';
	import SlidersHorizontal from '@luft/symbols/icons/sliders-horizontal';
	import { Popover, Select, Switch, TextField, tooltip } from '@luft/ui';
	import { renamePartition, retype, setFlag } from '#lib/editor/edits.js';
	import type { Layout, Part } from '#lib/editor/model.js';
	import { FLAGS, typeFor, typeOptions } from '#lib/partitions/types.js';

	interface Props {
		layout: Layout;
		part: Part;
	}

	let { layout, part }: Props = $props();

	let button = $state<HTMLButtonElement>();
	let open = $state(false);
	let name = $state('');

	$effect.pre(() => {
		name = part.name;
	});

	let type = $derived(part.type || typeFor(layout.table, part.filesystem));
	let types = $derived(typeOptions(layout.table, type));

	function focusFirst(node: HTMLElement) {
		void tick().then(() => node.querySelector<HTMLElement>('button, input')?.focus());
	}

	function close() {
		renamePartition(part, name);
		open = false;
	}
</script>

<button
	bind:this={button}
	type="button"
	class="icon-button"
	aria-label={t('disks-editor-settings')}
	aria-haspopup="dialog"
	aria-expanded={open}
	{@attach tooltip(t('disks-editor-settings'))}
	onclick={() => (open ? close() : (open = true))}
>
	<SlidersHorizontal size={17} />
</button>

{#if open && button}
	<Popover anchor={button} label={t('disks-editor-settings')} role="dialog" align="end" minWidth={380} maxHeight={460} onclose={close}>
		<div class="contents" {@attach focusFirst}>
			<div class="setting">
				<span>{t('disks-editor-settings-type')}</span>
				<Select label={t('disks-editor-settings-type-label')} options={types} value={type} onchange={(value) => retype(part, value)} />
			</div>
			{#if layout.table === 'gpt'}
				<div class="setting">
					<span>{t('disks-editor-settings-name')}</span>
					<div class="w-[160px]" onfocusout={() => renamePartition(part, name)}>
						<TextField label={t('disks-editor-settings-name-label')} placeholder={t('disks-editor-settings-name-none')} bind:value={name} onkeydown={(event) => event.key === 'Enter' && renamePartition(part, name)} />
					</div>
				</div>
			{/if}
			{#each FLAGS[layout.table] as flag (flag.bit)}
				<div class="setting">
					<span {@attach tooltip(t(`${flag.message}.description`))}>{t(flag.message)}</span>
					<Switch label={t(flag.message)} checked={part.flags.includes(flag.bit)} onchange={(on) => setFlag(part, flag.bit, on)} />
				</div>
			{/each}
		</div>
	</Popover>
{/if}

<style>
	.setting {
		display: flex;
		min-height: 44px;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 6px 0 10px;
		font-size: 13px;
		white-space: nowrap;
	}
</style>
