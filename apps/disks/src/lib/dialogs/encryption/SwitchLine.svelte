<script lang="ts">
	import { Switch } from '@luft/ui';
	import Line from './Line.svelte';

	interface Props {
		title: string;
		description: string;
		checked: boolean;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	}

	let { title, description, checked, disabled = false, onchange }: Props = $props();
</script>

<Line {title} {description} dimmed={disabled}>
	<Switch label={title} {checked} {disabled} {onchange} />
</Line>
