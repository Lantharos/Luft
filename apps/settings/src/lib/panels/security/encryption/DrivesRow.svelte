<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import { Row } from '@luft/ui';
	import { openDisks } from '#lib/panels/about/api.js';
	import type { Drives } from '../api';

	let { drives }: { drives: Drives } = $props();

	let description = $derived.by(() => {
		const changing = drives.changing;
		if (changing) {
			const verb = changing.change === 'decrypt' ? 'Decrypting' : 'Encrypting';
			const done = `${Math.floor(changing.progress * 100)}% done`;
			return changing.state === 'paused' ? `${verb} a drive, paused at ${done.replace(' done', '')}` : `${verb} a drive, ${done}`;
		}
		if (drives.autoUnlock) return `${drives.autoUnlock} encrypted ${drives.autoUnlock === 1 ? 'drive unlocks' : 'drives unlock'} with this computer`;
		return 'Encrypt other drives and USB sticks in Disks';
	});
</script>

<Row title="Other drives" {description} icon={HardDrive}>
	<button type="button" class="button" onclick={openDisks}>Open Disks</button>
</Row>
