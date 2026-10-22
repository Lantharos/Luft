<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog } from '@luft/ui';
	import type { Target } from '#lib/bridge/installer.js';
	import { install } from '#lib/state/install.svelte.js';

	let { target, onconfirm, onclose }: { target: Target; onconfirm: () => void; onclose: () => void } = $props();

	let system = $derived(target.kind === 'replace' ? (install.systems.find((found) => found.id === target.system) ?? null) : null);
	let drive = $derived(install.drive(target.kind === 'replace' ? (system?.drive ?? '') : target.drive));
	let meet = $derived(install.meet);
	let meetElsewhere = $derived(!!meet?.otherDrive && !!install.drive(meet.drive));

	let title = $derived.by(() => {
		if (!drive) return '';
		if (target.kind === 'replace') return t('setup-confirm-replace-title', { system: system?.name ?? 'Linux' });
		if (target.kind === 'whole') return t('setup-confirm-erase-title', { drive: drive.name });
		if (target.kind === 'alongside') return t('setup-confirm-shrink-title', { size: bytes(drive.windows!.size - target.size) });
		if (meet?.space && meetElsewhere) return t('setup-confirm-meet-drive-title', { drive: drive.name });
		return t(meet?.space ? 'setup-confirm-meet-title' : 'setup-confirm-free-title');
	});

	let description = $derived.by(() => {
		if (target.kind === 'replace') return t(system?.keepsOld ? 'setup-confirm-replace-keep-old' : 'setup-confirm-replace-erase-old');
		return t(target.kind === 'whole' ? 'setup-confirm-erase-description' : 'setup-confirm-install-description');
	});
</script>

{#if drive}
	<Dialog {title} {description} {onclose}>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>{t('setup-cancel')}</button>
			<button type="button" class="button {target.kind === 'whole' ? 'danger' : 'primary'}" onclick={onconfirm}>
				{t(target.kind === 'whole' ? 'setup-confirm-erase' : target.kind === 'replace' ? 'setup-destination-replace' : 'setup-confirm-install')}
			</button>
		{/snippet}
	</Dialog>
{/if}
