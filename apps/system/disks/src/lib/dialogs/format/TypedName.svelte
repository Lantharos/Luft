<script lang="ts">
	import { t } from '@luft/i18n';
	import { TextField } from '@luft/ui';

	interface Props {
		name: string;
		matches: boolean;
	}

	let { name, matches = $bindable() }: Props = $props();

	let typed = $state('');

	$effect.pre(() => {
		matches = typed.trim().toLowerCase() === name.trim().toLowerCase();
	});
</script>

<div class="flex flex-col gap-2">
	<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">{t('disks-typed-name', { name })}</p>
	<TextField label={t('disks-typed-name-label')} placeholder={name} bind:value={typed} />
</div>
