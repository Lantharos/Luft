<script lang="ts">
	import { t } from '@luft/i18n';
	import { Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { useWallpaperChoice } from './choice.svelte';
	import WallpaperGrid from './grid/WallpaperGrid.svelte';
	import { wallpaperLibrary } from './library.svelte';
	import { useScreenShape } from './screen.svelte.js';
	import WallpaperPanel from './WallpaperPanel.svelte';

	interface Props {
		group: string | null;
		onopen: (group: string | null) => void;
		onclose: () => void;
	}

	let { group, onopen, onclose }: Props = $props();

	const choice = useWallpaperChoice();
	const screen = useScreenShape();

	let opened = $derived(group ? wallpaperLibrary.group(group) : undefined);

	wallpaperLibrary.load();
</script>

{#if opened}
	<SubPage title={opened.name} onclose={() => onopen(null)}>
		<Section>
			<WallpaperGrid wallpapers={opened.wallpapers} {choice} shape={screen.aspect} />
		</Section>
	</SubPage>
{:else}
	<SubPage title={t('settings-appearance-wallpaper')} {onclose}>
		<WallpaperPanel {choice} shape={screen.aspect} {onopen} />
	</SubPage>
{/if}
