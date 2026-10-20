<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import type { InstalledApp } from '#lib/bridge/types.js';
	import { backend } from '#lib/state/backend.js';
	import FullAccessDialog from './FullAccessDialog.svelte';

	let { app, on = $bindable(false) }: { app: InstalledApp; on?: boolean } = $props();

	let busy = $state(false);
	let asking = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		const id = app.id;
		on = false;
		error = null;
		void backend()
			.fullAccess(id)
			.then((trusted) => {
				if (app.id === id) on = trusted;
			})
			.catch(() => {});
	});

	async function change(wanted: boolean) {
		asking = false;
		busy = true;
		error = null;
		try {
			await backend().setFullAccess(app.id, wanted);
			on = wanted;
		} catch (reason) {
			error = String(reason);
		} finally {
			busy = false;
		}
	}

	const description = $derived(
		error ??
			(on
				? 'It can see all your files, use the clipboard in the background and work like an app installed on the system.'
				: 'Lets it see all your files, use the clipboard in the background and work like an app installed on the system. Only turn this on for apps you trust.')
	);
</script>

<Row title="Full access" {description}>
	<Switch checked={on} label="Full access" disabled={busy} onchange={(wanted) => (wanted ? (asking = true) : change(false))} />
</Row>

{#if asking}
	<FullAccessDialog name={app.name} onconfirm={() => change(true)} onclose={() => (asking = false)} />
{/if}
