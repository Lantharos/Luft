<script lang="ts">
	import Disc3 from '@luft/symbols/icons/disc-3';
	import FileBox from '@luft/symbols/icons/file-box';
	import HardDrive from '@luft/symbols/icons/hard-drive';
	import MemoryStick from '@luft/symbols/icons/memory-stick';
	import Usb from '@luft/symbols/icons/usb';
	import type { DriveKind } from '#lib/bindings.js';

	interface Props {
		kind: DriveKind;
		size?: number;
	}

	let { kind, size = 18 }: Props = $props();

	const ICONS = { nvme: HardDrive, ssd: HardDrive, hdd: HardDrive, usb: Usb, card: MemoryStick, optical: Disc3, image: FileBox };
	let Icon = $derived(ICONS[kind]);
</script>

<Icon {size} />
