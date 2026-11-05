<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import { commands, type InstalledApp } from '#lib/bindings.js';
	import { SLOW } from '#lib/bridge/index.js';
	import { FULL_ACCESS_ABILITIES } from '#lib/app/fullAccess.js';
	import TrustDialog from '#lib/components/TrustDialog.svelte';

	let {
		app,
		reason = null,
		on = $bindable(false),
		asking = $bindable(false)
	}: { app: InstalledApp; reason?: string | null; on?: boolean; asking?: boolean } = $props();

	let busy = $state(false);
	let error = $state<string | null>(null);
	let open = $state(false);

	$effect(() => {
		const id = app.id;
		on = false;
		error = null;
		open = false;
		void commands
			.libraryFullAccess({ id, source: app.source })
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
			open = await commands.librarySetFullAccess({ id: app.id, source: app.source, on: wanted }, SLOW);
			on = wanted;
		} catch (reason) {
			error = String(reason);
		} finally {
			busy = false;
		}
	}

	async function restart(desktop: string) {
		busy = true;
		error = null;
		try {
			await commands.libraryRestart({ id: app.id, desktop, token: null }, SLOW);
			open = false;
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
				: reason
					? `${app.name} runs in a sandbox, though it asks to run without one: “${reason}” Only turn full access on if you trust it.`
					: `${app.name} runs in a sandbox, with its own files and only what you give it. Full access takes the sandbox away; only turn it on for apps you trust.`)
	);
</script>

<Row title="Full access" {description}>
	<Switch checked={on} label="Full access" disabled={busy} onchange={(wanted) => (wanted ? (asking = true) : change(false))} />
</Row>

{#if open && app.desktop}
	{@const desktop = app.desktop}
	<Row title="{app.name} is open" description="It keeps running the way it started until it opens again.">
		<button type="button" class="button" disabled={busy} onclick={() => restart(desktop)}>Restart</button>
	</Row>
{/if}

{#if asking}
	<TrustDialog
		title="Give {app.name} full access?"
		description="{app.name} will run outside its sandbox and can do anything a program you start yourself can, without asking. It takes effect the next time it opens."
		facts={FULL_ACCESS_ABILITIES}
		confirm="Give full access"
		onconfirm={() => change(true)}
		onclose={() => (asking = false)}
	/>
{/if}
