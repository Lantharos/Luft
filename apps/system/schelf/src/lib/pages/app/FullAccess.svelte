<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import { commands, type InstalledApp } from '#lib/bindings.js';
	import { SLOW } from '#lib/bridge/index.js';
	import { fullAccessAbilities } from '#lib/app/fullAccess.js';
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
				? t('app-full-access-on')
				: reason
					? t('app-full-access-asks', { reason })
					: t('app-full-access-off'))
	);
</script>

<Row title={t('app-full-access')} {description}>
	<Switch checked={on} label={t('app-full-access')} disabled={busy} onchange={(wanted) => (wanted ? (asking = true) : change(false))} />
</Row>

{#if open && app.desktop}
	{@const desktop = app.desktop}
	<Row title={t('app-restart-title', { name: app.name })} description={t('app-restart-description')}>
		<button type="button" class="button" disabled={busy} onclick={() => restart(desktop)}>{t('app-restart')}</button>
	</Row>
{/if}

{#if asking}
	<ConsentDialog
		title={t('app-full-access-consent-title', { name: app.name })}
		description={t('app-full-access-consent-description', { name: app.name })}
		facts={fullAccessAbilities()}
		confirm={t('app-full-access-consent-confirm')}
		danger
		onconfirm={() => change(true)}
		onclose={() => (asking = false)}
	/>
{/if}
