<script lang="ts">
	interface Props {
		wallpaper: string | null;
		scheme: 'light' | 'dark';
		rounded: boolean;
	}

	let { wallpaper, scheme, rounded }: Props = $props();
</script>

<span class="desktop {scheme}" class:rounded aria-hidden="true">
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}
	<span class="window">
		<span class="sidebar"></span>
		<span class="line wide"></span>
		<span class="line"></span>
		<span class="action"></span>
	</span>
	<span class="taskbar"></span>
</span>

<style>
	.desktop {
		position: absolute;
		inset: 0;
		container-type: size;
		--window: #fbfbf9;
		--side: #eeeeea;
		--line: rgba(27, 27, 25, 0.14);
		--bar: rgba(251, 251, 249, 0.86);
	}

	.desktop.dark {
		--window: #1c1c1a;
		--side: #151514;
		--line: rgba(243, 243, 239, 0.16);
		--bar: rgba(28, 28, 26, 0.86);
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.window {
		position: absolute;
		top: 14%;
		left: 12%;
		width: 64%;
		height: 60%;
		overflow: hidden;
		border-radius: 0;
		background: var(--window);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
	}

	.sidebar {
		position: absolute;
		inset: 0 auto 0 0;
		width: 30%;
		background: var(--side);
	}

	.line,
	.action {
		position: absolute;
		left: 38%;
		border-radius: 0;
	}

	.line {
		top: 34%;
		width: 34%;
		height: 7%;
		background: var(--line);
	}

	.line.wide {
		top: 18%;
		width: 50%;
	}

	.action {
		bottom: 14%;
		width: 24%;
		height: 13%;
		background: var(--accent);
	}

	.taskbar {
		position: absolute;
		right: 30%;
		bottom: 6%;
		left: 30%;
		height: 9%;
		border-radius: 0;
		background: var(--bar);
	}

	.rounded .window {
		border-radius: max(7px, 2.2cqw) !important;
	}

	.rounded .line,
	.rounded .action,
	.rounded .taskbar {
		border-radius: 999px !important;
	}
</style>
