<script lang="ts">
	import { errorText, Row, Section } from '@luft/ui';
	import { commands, type CustomIcons, type Names } from '#lib/bindings.js';
	import { library } from '#lib/state/library.svelte.js';
	import RenameDialog from './RenameDialog.svelte';

	let { desktop }: { desktop: string } = $props();

	let custom = $state<CustomIcons | null>(null);
	let names = $state<Names | null>(null);
	let renaming = $state(false);
	let busy = $state(false);
	let problem = $state('');

	async function load() {
		[custom, names] = await Promise.all([
			commands.libraryCustomIcons({ desktop }).catch(() => null),
			commands.libraryNames({ desktop }).catch(() => null)
		]);
	}

	$effect(() => {
		void load();
	});

	const refresh = () => Promise.all([load(), library.refresh()]);

	async function change(action: () => Promise<unknown>) {
		busy = true;
		problem = '';
		try {
			await action();
			await refresh();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			busy = false;
		}
	}

	function renamed(changed: boolean) {
		renaming = false;
		if (changed) void refresh();
	}
</script>

<Section title="Name and icon">
	{#if names}
		<Row title="Name" description={names.custom ? `A name you chose, instead of “${names.own}”` : 'The one the app comes with'}>
			<span class="max-w-[220px] truncate text-[var(--text-muted)]">{names.custom ?? names.own}</span>
			<button type="button" class="button" disabled={busy} onclick={() => (renaming = true)}>Rename</button>
		</Row>
	{/if}
	<Row title="Icon" description={custom?.icon ? 'A picture you chose' : 'The one the app comes with'}>
		<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryChooseIcon({ desktop }))}>Change</button>
	</Row>
	<Row title="Symbolic icon" description={custom?.symbolic ? 'One you chose, for monochrome icon styles' : 'Drawn from the icon, for monochrome icon styles'}>
		<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryChooseSymbolicIcon({ desktop }))}>Change</button>
	</Row>
	{#if custom?.icon || custom?.symbolic}
		<Row title="Use the app's own icon" description="Puts back the icon it came with">
			<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryResetIcons({ desktop }))}>Reset</button>
		</Row>
	{/if}
</Section>

{#if problem}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}

{#if renaming && names}
	<RenameDialog {desktop} {names} onclose={renamed} />
{/if}
