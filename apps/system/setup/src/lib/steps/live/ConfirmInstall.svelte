<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog } from '@luft/ui';
	import type { Target } from '#lib/bindings.js';
	import { install } from '#lib/state/install.svelte.js';

	let { target, onconfirm, onclose }: { target: Target; onconfirm: () => void; onclose: () => void } = $props();

	let system = $derived(target.kind === 'replace' ? (install.systems.find((found) => found.id === target.system) ?? null) : null);
	let drive = $derived(install.drive(target.kind === 'replace' ? (system?.drive ?? '') : target.drive));
	let meet = $derived(install.meet);
	let meetElsewhere = $derived(!!meet?.otherDrive && !!install.drive(meet.drive));
	let erasing = $derived(target.kind === 'whole' && drive?.partitions !== 0);

	let title = $derived.by(() => {
		if (!drive) return '';
		if (target.kind === 'replace') return t('setup-confirm-replace-title', { system: system?.name ?? 'Linux' });
		if (target.kind === 'whole') return t(erasing ? 'setup-confirm-erase-title' : 'setup-confirm-empty-title', { drive: drive.name });
		if (target.kind === 'alongside') return t('setup-confirm-shrink-title', { size: bytes(drive.windows!.size - target.size) });
		if (meet?.space && meetElsewhere) return t('setup-confirm-meet-drive-title', { drive: drive.name });
		return t(meet?.space ? 'setup-confirm-meet-title' : 'setup-confirm-free-title');
	});

	let description = $derived.by(() => {
		if (target.kind === 'replace') return t(system?.keepsOld ? 'setup-confirm-replace-keep-old' : 'setup-confirm-replace-erase-old');
		if (target.kind === 'whole') return t(erasing ? 'setup-confirm-erase-description' : 'setup-confirm-empty-description');
		return t('setup-confirm-install-description');
	});

	let confirm = $derived.by(() => {
		if (erasing) return 'setup-confirm-erase';
		return target.kind === 'replace' ? 'setup-destination-replace' : 'setup-confirm-install';
	});
</script>

{#if drive}
	<Dialog {title} {description} {onclose}>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>{t('setup-cancel')}</button>
			<button type="button" class="button {erasing ? 'danger' : 'primary'}" onclick={onconfirm}>{t(confirm)}</button>
		{/snippet}
	</Dialog>
{/if}
