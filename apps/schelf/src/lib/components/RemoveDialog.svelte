<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { InstalledApp } from '#lib/bridge/types.js';
	import { removeJob } from '#lib/app/jobs.js';
	import { backend } from '#lib/bridge/index.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { app, onclose }: { app: InstalledApp; onclose: () => void } = $props();

	let alsoRemoved = $state<string[]>([]);

	$effect(() => {
		const name = app.source === 'package' ? app.package : null;
		alsoRemoved = [];
		if (name)
			void backend
				.fedoraRemovalPlan(name)
				.then((names) => (alsoRemoved = names))
				.catch(() => {});
	});

	const description = $derived.by(() => {
		if (app.source === 'appImage') return `${app.name} and its file in ${app.origin} will be deleted.`;
		if (app.source === 'tool') return `${app.name} will be removed from your tools container.`;
		if (app.source === 'debian') return `${app.name} will be removed from the Ubuntu container. Your files and settings stay.`;
		if (app.source === 'system') return `This removes ${app.name} from the system with everything it added, including its settings in /etc and its data in /var.`;
		if (alsoRemoved.length) return `This also removes ${alsoRemoved.join(', ')}, which ${alsoRemoved.length === 1 ? 'needs' : 'need'} ${app.name}.`;
		return `${app.name} will be removed from this computer. Your files and settings stay.`;
	});

	function remove() {
		void operations.run(app.key, app.name, removeJob(app));
		onclose();
	}
</script>

<Dialog title="Remove {app.name}?" {description} {onclose}>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" onclick={remove}>Remove</button>
	{/snippet}
</Dialog>
