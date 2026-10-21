<script lang="ts">
	import DateTimeSections from './datetime/DateTimeSections.svelte';
	import LanguageSection from './region/LanguageSection.svelte';
</script>

<DateTimeSections>
	{#snippet regional()}
		<LanguageSection />
	{/snippet}
</DateTimeSections>
