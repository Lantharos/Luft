<script lang="ts">
	import { bytes, MenuButton, MenuItem, MenuSeparator, Select, tooltip } from '@luft/ui';
	import Bell from '@lucide/svelte/icons/bell';
	import Bold from '@lucide/svelte/icons/bold';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Italic from '@lucide/svelte/icons/italic';
	import Link from '@lucide/svelte/icons/link';
	import List from '@lucide/svelte/icons/list';
	import Maximize from '@lucide/svelte/icons/maximize-2';
	import Minimize from '@lucide/svelte/icons/minimize-2';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Quote from '@lucide/svelte/icons/text-quote';
	import Trash from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';
	import { fly } from 'svelte/transition';
	import * as api from '#lib/api/index.js';
	import type { Template } from '#lib/api/index.js';
	import { REMINDERS, SEND_LATER } from '#lib/app/when.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import { composer, type Composition } from './composer.svelte';
	import { shownAddress } from './identity';
	import Editor from './Editor.svelte';
	import RecipientField from './RecipientField.svelte';

	interface Props {
		composition: Composition;
	}

	let { composition = $bindable() }: Props = $props();

	let editor = $state<Editor>();
	let showQuote = $state(false);
	let templates = $state<Template[]>([]);

	let senders = $derived(
		mail.identities.map((identity) => {
			const address = identity.id === composition.identity ? shownAddress(identity, composition.from) : identity.address;
			return { value: identity.id, label: identity.name ? `${identity.name} <${address}>` : address };
		})
	);
	let wildcard = $derived(mail.identities.find((identity) => identity.id === composition.identity)?.address.startsWith('*@') ?? false);
	let title = $derived(composition.subject.trim() || (composition.inReplyTo ? 'Reply' : 'New message'));
	let reminder = $derived(REMINDERS.find((option) => option.seconds === composition.remindAfter));

	const laterFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

	function chooseSender(id: number) {
		const identity = mail.identities.find((candidate) => candidate.id === id);
		if (!identity) return;
		const domain = identity.address.startsWith('*@') ? identity.address.slice(1) : null;
		composition.account = identity.account;
		composition.identity = identity.id;
		composition.from = domain && composition.from?.endsWith(domain) ? composition.from : null;
		editor?.replaceSignature(composer.signature(identity.id));
	}

	function send(at: number | null = null) {
		if (editor) void composer.send(editor.content(), at);
	}

	function close() {
		void composer.close(editor?.content() ?? null);
	}

	async function attach() {
		const chosen = await api.chooseFiles().catch(toasts.fail);
		if (chosen) composition.attachments = [...composition.attachments, ...chosen.map((file) => ({ ...file, cid: null }))];
	}

	async function loadTemplates() {
		templates = await api.templates();
	}

	async function saveTemplate() {
		const content = editor?.content();
		if (!content || content.empty) return toasts.show('Write something first');
		const name = composition.subject.trim() || content.text.split('\n')[0].slice(0, 40);
		await api.saveTemplate(null, name, content.source);
		toasts.show(`Saved “${name}” as a template`);
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
			event.preventDefault();
			send();
		} else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
			event.preventDefault();
			composition.showCopies = true;
		}
		event.stopPropagation();
	}
</script>

<div class="composer" class:expanded={composer.expanded} role="dialog" aria-label={title} tabindex="-1" onkeydown={keydown} transition:fly={{ y: 24, duration: 220 }}>
	<header class="flex h-12 flex-none items-center gap-1 pr-2 pl-5">
		<p class="min-w-0 flex-1 truncate text-[14px] font-semibold">{title}</p>
		<button type="button" class="icon-button small" aria-label={composer.expanded ? 'Shrink' : 'Enlarge'} onclick={() => (composer.expanded = !composer.expanded)}>
			{#if composer.expanded}<Minimize size={15} />{:else}<Maximize size={15} />{/if}
		</button>
		<button type="button" class="icon-button small" aria-label="Close" onclick={close} {@attach tooltip('Close and keep as draft')}>
			<X size={17} />
		</button>
	</header>
	{#if senders.length > 1}
		<div class="field">
			<span class="label">From</span>
			<Select options={senders} value={composition.identity} label="From" onchange={chooseSender} />
			{#if wildcard}
				<input class="sender" bind:value={composition.from} placeholder="Address to send as" aria-label="Address to send as" />
			{/if}
		</div>
	{/if}
	<RecipientField label="To" bind:addresses={composition.to} autofocus={!composition.to.length}>
		{#snippet trailing()}
			{#if !composition.showCopies}
				<button type="button" class="plain-button copies" tabindex="-1" onclick={() => (composition.showCopies = true)} {@attach tooltip('Ctrl+Shift+C')}>Cc Bcc</button>
			{/if}
		{/snippet}
	</RecipientField>
	{#if composition.showCopies}
		<RecipientField label="Cc" bind:addresses={composition.cc} />
		<RecipientField label="Bcc" bind:addresses={composition.bcc} />
	{/if}
	<div class="field">
		<input class="subject" bind:value={composition.subject} placeholder="Subject" aria-label="Subject" onkeydown={(event) => event.key === 'Enter' && (event.preventDefault(), editor?.focus())} />
	</div>
	{#key composition.key}
		<Editor bind:this={editor} html={composition.body} placeholder="Write something. **bold**, *italic*, - lists and > quotes work as you type." autofocus={composition.to.length > 0} onsend={() => send()} />
	{/key}
	{#if composition.quote}
		<div class="px-5 pb-2">
			<button type="button" class="plain-button quote-toggle" onclick={() => (showQuote = !showQuote)}>
				<Quote size={15} />{showQuote ? 'Hide quoted text' : 'Show quoted text'}
			</button>
			{#if showQuote}
				<div class="quote soft-scroll">{@html composition.quote}</div>
			{/if}
		</div>
	{/if}
	{#if composition.attachments.length}
		<div class="flex flex-wrap gap-2 px-5 pb-3">
			{#each composition.attachments as attachment (attachment.path)}
				<span class="attachment">
					<Paperclip size={14} class="flex-none text-[var(--text-muted)]" />
					<span class="truncate">{attachment.name}</span>
					{#if attachment.size}<span class="flex-none text-[12px] text-[var(--text-muted)]">{bytes(attachment.size)}</span>{/if}
					<button type="button" aria-label="Remove {attachment.name}" onclick={() => (composition.attachments = composition.attachments.filter((candidate) => candidate !== attachment))}><X size={13} /></button>
				</span>
			{/each}
		</div>
	{/if}
	<footer class="flex h-[58px] flex-none items-center gap-1 px-3">
		<div class="send">
			<button type="button" class="button primary main" disabled={composer.sending} onclick={() => send()} {@attach tooltip('Send (Ctrl+Enter)')}>Send</button>
			<MenuButton label="Send later" class="button primary chevron" align="start">
				{#snippet trigger()}<ChevronDown size={16} />{/snippet}
				{#snippet children(closeMenu)}
					{#each SEND_LATER as moment (moment.id)}
						{@const at = moment.at()}
						<MenuItem onclick={() => (closeMenu(), send(at))}>
							<span class="flex-1">{moment.label}</span><span class="text-[12px] text-[var(--text-muted)]">{laterFormat.format(at * 1000)}</span>
						</MenuItem>
					{/each}
				{/snippet}
			</MenuButton>
		</div>
		<MenuButton label="Remind me" class={['icon-button', reminder && 'on']} align="start">
			{#snippet trigger()}<Bell size={17} />{/snippet}
			{#snippet children(closeMenu)}
				<p class="px-2.5 pt-1 pb-1.5 text-[12px] text-[var(--text-muted)]">Bring this back if nobody replies</p>
				{#each REMINDERS as option (option.seconds)}
					<MenuItem checked={composition.remindAfter === option.seconds} onclick={() => (closeMenu(), (composition.remindAfter = composition.remindAfter === option.seconds ? null : option.seconds))}>{option.label}</MenuItem>
				{/each}
			{/snippet}
		</MenuButton>
		<button type="button" class="icon-button" aria-label="Attach files" onclick={() => void attach()} {@attach tooltip('Attach files')}><Paperclip size={17} /></button>
		<span class="divider"></span>
		<button type="button" class="icon-button" aria-label="Bold" onclick={() => editor?.command('bold')} {@attach tooltip('Bold (Ctrl+B)')}><Bold size={16} /></button>
		<button type="button" class="icon-button" aria-label="Italic" onclick={() => editor?.command('italic')} {@attach tooltip('Italic (Ctrl+I)')}><Italic size={16} /></button>
		<button type="button" class="icon-button" aria-label="List" onclick={() => editor?.command('insertUnorderedList')} {@attach tooltip('List')}><List size={16} /></button>
		<button type="button" class="icon-button" aria-label="Link" onclick={() => editor?.command('link')} {@attach tooltip('Link (Ctrl+K)')}><Link size={16} /></button>
		<MenuButton label="Templates" class="plain-button templates" align="start" onpointerdown={() => void loadTemplates()}>
			{#snippet trigger()}Templates{/snippet}
			{#snippet children(closeMenu)}
				{#each templates as template (template.id)}
					<MenuItem onclick={() => (closeMenu(), editor?.insert(template.body))}>{template.name}</MenuItem>
				{:else}
					<p class="px-2.5 py-2 text-[12.5px] text-[var(--text-muted)]">Save a message you write often and insert it here.</p>
				{/each}
				<MenuSeparator />
				<MenuItem onclick={() => (closeMenu(), void saveTemplate())}>Save this as a template</MenuItem>
			{/snippet}
		</MenuButton>
		<span class="flex-1"></span>
		{#if reminder}
			<span class="mr-1 text-[12px] text-[var(--text-muted)]">Reminder {reminder.label.toLowerCase()}</span>
		{/if}
		<button type="button" class="icon-button" aria-label="Discard" onclick={() => composer.discard()} {@attach tooltip('Discard')}><Trash size={16} /></button>
	</footer>
</div>

<style>
	.composer {
		position: fixed;
		right: 20px;
		bottom: 20px;
		z-index: 40;
		display: flex;
		width: min(620px, calc(100vw - var(--sidebar-width) - 40px));
		height: min(600px, calc(100vh - 100px));
		flex-direction: column;
		border-radius: 24px;
		background: var(--popover);
		box-shadow: 0 28px 80px var(--shadow-soft), 0 0 0 1px var(--hairline);
		outline: none;
		transition:
			width 240ms var(--ease),
			height 240ms var(--ease);
	}

	.composer.expanded {
		width: min(980px, calc(100vw - var(--sidebar-width) - 40px));
		height: calc(100vh - 80px);
	}

	.small {
		height: 30px;
		width: 30px;
	}

	.field {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 10px;
		padding-inline: 18px 12px;
		box-shadow: inset 0 -1px 0 var(--hairline);
	}

	.label {
		width: 48px;
		flex: none;
		font-size: 13px;
		color: var(--text-muted);
	}

	.sender {
		height: 32px;
		min-width: 0;
		flex: 1;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding-inline: 12px;
		font-size: 13px;
		outline: none;
	}

	.subject {
		height: 42px;
		flex: 1;
		background: transparent;
		font-size: 14px;
		font-weight: 500;
		outline: none;
	}

	.subject::placeholder {
		color: var(--text-muted);
		font-weight: 400;
	}

	.copies {
		min-height: 28px;
		padding-inline: 10px;
		font-size: 12.5px;
	}

	.quote-toggle {
		min-height: 30px;
		padding-inline: 10px;
		font-size: 12.5px;
	}

	.quote {
		max-height: 180px;
		overflow-y: auto;
		margin-top: 6px;
		border-left: 2px solid var(--hairline);
		padding-left: 12px;
		font-size: 13px;
		color: var(--text-muted);
	}

	.attachment {
		display: inline-flex;
		max-width: 260px;
		align-items: center;
		gap: 8px;
		border-radius: 12px;
		background: var(--surface);
		padding: 6px 6px 6px 10px;
		font-size: 12.5px;
	}

	.attachment button {
		display: grid;
		height: 20px;
		width: 20px;
		flex: none;
		place-items: center;
		border-radius: 50%;
		color: var(--text-muted);
	}

	.send {
		display: flex;
		margin-right: 6px;
	}

	.send :global(.main) {
		border-radius: var(--radius-pill) 4px 4px var(--radius-pill);
		padding-inline: 18px 14px;
	}

	.send :global(.chevron) {
		margin-left: 2px;
		border-radius: 4px var(--radius-pill) var(--radius-pill) 4px;
		padding-inline: 8px 10px;
	}

	.divider {
		height: 20px;
		width: 1px;
		margin-inline: 4px;
		background: var(--hairline);
	}

	:global(.templates) {
		min-height: 32px;
		padding-inline: 10px;
		font-size: 12.5px;
	}

	:global(.icon-button.on) {
		color: var(--accent);
	}
</style>
