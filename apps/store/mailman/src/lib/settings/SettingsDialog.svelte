<script lang="ts">
	import { t } from '@luft/i18n';
	import { ActionRow, Dialog, Row, Section, Segmented, Switch } from '@luft/ui';
	import Plus from '@luft/symbols/icons/plus';
	import Trash from '@luft/symbols/icons/trash-2';
	import { commands } from '#lib/bindings.js';
	import type { Template } from '#lib/bindings.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { list } from '#lib/mail/list.svelte.js';
	import AccountRow from './AccountRow.svelte';

	interface Props {
		onclose: () => void;
		onadd: () => void;
	}

	let { onclose, onadd }: Props = $props();

	let undo = $derived([5, 10, 20, 30].map((seconds) => ({ value: seconds, label: t('mailman-settings-seconds', { seconds }) })));

	let templates = $state<Template[]>([]);

	$effect(() => {
		void commands.templates().then((found) => (templates = found));
	});

	async function change(update: Parameters<typeof mail.updateSettings>[0]) {
		await mail.updateSettings(update);
		await list.load();
	}

	async function removeTemplate(id: number) {
		await commands.deleteTemplate({ id });
		templates = templates.filter((template) => template.id !== id);
	}
</script>

<Dialog title={t('mailman-settings-title')} wide {onclose}>
	<div class="flex flex-col gap-6">
		<Section title={t('mailman-settings-accounts')}>
			{#each mail.accounts as account (account.id)}
				<AccountRow {account} />
			{/each}
			<ActionRow title={t('mailman-settings-add-account')} description={t('mailman-settings-add-account-description')} icon={Plus} onclick={onadd} />
		</Section>
		<Section title={t('mailman-settings-inbox')}>
			<Row title={t('mailman-settings-screener')} description={t('mailman-settings-screener-description')}>
				<Switch checked={mail.settings.screener} label={t('mailman-settings-screener')} onchange={(screener) => void change({ screener })} />
			</Row>
			<Row title={t('mailman-settings-bundles')} description={t('mailman-settings-bundles-description')}>
				<Switch checked={mail.settings.bundles} label={t('mailman-settings-bundles')} onchange={(bundles) => void change({ bundles })} />
			</Row>
		</Section>
		<Section title={t('mailman-settings-writing')}>
			<Row title={t('mailman-settings-undo')}>
				<Segmented options={undo} value={mail.settings.undoSeconds} label={t('mailman-settings-undo')} onchange={(undoSeconds) => void change({ undoSeconds })} />
			</Row>
		</Section>
		<Section title={t('mailman-settings-reading')}>
			<Row title={t('mailman-settings-dark-mail')} description={t('mailman-settings-dark-mail-description')}>
				<Switch checked={mail.settings.darkMail} label={t('mailman-settings-dark-mail')} onchange={(darkMail) => void change({ darkMail })} />
			</Row>
			<Row title={t('mailman-settings-notifications')} description={t('mailman-settings-notifications-description')}>
				<Switch checked={mail.settings.notifications} label={t('mailman-settings-notifications')} onchange={(notifications) => void change({ notifications })} />
			</Row>
		</Section>
		{#if templates.length}
			<Section title={t('mailman-settings-templates')}>
				{#each templates as template (template.id)}
					<Row title={template.name}>
						<button type="button" class="icon-button" aria-label={t('mailman-settings-delete-template', { name: template.name })} onclick={() => void removeTemplate(template.id)}><Trash size={16} /></button>
					</Row>
				{/each}
			</Section>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('mailman-settings-done')}</button>
	{/snippet}
</Dialog>
