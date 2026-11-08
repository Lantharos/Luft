<script lang="ts">
	import { Dialog } from '@luft/ui';

	let { name, onclose, oninstall }: { name: string; onclose: () => void; oninstall: () => void } = $props();

	function install() {
		oninstall();
		onclose();
	}
</script>

<Dialog
	title="Install {name} into the system?"
	description="{name} brings a service or driver that only works as part of the system. It goes there instead of your tools container, starts with the computer and updates with Luft."
	{onclose}
>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" onclick={install}>Install</button>
	{/snippet}
</Dialog>
