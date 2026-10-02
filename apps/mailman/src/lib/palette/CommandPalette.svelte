<script lang="ts">
	import { topLayer } from '@luft/ui';
	import Search from '@lucide/svelte/icons/search';
	import type { Command } from '$lib/app/commands';
	import { list } from '$lib/mail/list.svelte';
	import { score } from './fuzzy';

	interface Props {
		commands: Command[];
		onsearch: (query: string) => void;
		onclose: () => void;
	}

	let { commands, onsearch, onclose }: Props = $props();

	const LIMIT = 9;

	let query = $state('');
	let highlighted = $state(0);
	let input = $state<HTMLInputElement>();

	let matches = $derived(
		commands
			.map((command) => ({ command, score: score(command.title, query) }))
			.filter((match) => match.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, LIMIT)
			.map((match) => match.command)
	);
	let options = $derived<Command[]>(query.trim() ? [...matches, { id: 'search-for', title: `Search mail for “${query.trim()}”`, keys: 'Enter', run: () => onsearch(query.trim()) }] : matches);

	$effect(() => {
		void query;
		highlighted = 0;
	});

	$effect(() => input?.focus());

	function run(command: Command) {
		onclose();
		command.run();
	}

	function keydown(event: KeyboardEvent) {
		event.stopPropagation();
		if (event.key === 'Escape') onclose();
		else if (event.key === 'ArrowDown') highlighted = (highlighted + 1) % options.length;
		else if (event.key === 'ArrowUp') highlighted = (highlighted - 1 + options.length) % options.length;
		else if (event.key === 'Enter' && options[highlighted]) run(options[highlighted]);
		else return;
		event.preventDefault();
	}
</script>

<div {@attach topLayer} class="overlay" role="presentation" onpointerdown={(event) => event.target === event.currentTarget && onclose()}>
	<div class="palette" role="dialog" aria-modal="true" aria-label="Commands">
		<label class="field">
			<Search size={17} class="flex-none text-[var(--text-muted)]" />
			<input bind:this={input} bind:value={query} placeholder={list.searching ? 'Type a command' : 'Type a command or search'} aria-label="Command" onkeydown={keydown} />
		</label>
		<div class="options" role="listbox" aria-label="Commands">
			{#each options as command, index (command.id)}
				<button type="button" role="option" aria-selected={index === highlighted} class="option" class:highlighted={index === highlighted} onpointerenter={() => (highlighted = index)} onclick={() => run(command)}>
					<span class="min-w-0 flex-1 truncate">{command.title}</span>
					{#if command.keys}
						<span class="keys">{#each command.keys.split(' ') as key, keyIndex (keyIndex)}<kbd>{key}</kbd>{/each}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		width: auto;
		height: auto;
		margin: 0;
		border: 0;
		padding: 0;
		color: inherit;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding-top: 14vh;
		background: rgba(8, 8, 7, 0.32);
		animation: fade 140ms var(--ease);
	}

	.palette {
		display: flex;
		width: min(560px, calc(100vw - 48px));
		flex-direction: column;
		overflow: hidden;
		border-radius: 24px;
		background: var(--popover);
		box-shadow: 0 28px 80px var(--shadow-soft);
		animation: rise 180ms var(--ease);
	}

	.field {
		display: flex;
		height: 56px;
		align-items: center;
		gap: 12px;
		padding-inline: 20px;
		box-shadow: inset 0 -1px 0 var(--hairline);
	}

	input {
		flex: 1;
		background: transparent;
		font-size: 15px;
		outline: none;
	}

	input::placeholder {
		color: var(--text-muted);
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px;
	}

	.option {
		display: flex;
		min-height: 40px;
		align-items: center;
		gap: 12px;
		border-radius: 14px;
		padding-inline: 14px 10px;
		text-align: left;
		font-size: 13.5px;
		color: var(--text-soft);
	}

	.option.highlighted {
		background: var(--surface-hover);
		color: var(--text);
	}

	.keys {
		display: flex;
		gap: 4px;
	}

	kbd {
		min-width: 22px;
		border-radius: 7px;
		background: var(--control);
		padding: 2px 6px;
		text-align: center;
		font-family: inherit;
		font-size: 11.5px;
		color: var(--text-muted);
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.99);
		}
	}
</style>
