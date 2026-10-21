<script lang="ts">
	import { Dialog, Row, Section, TextField } from '@luft/ui';
	import type { AddedSource, CheckedSource } from '#lib/bridge/types.js';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import TrustDialog from '#lib/components/TrustDialog.svelte';
	import { backend } from '#lib/bridge/index.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let sources = $state<AddedSource[] | null>(null);
	let address = $state('');
	let checking = $state(false);
	let error = $state<string | null>(null);
	let trusting = $state<CheckedSource | null>(null);
	let removing = $state<AddedSource | null>(null);

	const key = (source: AddedSource) => `repository/${source.file}`;

	async function refresh() {
		sources = await backend
			.sources()
			.catch((reason) => {
				error = String(reason);
				return [];
			});
	}

	$effect(() => {
		void library.installed;
		void refresh();
	});

	async function check() {
		if (!address.trim() || checking) return;
		checking = true;
		error = null;
		try {
			const checked = await backend.fetchSource(address.trim());
			if (checked.added) error = `${checked.described.sources[0]?.name ?? checked.described.file} is already a software source.`;
			else trusting = checked;
		} catch (reason) {
			error = String(reason);
		} finally {
			checking = false;
		}
	}

	async function add(source: CheckedSource) {
		trusting = null;
		checking = true;
		try {
			await backend.addSource(source.draft);
			address = '';
			await refresh();
		} catch (reason) {
			error = String(reason);
		} finally {
			checking = false;
		}
	}

	function remove(source: AddedSource) {
		removing = null;
		void operations.run(key(source), source.name, { kind: 'removeRepository', file: source.file });
	}

	const removal = $derived.by(() => {
		if (!removing) return '';
		const packages = removing.packages;
		if (!packages.length) return 'Nothing installed comes from it. You can add it again later.';
		return `This also removes ${packages.join(', ')} from the system, with everything ${packages.length === 1 ? 'it' : 'they'} added.`;
	});
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
		<p class="px-2 text-[14px] text-[var(--text-soft)]">
			Software sources are vendors' package repositories, such as Docker's or 1Password's. Their packages install as system packages, checked against the
			source's key, and update with Luft.
		</p>

		<Section title="Add a source" description="The address of its .repo file, a COPR project as copr:owner/project, or 1password, docker, google-chrome, vscode or claude-desktop.">
			<Row title="Source">
				<div class="flex items-center gap-2">
					<div class="w-[320px]">
						<TextField
							bind:value={address}
							label="Source"
							placeholder="copr:owner/project"
							disabled={checking}
							onkeydown={(event) => event.key === 'Enter' && check()}
						/>
					</div>
					<button type="button" class="button primary" disabled={!address.trim() || checking} onclick={check}>{checking ? 'Checking…' : 'Add'}</button>
				</div>
			</Row>
		</Section>
		{#if error}
			<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
		{/if}

		{#if sources === null}
			<div class="skeleton h-20 w-full"></div>
		{:else if sources.length}
			<Section title="Added">
				{#each sources as source (source.file)}
					{@const operation = operations.forKey(key(source))}
					<Row
						title={source.name}
						description={operation?.state === 'failed' ? operation.error! : [source.url, source.packages.length ? `Installed from it: ${source.packages.join(', ')}` : ''].filter(Boolean).join(' · ')}
						truncate
					>
						{#if operation && operation.state !== 'failed'}
							<ProgressButton {operation} />
						{:else}
							<button type="button" class="button" onclick={() => (removing = source)}>Remove</button>
						{/if}
					</Row>
				{/each}
			</Section>
		{/if}
	</div>
</div>

{#if trusting}
	<TrustDialog source={trusting} onconfirm={() => add(trusting!)} onclose={() => (trusting = null)} />
{/if}

{#if removing}
	<Dialog title="Remove {removing.name}?" description={removal} onclose={() => (removing = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>Cancel</button>
			<button type="button" class="button danger" onclick={() => remove(removing!)}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
