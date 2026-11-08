<script lang="ts" module>
	export interface ToolbarActions {
		undo(): void;
		redo(): void;
		addPage(): void;
		fitWidth(): void;
		fitPage(): void;
		actualSize(): void;
		zoomBy(factor: number): void;
		paste(): void;
		insertPicture(): void;
		takePhoto(): void;
		toggleRuler(): void;
		paper(): void;
	}
</script>

<script lang="ts">
	import Eraser from '@lucide/svelte/icons/eraser';
	import FilePlus from '@lucide/svelte/icons/file-plus-2';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import NotebookText from '@lucide/svelte/icons/notebook-text';
	import Lasso from '@lucide/svelte/icons/lasso';
	import Type from '@lucide/svelte/icons/type';
	import Redo from '@lucide/svelte/icons/redo-2';
	import RulerIcon from '@lucide/svelte/icons/ruler';
	import TextSelect from '@lucide/svelte/icons/text-select';
	import Undo from '@lucide/svelte/icons/undo-2';
	import { t } from '@luft/i18n';
	import { IconButton, MenuButton, MenuItem, MenuSeparator, tooltip, type Side } from '@luft/ui';
	import { colorName } from './colors';
	import EraserOptions from './EraserOptions.svelte';
	import PenOptions from './PenOptions.svelte';
	import PenSwatch from './PenSwatch.svelte';
	import { tools, type Preset } from './tools.svelte';

	let {
		actions,
		zoom,
		books = false,
		ruled = false,
		side = false,
		opens
	}: { actions: ToolbarActions; zoom: number; books?: boolean; ruled?: boolean; side?: boolean; opens?: Side } = $props();

	let options: { anchor: HTMLElement; preset: Preset | null } | null = $state(null);

	function pick(preset: Preset, button: HTMLElement) {
		if (tools.active === 'draw' && tools.presetId === preset.id) options = { anchor: button, preset };
		else tools.choose(preset.id);
	}

	function pickEraser(button: HTMLElement) {
		if (tools.active === 'eraser') options = { anchor: button, preset: null };
		else tools.active = 'eraser';
	}

	const label = (preset: Preset) => t('toolbar-pen', { name: preset.tool === 'highlighter' ? t('pen-highlighter') : colorName(preset.color) });
</script>

<div class={['toolbar flex items-center gap-1', side && 'side flex-col']} role="toolbar" aria-orientation={side ? 'vertical' : 'horizontal'} aria-label={t('toolbar-label')} data-no-drag>
	<IconButton icon={Undo} label={t('toolbar-undo')} onclick={actions.undo} />
	<IconButton icon={Redo} label={t('toolbar-redo')} onclick={actions.redo} />
	<span class="divider"></span>
	{#each tools.presets as preset (preset.id)}
		<button
			type="button"
			class="tool"
			aria-pressed={tools.active === 'draw' && tools.presetId === preset.id}
			aria-label={label(preset)}
			{@attach tooltip(label(preset))}
			onclick={(event) => pick(preset, event.currentTarget)}
		>
			<PenSwatch pen={preset} />
		</button>
	{/each}
	<button
		type="button"
		class="tool"
		aria-pressed={tools.active === 'eraser'}
		aria-label={t('toolbar-eraser')}
		{@attach tooltip(t('toolbar-eraser'))}
		onclick={(event) => pickEraser(event.currentTarget)}
	>
		<Eraser size={19} />
	</button>
	<button
		type="button"
		class="tool"
		aria-pressed={tools.active === 'lasso'}
		aria-label={t('toolbar-lasso')}
		{@attach tooltip(t('toolbar-lasso'))}
		onclick={() => (tools.active = 'lasso')}
	>
		<Lasso size={19} />
	</button>
	<button
		type="button"
		class="tool"
		aria-pressed={tools.active === 'type'}
		aria-label={t('toolbar-type')}
		{@attach tooltip(t('toolbar-type'))}
		onclick={() => (tools.active = 'type')}
	>
		<Type size={19} />
	</button>
	{#if books}
		<button
			type="button"
			class="tool"
			aria-pressed={tools.active === 'text'}
			aria-label={t('toolbar-text')}
			{@attach tooltip(t('toolbar-text'))}
			onclick={() => (tools.active = 'text')}
		>
			<TextSelect size={19} />
		</button>
	{/if}
	<button
		type="button"
		class="tool"
		aria-pressed={ruled}
		aria-label={t('toolbar-ruler')}
		{@attach tooltip(t('toolbar-ruler'))}
		onclick={actions.toggleRuler}
	>
		<RulerIcon size={19} />
	</button>
	<span class="divider"></span>
	<MenuButton label={t('toolbar-picture')} class="icon-button" align={side ? 'start' : 'end'} side={opens}>
		{#snippet trigger()}
			<ImagePlus size={19} />
		{/snippet}
		{#snippet children(close)}
			<MenuItem onclick={() => (actions.insertPicture(), close())}>{t('picture-choose')}</MenuItem>
			<MenuItem onclick={() => (actions.takePhoto(), close())}>{t('picture-photo')}</MenuItem>
		{/snippet}
	</MenuButton>
	<IconButton icon={FilePlus} label={t('toolbar-add-page')} onclick={actions.addPage} />
	<IconButton icon={NotebookText} label={t('toolbar-paper')} onclick={actions.paper} />
	<MenuButton label={t('toolbar-zoom')} class="plain-button tabular-nums" align={side ? 'start' : 'end'} side={opens}>
		{#snippet trigger()}
			{t('zoom-percent', { percent: Math.round(zoom * 100) })}
		{/snippet}
		{#snippet children(close)}
			<MenuItem onclick={() => (actions.fitWidth(), close())}>{t('zoom-fit-width')}</MenuItem>
			<MenuItem onclick={() => (actions.fitPage(), close())}>{t('zoom-fit-page')}</MenuItem>
			<MenuItem onclick={() => (actions.actualSize(), close())}>{t('zoom-actual')}</MenuItem>
			<MenuSeparator />
			<MenuItem onclick={() => actions.zoomBy(1.25)}>{t('zoom-in')}</MenuItem>
			<MenuItem onclick={() => actions.zoomBy(0.8)}>{t('zoom-out')}</MenuItem>
		{/snippet}
	</MenuButton>
</div>

{#if options?.preset}
	<PenOptions anchor={options.anchor} preset={options.preset} side={opens} onclose={() => (options = null)} />
{:else if options}
	<EraserOptions anchor={options.anchor} side={opens} onclose={() => (options = null)} />
{/if}

<style>
	.divider {
		margin-inline: 6px;
		height: 20px;
		width: 1px;
		background: var(--hairline);
	}

	.side .divider {
		margin-block: 6px;
		height: 1px;
		width: 20px;
	}

	.tool {
		display: grid;
		height: 36px;
		width: 36px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition-property: background-color, color, transform;
		transition-duration: var(--motion-tap);
	}

	.tool:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.tool:active {
		transform: scale(0.94);
	}

	.tool[aria-pressed='true'] {
		background: var(--control);
		color: var(--text);
	}

	:global([data-posture='tablet']) .tool {
		height: 46px;
		width: 46px;
	}

	:global([data-posture='tablet']) .toolbar :global(.icon-button) {
		height: 46px;
		width: 46px;
	}
</style>
