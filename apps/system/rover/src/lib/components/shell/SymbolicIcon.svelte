<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();
</script>

<span class="size-4 flex-none bg-current" style:mask={`url("${fileUrl(path)}") center / contain no-repeat`}></span>
