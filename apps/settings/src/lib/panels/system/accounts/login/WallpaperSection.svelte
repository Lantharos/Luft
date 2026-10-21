<script lang="ts">
	import { t } from '@luft/i18n';
	import { fileUrl } from '@lantharos/sabine';
	import { Row, Section, Segmented } from '@luft/ui';
	import { thumbnail } from '#lib/panels/personalization/appearance/wallpaper/api.js';

	interface Props {
		wallpaper: string | null;
		version: number;
		onchoose: () => void;
		onclear: () => void;
	}

	let { wallpaper, version, onchoose, onclear }: Props = $props();

	let preview = $state<string | null>(null);

	$effect(() => {
		void version;
		if (!wallpaper) return;
		void thumbnail(wallpaper).then((path) => (preview = fileUrl(path)));
	});

	function pick(choice: string) {
		if (choice === 'shared') onchoose();
		else onclear();
	}
</script>

<Section>
	<Row
		title={t('settings-login-wallpaper')}
		description={wallpaper ? t('settings-login-wallpaper-shared-description') : t('settings-login-wallpaper-own-description')}
	>
		<Segmented
			label={t('settings-login-wallpaper-label')}
			options={[
				{ value: 'own', label: t('settings-login-wallpaper-own') },
				{ value: 'shared', label: t('settings-login-wallpaper-shared') }
			]}
			value={wallpaper ? 'shared' : 'own'}
			onchange={pick}
		/>
	</Row>
	{#if wallpaper}
		<Row title={t('settings-login-picture')} description={t('settings-login-picture-description')}>
			<span class="preview">
				{#if preview}
					<img src={preview} alt="" decoding="async" />
				{/if}
			</span>
			<button type="button" class="button" onclick={onchoose}>{t('settings-login-picture-change')}</button>
		</Row>
	{/if}
</Section>

<style>
	.preview {
		height: 60px;
		width: 96px;
		overflow: hidden;
		border-radius: 10px;
		background: var(--control);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		animation: appear var(--motion-standard) var(--ease-decelerate);
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
