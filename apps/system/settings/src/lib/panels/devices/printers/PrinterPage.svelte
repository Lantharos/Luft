<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { ago, ConfirmDialog, errorText, IconButton, ProgressBar, Row, Section, Segmented, Select } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Printer, PrintJob } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { percent } from '#lib/format.js';
	import { colorOptions, connection, needsAttention, papers, sideOptions, status, swatch } from './describe';

	interface Props {
		printer: Printer;
		jobs: PrintJob[];
		onclose: () => void;
	}

	let { printer, jobs, onclose }: Props = $props();

	const HELD = 4;
	const PRINTING = 5;

	let removing = $state(false);
	let note = $state('');
	let failed = $state(false);

	let paperChoices = $derived(papers(printer));
	let sides = $derived(sideOptions(printer));
	let colors = $derived(colorOptions(printer));
	let link = $derived(connection(printer));

	function report(text: string, problem = false) {
		note = text;
		failed = problem;
	}

	async function attempt(action: () => Promise<unknown>, done = '') {
		try {
			await action();
			report(done);
		} catch (reason) {
			report(errorText(reason), true);
		}
	}

	const configure = (option: string, value: string) => attempt(() => commands.printersConfigure({ name: printer.name, options: { [option]: value } }));

	function jobState(job: PrintJob) {
		if (job.state === PRINTING) return t('settings-printers-job-printing');
		if (job.state === HELD) return t('settings-printers-job-held');
		return t('settings-printers-job-waiting');
	}
</script>

<SubPage title={printer.description} {onclose}>
	<Section>
		<Row title={t('settings-printers-status')} description={printer.message || undefined}>
			<span class="value" class:alert={needsAttention(printer)}>{status(printer)}</span>
		</Row>
		{#if printer.model}
			<Row title={t('settings-printers-model')} description={link || undefined}>
				<span class="value">{printer.model}</span>
			</Row>
		{/if}
		{#if printer.location}
			<Row title={t('settings-printers-location')}>
				<span class="value">{printer.location}</span>
			</Row>
		{/if}
	</Section>

	{#if printer.markers.length}
		<Section title={t('settings-printers-supplies')}>
			{#each printer.markers as [name, level, color] (name)}
				<Row title={name}>
					<span class="swatch" style:background={swatch(color)}></span>
					<ProgressBar fraction={level / 100} label={name} class="w-24" />
					<span class="w-10 text-right tabular-nums">{percent(level / 100)}</span>
				</Row>
			{/each}
		</Section>
	{/if}

	<Section title={t('settings-printers-queue')}>
		{#each jobs as job (job.id)}
			<Row title={job.name || t('settings-printers-job-untitled')} description={`${jobState(job)} · ${job.owner} · ${ago(job.created)}`}>
				{#if job.mine}
					<IconButton icon={X} label={t('settings-printers-job-cancel')} onclick={() => attempt(() => commands.printersCancelJob({ printer: printer.name, job: job.id }))} />
				{/if}
			</Row>
		{:else}
			<Row title={t('settings-printers-queue-empty')} />
		{/each}
	</Section>

	{#if paperChoices.length > 1 || sides.length > 1 || colors.length > 1}
		<Section title={t('settings-printers-options')}>
			{#if paperChoices.length > 1}
				<Row title={t('settings-printers-paper')}>
					<Select label={t('settings-printers-paper')} options={paperChoices} value={printer.mediaDefault} onchange={(media) => configure('media', media)} />
				</Row>
			{/if}
			{#if sides.length > 1}
				<Row title={t('settings-printers-sides')}>
					<Segmented label={t('settings-printers-sides')} options={sides} value={printer.sidesDefault} onchange={(side) => configure('sides', side)} />
				</Row>
			{/if}
			{#if colors.length > 1}
				<Row title={t('settings-printers-color')}>
					<Segmented label={t('settings-printers-color')} options={colors} value={printer.colorModeDefault} onchange={(mode) => configure('print-color-mode', mode)} />
				</Row>
			{/if}
		</Section>
	{/if}

	<Section>
		{#if !printer.default}
			<Row title={t('settings-printers-make-default')} description={t('settings-printers-make-default-description')} onclick={() => attempt(() => commands.printersSetDefault({ name: printer.name }))} />
		{/if}
		<Row
			title={t('settings-printers-test-page')}
			description={note && !failed ? note : t('settings-printers-test-page-description')}
			onclick={() => attempt(() => commands.printersTestPage({ name: printer.name }), t('settings-printers-test-page-sent'))}
		/>
		{#if !printer.temporary}
			<Row title={t('settings-printers-remove')} description={t('settings-printers-remove-description')} onclick={() => (removing = true)} />
		{/if}
	</Section>
	{#if failed}
		<p class="problem">{note}</p>
	{/if}
</SubPage>

{#if removing}
	<ConfirmDialog
		title={t('settings-printers-remove-confirm', { name: printer.description })}
		description={t('settings-printers-remove-confirm-description')}
		action={t('settings-printers-remove')}
		danger
		run={async () => {
			await commands.printersRemove({ name: printer.name });
			onclose();
		}}
		onclose={() => (removing = false)}
	/>
{/if}

<style>
	.value {
		text-align: right;
		color: var(--text-soft);
		user-select: text;
	}

	.value.alert,
	.problem {
		color: var(--danger);
	}

	.problem {
		font-size: 13px;
		padding-inline: 4px;
	}

	.swatch {
		width: 10px;
		height: 10px;
		flex: none;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
</style>
