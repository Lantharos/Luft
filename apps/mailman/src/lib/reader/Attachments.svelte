<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Download from '@lucide/svelte/icons/download';
	import File from '@lucide/svelte/icons/file';
	import FileImage from '@lucide/svelte/icons/file-image';
	import FileText from '@lucide/svelte/icons/file-text';
	import * as api from '#lib/api/index.js';
	import type { Attachment } from '#lib/api/index.js';
	import { size } from '#lib/app/format.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';

	interface Props {
		source: api.PartSource;
		attachments: Attachment[];
	}

	let { source, attachments }: Props = $props();

	let shown = $derived(attachments.filter((attachment) => !attachment.inline));

	function icon(mime: string) {
		if (mime.startsWith('image/')) return FileImage;
		if (mime.startsWith('text/') || mime === 'application/pdf') return FileText;
		return File;
	}

	async function save(index: number) {
		const path = await api.saveAttachment(source, index).catch(toasts.fail);
		if (path) toasts.show('Saved', { action: { label: 'Open', run: () => void api.openUri(`file://${path}`) } });
	}
</script>

{#if shown.length}
	<div class="flex flex-wrap gap-2 pt-3">
		{#each shown as attachment (attachment.index)}
			{@const Icon = icon(attachment.mime)}
			<div class="attachment">
				<button type="button" class="open" onclick={() => void api.openAttachment(source, attachment.index).catch(toasts.fail)}>
					<Icon size={17} class="flex-none text-[var(--text-muted)]" />
					<span class="min-w-0 truncate">{attachment.name}</span>
					<span class="flex-none text-[12px] text-[var(--text-muted)]">{size(attachment.size)}</span>
				</button>
				<button type="button" class="icon-button save" aria-label="Save" onclick={() => void save(attachment.index)} {@attach tooltip('Save')}>
					<Download size={15} />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.attachment {
		display: flex;
		max-width: 320px;
		align-items: center;
		border-radius: 14px;
		background: var(--surface);
		padding-right: 4px;
	}

	.open {
		display: flex;
		min-width: 0;
		height: 40px;
		flex: 1;
		align-items: center;
		gap: 10px;
		padding-inline: 12px 6px;
		font-size: 13px;
	}

	.save {
		height: 30px;
		width: 30px;
	}

	.attachment:hover {
		background: var(--surface-hover);
	}
</style>
