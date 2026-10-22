<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import type { InstalledApp } from '#lib/bridge/types.js';
	import { backend } from '#lib/bridge/index.js';
	import TrustDialog from '#lib/components/TrustDialog.svelte';

	let { app, on = $bindable(false), asking = $bindable(false) }: { app: InstalledApp; on?: boolean; asking?: boolean } = $props();

	let busy = $state(false);
	let error = $state<string | null>(null);

	const ABILITIES = [
		'Read, change and delete all your files',
		'Use every device, such as USB drives, cameras and game controllers',
		"Read what you copy, even while it's in the background",
		"Read the passwords and keys saved in your keyring, other apps' too",
		'Start any program as you, outside a sandbox'
	];

	$effect(() => {
		const id = app.id;
		on = false;
		error = null;
		void backend
			.fullAccess(id, app.source)
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
			await backend.setFullAccess(app.id, app.source, wanted);
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
				? `${app.name} runs outside its sandbox, with everything a program you start yourself can do.`
				: `${app.name} runs in a sandbox, with its own files and only what you give it. Full access takes the sandbox away; only turn it on for apps you trust.`)
	);
</script>

<Row title="Full access" {description}>
	<Switch checked={on} label="Full access" disabled={busy} onchange={(wanted) => (wanted ? (asking = true) : change(false))} />
</Row>

{#if asking}
	<TrustDialog
		title="Give {app.name} full access?"
		description="{app.name} will run outside its sandbox and can do anything a program you start yourself can, without asking. It takes effect the next time it opens."
		facts={ABILITIES}
		confirm="Give full access"
		onconfirm={() => change(true)}
		onclose={() => (asking = false)}
	/>
{/if}
