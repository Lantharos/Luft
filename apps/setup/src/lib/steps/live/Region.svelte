<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import Languages from '@lucide/svelte/icons/languages';
	import Picker from '#lib/components/Picker.svelte';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { regional } from '#lib/state/regional.svelte.js';

	let zone = $derived(regional.zoneEntry);
</script>

<StepFrame title="Welcome to Luft" description={regional.description}>
	<div class="flex flex-col gap-2.5">
		<Picker
			icon={Languages}
			label="Language"
			value={regional.language.name}
			items={regional.languages}
			key={(language) => language.locale}
			name={(language) => language.name}
			selected={regional.language.locale}
			onchoose={(language) => regional.chooseLanguage(language)}
		/>
		<Picker
			icon={Keyboard}
			label="Keyboard"
			value={regional.keyboardName}
			items={regional.catalog.keyboards}
			key={(keyboard) => `${keyboard.layout}+${keyboard.variant}`}
			name={(keyboard) => keyboard.name}
			selected={`${regional.keyboard.layout}+${regional.keyboard.variant}`}
			onchoose={(keyboard) => regional.chooseKeyboard(keyboard)}
		/>
		<Picker
			icon={Clock}
			label="Time zone"
			value={zone ? `${zone.city}, ${zone.country}` : regional.zone}
			items={regional.catalog.zones}
			key={(entry) => entry.id}
			name={(entry) => entry.city}
			detail={(entry) => entry.country}
			selected={regional.zone}
			onchoose={(entry) => regional.chooseZone(entry)}
		/>
	</div>
	{#snippet actions()}
		<button type="button" class="button primary large px-6" onclick={() => flow.next()}>Continue</button>
	{/snippet}
</StepFrame>
