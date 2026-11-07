<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { Choice } from '@luft/ui';
	import type { LuftPage } from '#lib/bindings.js';
	import * as meet from '#lib/bridge/meet.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	function open(page: LuftPage) {
		void session.run('open', () => meet.openOnLuft(page), () => open(page));
	}
</script>

<Frame title={t('on-luft-title')} description={t('on-luft-description')}>
	<div class="-mx-2 flex flex-col gap-1">
		<Choice icon={HardDrive} title={t('on-luft-space-title')} description={t('on-luft-space-description')} onclick={() => open('space')} />
		<Choice icon={RefreshCw} title={t('on-luft-updates-title')} description={t('on-luft-updates-description')} onclick={() => open('updates')} />
		<Choice icon={Usb} title={t('stick-title')} description={t('ready-stick-description')} onclick={() => maker.open()} />
	</div>
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{/if}
</Frame>
