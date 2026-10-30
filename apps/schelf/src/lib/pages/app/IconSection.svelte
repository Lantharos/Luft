<script lang="ts">
	import { errorText, Row, Section } from '@luft/ui';
	import { commands, type CustomIcons } from '#lib/bindings.js';
	import { library } from '#lib/state/library.svelte.js';

	let { desktop }: { desktop: string } = $props();

	let custom = $state<CustomIcons | null>(null);
	let busy = $state(false);
	let problem = $state('');

	async function load() {
		custom = await commands.libraryCustomIcons({ desktop }).catch(() => null);
	}

	$effect(() => {
		void load();
	});

	async function change(action: () => Promise<unknown>) {
		busy = true;
		problem = '';
		try {
			await action();
			await Promise.all([load(), library.refresh()]);
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			busy = false;
		}
	}
</script>

<Section title="Icon">
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
