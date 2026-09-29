<script lang="ts">
	import { NativeVideo } from '@lantharos/sabine';
	import { untrack, type Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'onerror'> {
		src: string;
		autoplay?: boolean;
		loop?: boolean;
		muted?: boolean;
		volume?: number;
		cutout?: Element;
		player?: NativeVideo | null;
		class?: ClassValue;
		children?: Snippet;
		onfail?: (message: string) => void;
	}

	let {
		src,
		autoplay = false,
		loop = false,
		muted = false,
		volume = 1,
		cutout,
		player = $bindable(null),
		class: className,
		children,
		onfail,
		...rest
	}: Props = $props();

	let surface = $state<HTMLDivElement>();

	$effect(() => {
		if (!surface) return;
		const options = untrack(() => ({ element: surface, cutout, autoplay, loop, muted, volume }));
		let created: NativeVideo | null = null;
		let closed = false;
		NativeVideo.create(src, options).then(
			(video) => {
				if (closed) return video.destroy();
				created = video;
				player = video;
				video.addEventListener('error', () => onfail?.(video.error?.message ?? ''));
			},
			(error: Error) => onfail?.(error.message)
		);
		return () => {
			closed = true;
			created?.destroy();
			player = null;
		};
	});
</script>

<div bind:this={surface} class={['native-video', className]} {...rest}>
	{@render children?.()}
</div>
