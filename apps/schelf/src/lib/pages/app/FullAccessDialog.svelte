<script lang="ts">
	import { Dialog } from '@luft/ui';

	let { name, onconfirm, onclose }: { name: string; onconfirm: () => void; onclose: () => void } = $props();
</script>

<Dialog
	title="Give {name} full access?"
	description="{name} will be able to see and change all your files, read the clipboard in the background, control other apps' windows and act like an app installed on the system. Only give full access to apps you trust. It takes effect the next time {name} opens."
	{onclose}
>
	{#snippet actions()}
		<button type="button" class="button" data-autofocus onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" onclick={onconfirm}>Give full access</button>
	{/snippet}
</Dialog>
