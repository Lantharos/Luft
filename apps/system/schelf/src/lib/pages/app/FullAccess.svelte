<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import { commands, type InstalledApp } from '#lib/bindings.js';
	import { SLOW } from '#lib/bridge/index.js';
	import { FULL_ACCESS_ABILITIES } from '#lib/app/fullAccess.js';
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';

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
				? 'It runs outside its sandbox, like a program you start yourself.'
				: reason
					? `It asks to run without its sandbox: “${reason}” Only turn this on if you trust it.`
					: 'Takes away its sandbox. For one drive or folder, give it just that instead.')
	);
</script>

<Row title="Full access" {description}>
	<Switch checked={on} label="Full access" disabled={busy} onchange={(wanted) => (wanted ? (asking = true) : change(false))} />
</Row>

{#if open && app.desktop}
	{@const desktop = app.desktop}
	<Row title="{app.name} is open" description="Changes apply once it opens again.">
		<button type="button" class="button" disabled={busy} onclick={() => restart(desktop)}>Restart</button>
	</Row>
{/if}

{#if asking}
	<ConsentDialog
		title="Give {app.name} full access?"
		description="From the next time it opens, {app.name} can do all of this without asking."
		facts={FULL_ACCESS_ABILITIES}
		confirm="Give full access"
		danger
		onconfirm={() => change(true)}
		onclose={() => (asking = false)}
	/>
{/if}
