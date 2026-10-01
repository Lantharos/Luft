<script lang="ts" module>
	export const COLLAPSED = 5;
</script>

<script lang="ts">
	import { Row } from '@luft/ui';

	let { hidden, expanded = $bindable() }: { hidden: number; expanded: boolean } = $props();
</script>

<Row title={expanded ? 'Show fewer' : `Show ${hidden} more`} {expanded} onclick={() => (expanded = !expanded)} />
