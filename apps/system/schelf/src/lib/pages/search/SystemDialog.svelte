<script lang="ts">
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';

	let { name, onclose, oninstall }: { name: string; onclose: () => void; oninstall: () => void } = $props();

	function install() {
		oninstall();
		onclose();
	}
</script>

<ConsentDialog
	title="Install {name} for the whole computer?"
	description="{name} brings a service or driver that only works as part of the system."
	facts={['Installs for everyone on this computer', 'Starts with the computer', 'Updates with Luft']}
	confirm="Install"
	onconfirm={install}
	{onclose}
/>
