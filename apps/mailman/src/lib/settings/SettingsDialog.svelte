<script lang="ts">
	import { ActionRow, Dialog, Row, Section, Segmented, Switch } from '@luft/ui';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash from '@lucide/svelte/icons/trash-2';
	import * as api from '#lib/api/index.js';
	import type { Template } from '#lib/api/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { list } from '#lib/mail/list.svelte.js';
	import AccountRow from './AccountRow.svelte';

	interface Props {
		onclose: () => void;
		onadd: () => void;
	}

	let { onclose, onadd }: Props = $props();

	const UNDO = [5, 10, 20, 30].map((seconds) => ({ value: seconds, label: `${seconds} s` }));

	let templates = $state<Template[]>([]);

	$effect(() => {
		void api.templates().then((found) => (templates = found));
	});

	async function change(update: Parameters<typeof mail.updateSettings>[0]) {
		await mail.updateSettings(update);
		await list.load();
	}

	async function removeTemplate(id: number) {
		await api.deleteTemplate(id);
		templates = templates.filter((template) => template.id !== id);
	}
</script>

<Dialog title="Settings" wide {onclose}>
	<div class="flex flex-col gap-6">
		<Section title="Accounts">
			{#each mail.accounts as account (account.id)}
				<AccountRow {account} />
			{/each}
			<ActionRow title="Add an account" description="Gmail, Outlook, Fastmail, iCloud or any IMAP or JMAP server" icon={Plus} onclick={onadd} />
		</Section>
		<Section title="Inbox">
			<Row title="Screener" description="People writing for the first time wait in the Screener until you let them in">
				<Switch checked={mail.settings.screener} label="Screener" onchange={(screener) => void change({ screener })} />
			</Row>
			<Row title="Bundles" description="Newsletters, receipts and updates are kept out of the inbox and summed up at its top">
				<Switch checked={mail.settings.bundles} label="Bundles" onchange={(bundles) => void change({ bundles })} />
			</Row>
		</Section>
		<Section title="Writing">
			<Row title="Time to undo sending" description="Messages wait this long before they leave">
				<Segmented options={UNDO} value={mail.settings.undoSeconds} label="Time to undo sending" onchange={(undoSeconds) => void change({ undoSeconds })} />
			</Row>
		</Section>
		<Section title="Reading">
			<Row title="Darken bright messages" description="Designed newsletters follow the dark style too">
				<Switch checked={mail.settings.darkMail} label="Darken bright messages" onchange={(darkMail) => void change({ darkMail })} />
			</Row>
			<Row title="Notifications" description="A quiet note for new mail from people you know">
				<Switch checked={mail.settings.notifications} label="Notifications" onchange={(notifications) => void change({ notifications })} />
			</Row>
		</Section>
		{#if templates.length}
			<Section title="Templates">
				{#each templates as template (template.id)}
					<Row title={template.name}>
						<button type="button" class="icon-button" aria-label="Delete {template.name}" onclick={() => void removeTemplate(template.id)}><Trash size={16} /></button>
					</Row>
				{/each}
			</Section>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
