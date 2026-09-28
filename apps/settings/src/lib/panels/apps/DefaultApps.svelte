<script lang="ts">
	import type { Component } from 'svelte';
	import Calendar from '@lucide/svelte/icons/calendar';
	import FileText from '@lucide/svelte/icons/file-text';
	import Film from '@lucide/svelte/icons/film';
	import Folder from '@lucide/svelte/icons/folder';
	import Globe from '@lucide/svelte/icons/globe';
	import Image from '@lucide/svelte/icons/image';
	import Mail from '@lucide/svelte/icons/mail';
	import Music from '@lucide/svelte/icons/music';
	import { AppIcon, Row, Section, Select } from '@luft/ui';
	import { defaults, setDefault, type Category, type Handler } from './api';

	const CATEGORIES: Record<Category, { title: string; icon: Component }> = {
		browser: { title: 'Web browser', icon: Globe },
		email: { title: 'Email', icon: Mail },
		calendar: { title: 'Calendar', icon: Calendar },
		music: { title: 'Music', icon: Music },
		video: { title: 'Videos', icon: Film },
		photos: { title: 'Photos', icon: Image },
		text: { title: 'Text editor', icon: FileText },
		files: { title: 'Files', icon: Folder }
	};

	let handlers = $state<Handler[]>([]);

	async function load() {
		handlers = await defaults();
	}

	async function choose(handler: Handler, app: string) {
		handler.current = app;
		try {
			await setDefault(handler.category, app);
		} finally {
			await load();
		}
	}

	void load();
</script>

<Section title="Default apps" description="Used when you open links, files, and folders">
	{#each handlers as handler (handler.category)}
		{@const category = CATEGORIES[handler.category]}
		{@const current = handler.apps.find((app) => app.id === handler.current)}
		<Row title={category.title} icon={category.icon}>
			{#if current}
				<AppIcon icon={current.icon} size={24} />
			{/if}
			<Select
				label={category.title}
				placeholder={handler.apps.length ? 'Choose' : 'None installed'}
				disabled={!handler.apps.length}
				options={handler.apps.map((app) => ({ value: app.id, label: app.name }))}
				value={handler.current ?? ''}
				onchange={(app) => choose(handler, app)}
			/>
		</Row>
	{/each}
</Section>
