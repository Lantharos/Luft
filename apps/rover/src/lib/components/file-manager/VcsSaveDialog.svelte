<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import VcsBadge from '$lib/components/file-manager/VcsBadge.svelte';
	import { primaryActionLabel } from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		vcs: VcsState;
	}

	let { vcs }: Props = $props();
	let message = $state('');
	let selected = $state.raw<string[]>([]);
	let messageInput = $state<HTMLInputElement>();

	let files = $derived(vcs.changedFiles);
	let actionLabel = $derived(primaryActionLabel(vcs.project));
	let canChooseFiles = $derived(Boolean(vcs.project));
	let selectedCount = $derived(selected.length);
	let canSubmit = $derived(Boolean(message.trim()) && selectedCount > 0 && !vcs.busy);

	$effect(() => {
		if (!vcs.saveDialogOpen) return;
		message = '';
		selected = vcs.saveFiles ?? files.map((file) => file.path);
		void tick().then(() => messageInput?.focus());
	});

	function toggle(path: string) {
		if (!canChooseFiles) return;
		selected = selected.includes(path) ? selected.filter((item) => item !== path) : [...selected, path];
	}

	function close() {
		if (vcs.busy) return;
		vcs.saveDialogOpen = false;
		vcs.saveFiles = null;
	}

	function submit() {
		if (!canSubmit) return;
		void vcs.save(message.trim(), selected);
	}
</script>

{#if vcs.saveDialogOpen && vcs.project}
	<div class="fixed inset-0 z-[90] grid place-items-center bg-black/28 px-4">
		<button class="absolute inset-0 h-full w-full" type="button" aria-label="Cancel" onclick={close}></button>
		<section
			class="relative z-10 flex max-h-[min(680px,calc(100dvh-32px))] w-[520px] max-w-full flex-col rounded-[18px] bg-[var(--surface)] text-[var(--text)] shadow-[0_24px_80px_var(--shadow-soft),inset_0_1px_0_var(--hairline)]"
			aria-label={`${actionLabel} changes`}
		>
			<header class="flex h-[52px] shrink-0 items-center justify-between gap-3 px-4 shadow-[inset_0_-1px_0_var(--hairline)]">
				<div class="text-[14px] font-medium">{actionLabel} changes</div>
				<button class="tool-button" type="button" aria-label="Close" onclick={close}>
					<Icon name="x" size={16} />
				</button>
			</header>

			<div class="grid gap-4 px-4 py-4">
				<label class="grid gap-2">
					<span class="text-[12px] text-[var(--text-muted)]">Message</span>
					<input
						bind:this={messageInput}
						class="h-11 rounded-[14px] bg-[var(--control)] px-3 text-[14px] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] outline-none transition-[background-color,box-shadow] duration-150 focus:bg-[var(--control-hover)] focus:shadow-[inset_0_0_0_1px_rgba(245,245,242,0.18)]"
						value={message}
						placeholder={vcs.project.kind === 'pig' ? 'Save VCS status support' : 'Add VCS status support'}
						oninput={(event) => (message = event.currentTarget.value)}
						onkeydown={(event) => event.key === 'Enter' && submit()}
					/>
				</label>

				<div class="grid gap-2">
					<div class="flex items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
						<span>Files</span>
						<span>{selectedCount} selected</span>
					</div>
					<div class="soft-scroll max-h-[280px] overflow-auto rounded-[14px] bg-[var(--content)] p-1 shadow-[inset_0_0_0_1px_var(--hairline)]">
						{#each files as file (file.path)}
							<button
								class="flex min-h-10 w-full items-center gap-2 rounded-[12px] px-2 text-left text-[13px] text-[var(--text-soft)] transition-[background-color,color,opacity] duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
								type="button"
								aria-pressed={selected.includes(file.path)}
								disabled={!canChooseFiles}
								onclick={() => toggle(file.path)}
							>
								<span
									class={[
										'grid h-5 w-5 shrink-0 place-items-center rounded-[7px] shadow-[inset_0_0_0_1px_var(--hairline)]',
										selected.includes(file.path) ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--control)]'
									]}
								>
									{#if selected.includes(file.path)}
										<Icon name="check" size={13} />
									{/if}
								</span>
								<VcsBadge status={file.status} />
								<span class="min-w-0 flex-1 truncate">{file.path}</span>
							</button>
						{/each}
					</div>
				</div>

				{#if vcs.error}
					<div class="rounded-[14px] bg-[rgba(224,170,170,0.12)] px-3 py-2 text-[12px] text-[var(--danger)]">
						{vcs.error}
					</div>
				{/if}
			</div>

			<footer class="flex shrink-0 justify-end gap-2 px-4 py-4 shadow-[inset_0_1px_0_var(--hairline)]">
				<button class="command-button" type="button" disabled={Boolean(vcs.busy)} onclick={close}>Cancel</button>
				<button class="command-button" type="button" disabled={!canSubmit} onclick={submit}>
					{vcs.busy === 'save' ? `${actionLabel}...` : actionLabel}
				</button>
			</footer>
		</section>
	</div>
{/if}
