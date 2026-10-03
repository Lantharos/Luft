<script lang="ts">
	import Disc3 from '@lucide/svelte/icons/disc-3';
	import FileBox from '@lucide/svelte/icons/file-box';
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import MemoryStick from '@lucide/svelte/icons/memory-stick';
	import Usb from '@lucide/svelte/icons/usb';
	import type { Kind } from '#lib/api.js';

	interface Props {
		kind: Kind;
		size?: number;
	}

	let { kind, size = 18 }: Props = $props();

	const ICONS = { nvme: HardDrive, ssd: HardDrive, hdd: HardDrive, usb: Usb, card: MemoryStick, optical: Disc3, image: FileBox };
	let Icon = $derived(ICONS[kind]);
</script>

<Icon {size} />
