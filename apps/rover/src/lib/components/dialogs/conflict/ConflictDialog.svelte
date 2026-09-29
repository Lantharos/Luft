<script lang="ts">
	import { Checkbox, Dialog } from '@luft/ui';
	import * as api from '$lib/api';
	import * as features from '$lib/features/api';
	import type { Resolution } from '$lib/features/types';
	import type { Operation } from '$lib/types';
	import ConflictSide from './ConflictSide.svelte';

	interface Props {
		operation: Operation;
	}

	let { operation }: Props = $props();
	let applyToAll = $state(false);
	let answering = $state(false);

	let conflict = $derived(operation.conflict!);
	let folders = $derived(conflict.source.is_dir && conflict.target.is_dir);
	let incomingNewer = $derived((conflict.source.modified ?? 0) > (conflict.target.modified ?? 0));
	let existingNewer = $derived((conflict.target.modified ?? 0) > (conflict.source.modified ?? 0));
	let title = $derived(`${folders ? 'A folder' : 'An item'} named “${conflict.target.name}” is already here`);
	let description = $derived(
		folders
			? 'Merging keeps everything from both folders and asks again about any files with the same name.'
			: 'Replacing moves the existing item to the trash, so you can still get it back.'
	);

	function answer(resolution: Resolution) {
		if (answering) return;
		answering = true;
		void features.resolveConflict(operation.id, resolution, applyToAll).catch(() => (answering = false));
	}

	function stop() {
		void api.cancelOperation(operation.id);
	}
</script>

<Dialog {title} {description} wide onclose={stop}>
	<div class="flex gap-3">
		<ConflictSide
			heading="Already here"
			item={conflict.target}
			newer={existingNewer}
			larger={conflict.target.size > conflict.source.size}
		/>
		<ConflictSide
			heading={operation.op_type === 'Move' ? 'Being moved' : 'Being copied'}
			item={conflict.source}
			newer={incomingNewer}
			larger={conflict.source.size > conflict.target.size}
		/>
	</div>
	<Checkbox label="Do this for every conflict" checked={applyToAll} onchange={(checked) => (applyToAll = checked)}>
		Do this for every conflict
	</Checkbox>

	{#snippet actions()}
		<button class="plain-button mr-auto" type="button" onclick={stop}>Stop</button>
		<button class="button" type="button" disabled={answering} onclick={() => answer('skip')}>Skip</button>
		<button class="button" type="button" disabled={answering} onclick={() => answer('keepBoth')}>Keep both</button>
		<button class="button primary" type="button" disabled={answering} onclick={() => answer(folders ? 'merge' : 'replace')}>
			{folders ? 'Merge' : 'Replace'}
		</button>
	{/snippet}
</Dialog>
