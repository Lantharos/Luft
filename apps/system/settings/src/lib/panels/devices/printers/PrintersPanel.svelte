<script lang="ts">
	import PrinterIcon from '@lucide/svelte/icons/printer';
	import { t } from '@luft/i18n';
	import { ActionRow, item, reorder, Row, Section } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { PrintersState } from '#lib/bindings.js';
	import AddDialog from './AddDialog.svelte';
	import PrinterPage from './PrinterPage.svelte';
	import { jobsFor, needsAttention, summary } from './describe';

	let known = $state<PrintersState | null>(null);
	let opened = $state<string | null>(null);
	let adding = $state(false);

	let printers = $derived(known ? [...known.printers].sort((left, right) => Number(right.default) - Number(left.default) || left.description.localeCompare(right.description)) : []);
	let shown = $derived(printers.find((printer) => printer.name === opened));

	$effect(() => {
		void commands.printersState().then((current) => (known = current)).catch(() => (known = { printers: [], jobs: [] }));
		return events.printersChanged((current) => (known = current));
	});

	function waiting(name: string) {
		const count = known ? jobsFor(name, known.jobs).length : 0;
		return count ? t('settings-printers-waiting', { count }) : '';
	}

	function added(name: string) {
		adding = false;
		opened = name;
	}
</script>

{#if shown && known}
	<PrinterPage printer={shown} jobs={jobsFor(shown.name, known.jobs)} onclose={() => (opened = null)} />
{:else if known}
	<Section>
		{#each printers as printer (printer.name)}
			<div class="row-slot" animate:reorder in:item out:item>
				<ActionRow
					title={printer.description}
					description={[printer.default ? t('settings-printers-default') : '', summary(printer), waiting(printer.name)].filter(Boolean).join(' · ')}
					alert={needsAttention(printer)}
					icon={PrinterIcon}
					onclick={() => (opened = printer.name)}
				/>
			</div>
		{:else}
			<Row title={t('settings-printers-none')} description={t('settings-printers-none-description')} icon={PrinterIcon} />
		{/each}
		<Row title={t('settings-printers-add')} description={t('settings-printers-add-description')} onclick={() => (adding = true)} />
	</Section>
{/if}

{#if adding}
	<AddDialog onadded={added} onclose={() => (adding = false)} />
{/if}
