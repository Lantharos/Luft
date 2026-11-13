<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, Dialog, Row, Section, Select } from '@luft/ui';
	import { commands, type CrashReportsState } from '#lib/bindings.js';

	let reports = $state<CrashReportsState | null>(null);
	let explaining = $state(false);
	let resetting = $state(false);

	let choices = $derived([
		{ value: 'ask', label: t('settings-crash-reports-ask') },
		{ value: 'always', label: t('settings-crash-reports-always') },
		{ value: 'never', label: t('settings-crash-reports-never') }
	]);

	async function load() {
		reports = await commands.crashReportsState().catch(() => ({ available: false, choice: 'ask' }));
	}

	async function choose(choice: string) {
		await commands.crashReportsChoose({ choice });
		await load();
	}

	load();
</script>

<Section title={t('settings-crash-reports')} description={t(reports?.available === false ? 'settings-crash-reports-unavailable' : 'settings-crash-reports-description')}>
	<Row title={t('settings-crash-reports-send')} disabled={!reports?.available}>
		<Select
			label={t('settings-crash-reports-send')}
			options={choices}
			value={reports?.choice ?? 'ask'}
			disabled={!reports?.available}
			onchange={choose}
		/>
	</Row>
	<Row title={t('settings-crash-reports-contents')} description={t('settings-crash-reports-contents-hint')}>
		<button type="button" class="button" onclick={() => (explaining = true)}>{t('settings-crash-reports-show')}</button>
	</Row>
	<Row title={t('settings-crash-reports-install')} description={t('settings-crash-reports-install-hint')} disabled={!reports?.available}>
		<button type="button" class="button" disabled={!reports?.available} onclick={() => (resetting = true)}>{t('settings-crash-reports-reset')}</button>
	</Row>
</Section>

{#if explaining}
	<Dialog title={t('settings-crash-reports-contents')} onclose={() => (explaining = false)}>
		<ul class="flex list-disc flex-col gap-1.5 pl-5 text-[13px] text-[var(--text-soft)]">
			<li>{t('settings-crash-reports-holds-program')}</li>
			<li>{t('settings-crash-reports-holds-failure')}</li>
			<li>{t('settings-crash-reports-holds-stack')}</li>
			<li>{t('settings-crash-reports-holds-system')}</li>
			<li>{t('settings-crash-reports-holds-install')}</li>
		</ul>
		<p class="mt-3 text-[13px] text-[var(--text-soft)]">{t('settings-crash-reports-never-holds')}</p>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (explaining = false)}>{t('settings-crash-reports-close')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if resetting}
	<ConfirmDialog
		title={t('settings-crash-reports-reset-title')}
		description={t('settings-crash-reports-reset-description')}
		action={t('settings-crash-reports-reset')}
		run={async () => {
			await commands.crashReportsResetInstall();
		}}
		onclose={() => (resetting = false)}
	/>
{/if}
