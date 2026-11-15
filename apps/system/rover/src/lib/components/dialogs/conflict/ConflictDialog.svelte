<script lang="ts">
	import { t } from '@luft/i18n';
	import { Checkbox, Dialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Operation, Resolution } from '#lib/bindings.js';
	import ConflictSide from './ConflictSide.svelte';

	interface Props {
		operation: Operation;
	}

	let { operation }: Props = $props();
	let applyToAll = $state(false);
	let answering = $state(false);

	let conflict = $derived(operation.conflict!);
	let folders = $derived(conflict.source.isDir && conflict.target.isDir);
	let incomingNewer = $derived((conflict.source.modified ?? 0) > (conflict.target.modified ?? 0));
	let existingNewer = $derived((conflict.target.modified ?? 0) > (conflict.source.modified ?? 0));
	let title = $derived(t('rover-conflict-title', { kind: folders ? 'folder' : 'item', name: conflict.target.name }));
	let description = $derived(folders ? t('rover-conflict-merge-description') : t('rover-conflict-replace-description'));

	function answer(resolution: Resolution) {
		if (answering) return;
		answering = true;
		void commands.resolveConflict({ id: operation.id, resolution, applyToAll }).catch(() => (answering = false));
	}

	function stop() {
		void commands.cancelOperation({ id: operation.id });
	}
</script>

<Dialog {title} {description} wide onclose={stop}>
	<div class="flex gap-3">
		<ConflictSide
			heading={t('rover-conflict-existing')}
			item={conflict.target}
			newer={existingNewer}
			larger={conflict.target.size > conflict.source.size}
		/>
		<ConflictSide
			heading={operation.opType === 'Move' ? t('rover-conflict-moving') : t('rover-conflict-copying')}
			item={conflict.source}
			newer={incomingNewer}
			larger={conflict.source.size > conflict.target.size}
		/>
	</div>
	<Checkbox label={t('rover-conflict-apply-to-all')} checked={applyToAll} onchange={(checked) => (applyToAll = checked)}>
		{t('rover-conflict-apply-to-all')}
	</Checkbox>

	{#snippet actions()}
		<button class="plain-button mr-auto" type="button" onclick={stop}>{t('rover-conflict-stop')}</button>
		<button class="button" type="button" disabled={answering} onclick={() => answer('skip')}>{t('rover-conflict-skip')}</button>
		<button class="button" type="button" disabled={answering} onclick={() => answer('keepBoth')}>{t('rover-conflict-keep-both')}</button>
		<button class="button primary" type="button" disabled={answering} onclick={() => answer(folders ? 'merge' : 'replace')}>
			{folders ? t('rover-conflict-merge') : t('rover-conflict-replace')}

		</button>
	{/snippet}
</Dialog>
