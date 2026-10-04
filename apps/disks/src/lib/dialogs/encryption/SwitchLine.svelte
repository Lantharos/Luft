<script lang="ts">
	import { Switch } from '@luft/ui';
	import Line from './Line.svelte';

	interface Props {
		title: string;
		hint?: string;
		note?: string;
		checked: boolean;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	}

	let { title, hint, note, checked, disabled = false, onchange }: Props = $props();
</script>

<Line {title} {hint} {note} dimmed={disabled}>
	<Switch label={title} {checked} {disabled} {onchange} />
</Line>
