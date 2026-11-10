<script lang="ts">
	import type { Access } from '#lib/app/permissions.js';
	import ConsentDialog from './ConsentDialog.svelte';

	let { name, access, onconfirm, onclose }: { name: string; access: Access[]; onconfirm: () => void; onclose: () => void } = $props();
</script>

<ConsentDialog
	title="Install {name}?"
	description="{name} runs in a sandbox, but asks for more than most apps need. It can use:"
	{access}
	confirm="Install"
	{onconfirm}
	{onclose}
/>
