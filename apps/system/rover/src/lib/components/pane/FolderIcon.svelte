<script lang="ts">
	import Folder from '@luft/symbols/icons/folder';
	import FolderDocuments from '@luft/symbols/icons/folder-documents';
	import FolderDownload from '@luft/symbols/icons/folder-download';
	import FolderMusic from '@luft/symbols/icons/folder-music';
	import FolderPictures from '@luft/symbols/icons/folder-pictures';
	import FolderVideos from '@luft/symbols/icons/folder-videos';
	import type { Component } from 'svelte';
	import { ICONS } from '#lib/features/looks/catalogue.js';

	interface Props {
		glyph: string;
		size: number;
	}

	let { glyph, size }: Props = $props();
	const mask = $props.id();

	const DRAWN: Record<string, Component> = {
		folder: Folder,
		'file-text': FolderDocuments,
		download: FolderDownload,
		music: FolderMusic,
		image: FolderPictures,
		video: FolderVideos
	};
	const GLYPH_SIZE = 7.5;
	const GLYPH_CENTER = [8, 10.83];

	let Drawn = $derived(DRAWN[glyph] ?? (ICONS[glyph] ? null : Folder));
	let Glyph = $derived(ICONS[glyph]?.icon);
</script>

{#if Drawn}
	<Drawn {size} />
{:else}
	<svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
		<mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
			<rect width="16" height="16" fill="white" />
			<Glyph size={GLYPH_SIZE} x={GLYPH_CENTER[0] - GLYPH_SIZE / 2} y={GLYPH_CENTER[1] - GLYPH_SIZE / 2} color="black" />
		</mask>
		<g mask="url(#{mask})"><Folder size={16} /></g>
	</svg>
{/if}
