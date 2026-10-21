<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';
	import { openDisks } from '#lib/panels/system/system/about/api.js';
	import type { Drives } from '../api';
	import { percent } from './describe';

	let { drives }: { drives: Drives } = $props();

	let description = $derived.by(() => {
		const changing = drives.changing;
		if (changing) {
			const args = { percent: percent(changing.progress) };
			const paused = changing.state === 'paused';
			if (changing.change === 'decrypt')
				return paused ? t('settings-encryption-drive-decrypting-paused', args) : t('settings-encryption-drive-decrypting', args);
			return paused ? t('settings-encryption-drive-encrypting-paused', args) : t('settings-encryption-drive-encrypting', args);
		}
		if (drives.autoUnlock) return t('settings-encryption-drives-auto-unlock', { count: drives.autoUnlock });
		return t('settings-encryption-drives-hint');
	});
</script>

<Row title={t('settings-encryption-drives')} {description} icon={HardDrive}>
	<button type="button" class="button" onclick={openDisks}>{t('settings-encryption-drives-open')}</button>
</Row>
