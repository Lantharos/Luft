<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';
	import type { Disk } from '#lib/bindings.js';
	import { unlockSummary } from './describe';

	let { disk }: { disk: Disk } = $props();
</script>

<Row title={t('settings-encryption')} description={disk.encrypted ? unlockSummary(disk) : t('settings-encryption-not-encrypted')} icon={LockKeyhole} />
