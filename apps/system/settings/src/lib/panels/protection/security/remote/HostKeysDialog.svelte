<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { HostKey } from '#lib/bindings.js';
	import { keyKind } from './describe';

	let { keys, onclose }: { keys: HostKey[]; onclose: () => void } = $props();
</script>

<Dialog title={t('settings-remote-login-host-keys')} description={t('settings-remote-login-host-keys-explained')} wide {onclose}>
	<dl class="flex flex-col gap-3">
		{#each keys as key (key.fingerprint)}
			<div class="flex flex-col gap-1">
				<dt class="text-[13px] text-[var(--text-muted)]">{keyKind(key.kind)}</dt>
				<dd class="font-mono text-[13px] break-all select-text">{key.fingerprint}</dd>
			</div>
		{/each}
	</dl>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('settings-protection-close')}</button>
	{/snippet}
</Dialog>
