<script lang="ts" module>
	export type IconName =
		| 'home' | 'star' | 'hard-drive' | 'trash'
		| 'download' | 'file-text' | 'image' | 'video'
		| 'folder' | 'file' | 'chevron-right'
		| 'chevron-up' | 'folder-open' | 'monitor'
		| 'arrow-left' | 'arrow-right' | 'x'
		| 'plus' | 'scissors' | 'copy' | 'clipboard' | 'trash-2'
		| 'list' | 'grid' | 'columns' | 'sort-asc' | 'sort-desc'
		| 'music' | 'archive' | 'code' | 'eye' | 'eye-off' | 'pin'
		| 'refresh' | 'external-link' | 'package'
		| 'check' | 'alert-circle' | 'edit' | 'pause' | 'play'
		| 'folder-plus' | 'file-plus' | 'upload' | 'eject' | 'usb' | 'save' | 'server' | 'smartphone' | 'globe'
		| 'clock' | 'panel-right' | 'more-horizontal' | 'chevron-left' | 'chevron-down'
		| 'volume' | 'volume-x'
		| 'git-branch' | 'arrow-up' | 'columns-3' | 'link' | 'lock' | 'search' | 'minus' | 'folder-x'
		| 'terminal' | 'info' | 'copy-plus' | 'package-open';
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		size?: number;
		class?: string;
	}

	let { name, size = 20, class: className = '' }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	{#if name === 'home'}
		<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
		<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
	{:else if name === 'star'}
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	{:else if name === 'hard-drive'}
		<line x1="22" x2="2" y1="12" y2="12" />
		<path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
		<line x1="6" x2="6.01" y1="16" y2="16" />
		<line x1="10" x2="10.01" y1="16" y2="16" />
	{:else if name === 'trash'}
		<path d="M3 6h18" />
		<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
		<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
	{:else if name === 'trash-2'}
		<path d="M3 6h18" />
		<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
		<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
		<line x1="10" x2="10" y1="11" y2="17" />
		<line x1="14" x2="14" y1="11" y2="17" />
	{:else if name === 'download'}
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="7 10 12 15 17 10" />
		<line x1="12" x2="12" y1="15" y2="3" />
	{:else if name === 'upload'}
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="17 8 12 3 7 8" />
		<line x1="12" x2="12" y1="3" y2="15" />
	{:else if name === 'eject'}
		<path d="m7 11 5-5 5 5" />
		<path d="M5 15h14" />
	{:else if name === 'usb'}
		<circle cx="10" cy="7" r="1" />
		<circle cx="4" cy="20" r="1" />
		<path d="M4.7 19.3 19 5" />
		<path d="m21 3-3 1 2 2Z" />
		<path d="M9.26 7.68 5 12l2 5" />
		<path d="m10 14 5 2 3.5-3.5" />
		<path d="m18 12 1-1 1 1-1 1Z" />
	{:else if name === 'server'}
		<rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
		<rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
		<line x1="6" x2="6.01" y1="6" y2="6" />
		<line x1="6" x2="6.01" y1="18" y2="18" />
	{:else if name === 'smartphone'}
		<rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
		<path d="M12 18h.01" />
	{:else if name === 'globe'}
		<circle cx="12" cy="12" r="10" />
		<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
		<path d="M2 12h20" />
	{:else if name === 'file-text'}
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="16" x2="8" y1="13" y2="13" />
		<line x1="16" x2="8" y1="17" y2="17" />
		<line x1="10" x2="8" y1="9" y2="9" />
	{:else if name === 'image'}
		<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
		<circle cx="9" cy="9" r="2" />
		<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
	{:else if name === 'video'}
		<path d="m22 8-6 4 6 4V8Z" />
		<rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
	{:else if name === 'music'}
		<path d="M9 18V5l12-2v13" />
		<circle cx="6" cy="18" r="3" />
		<circle cx="18" cy="16" r="3" />
	{:else if name === 'folder'}
		<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
	{:else if name === 'folder-open'}
		<path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.8 2.9l-2.2 4.4A3 3 0 0 1 16.92 19H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2A2 2 0 0 0 13.1 6H19a2 2 0 0 1 2 2v2" />
	{:else if name === 'folder-plus'}
		<path d="M12 10v6" />
		<path d="M9 13h6" />
		<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
	{:else if name === 'file'}
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14 2 14 8 20 8" />
	{:else if name === 'file-plus'}
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="12" x2="12" y1="18" y2="12" />
		<line x1="9" x2="15" y1="15" y2="15" />
	{:else if name === 'chevron-right'}
		<path d="m9 18 6-6-6-6" />
	{:else if name === 'chevron-up'}
		<path d="m18 15-6-6-6 6" />
	{:else if name === 'arrow-left'}
		<path d="m12 19-7-7 7-7" />
		<path d="M19 12H5" />
	{:else if name === 'arrow-right'}
		<path d="M5 12h14" />
		<path d="m12 5 7 7-7 7" />
	{:else if name === 'x'}
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	{:else if name === 'plus'}
		<path d="M5 12h14" />
		<path d="M12 5v14" />
	{:else if name === 'pause'}
		<rect width="4" height="16" x="6" y="4" rx="1" />
		<rect width="4" height="16" x="14" y="4" rx="1" />
	{:else if name === 'play'}
		<polygon points="6 3 20 12 6 21 6 3" />
	{:else if name === 'scissors'}
		<circle cx="6" cy="6" r="3" />
		<path d="M8.12 8.12 12 12" />
		<path d="M20 4 8.12 15.88" />
		<circle cx="6" cy="18" r="3" />
		<path d="M14.8 14.8 20 20" />
	{:else if name === 'copy'}
		<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	{:else if name === 'clipboard'}
		<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
		<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
	{:else if name === 'list'}
		<line x1="8" x2="21" y1="6" y2="6" />
		<line x1="8" x2="21" y1="12" y2="12" />
		<line x1="8" x2="21" y1="18" y2="18" />
		<line x1="3" x2="3.01" y1="6" y2="6" />
		<line x1="3" x2="3.01" y1="12" y2="12" />
		<line x1="3" x2="3.01" y1="18" y2="18" />
	{:else if name === 'grid'}
		<rect width="7" height="7" x="3" y="3" rx="1" />
		<rect width="7" height="7" x="14" y="3" rx="1" />
		<rect width="7" height="7" x="14" y="14" rx="1" />
		<rect width="7" height="7" x="3" y="14" rx="1" />
	{:else if name === 'columns'}
		<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
		<line x1="12" x2="12" y1="3" y2="21" />
	{:else if name === 'sort-asc'}
		<path d="m3 8 4-4 4 4" />
		<path d="M7 4v16" />
		<path d="M11 12h4" />
		<path d="M11 16h7" />
		<path d="M11 20h10" />
	{:else if name === 'sort-desc'}
		<path d="m3 16 4 4 4-4" />
		<path d="M7 20V4" />
		<path d="M11 4h10" />
		<path d="M11 8h7" />
		<path d="M11 12h4" />
	{:else if name === 'archive'}
		<rect width="20" height="5" x="2" y="3" rx="1" />
		<path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
		<path d="M10 12h4" />
	{:else if name === 'package'}
		<path d="m21 8-9-5-9 5 9 5 9-5Z" />
		<path d="M3 8v8l9 5 9-5V8" />
		<path d="M12 13v8" />
		<path d="m7.5 5.5 9 5" />
	{:else if name === 'code'}
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
	{:else if name === 'eye'}
		<path d="M2.06 12.35a1 1 0 0 1 0-.7C3.33 8.31 6.7 6 12 6s8.67 2.31 9.94 5.65a1 1 0 0 1 0 .7C20.67 15.69 17.3 18 12 18s-8.67-2.31-9.94-5.65Z" />
		<circle cx="12" cy="12" r="3" />
	{:else if name === 'eye-off'}
		<path d="m2 2 20 20" />
		<path d="M6.71 6.71C4.36 7.75 2.79 9.57 2.06 11.65a1 1 0 0 0 0 .7C3.33 15.69 6.7 18 12 18c1.92 0 3.57-.3 4.93-.84" />
		<path d="M10.59 10.59A2 2 0 0 0 12 14a2 2 0 0 0 1.41-.59" />
		<path d="M17.29 17.29c2.35-1.04 3.92-2.86 4.65-4.94a1 1 0 0 0 0-.7C20.67 8.31 17.3 6 12 6c-1.92 0-3.57.3-4.93.84" />
	{:else if name === 'pin'}
		<path d="M12 17v5" />
		<path d="M5 17h14" />
		<path d="M7 7h10l-2 10H9L7 7Z" />
		<path d="M9 7V2h6v5" />
	{:else if name === 'monitor'}
		<rect width="18" height="12" x="3" y="4" rx="2" />
		<path d="M8 20h8" />
		<path d="M12 16v4" />
	{:else if name === 'refresh'}
		<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
		<path d="M21 3v5h-5" />
		<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
		<path d="M8 16H3v5" />
	{:else if name === 'external-link'}
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		<polyline points="15 3 21 3 21 9" />
		<line x1="10" x2="21" y1="14" y2="3" />
	{:else if name === 'check'}
		<path d="M20 6 9 17l-5-5" />
	{:else if name === 'alert-circle'}
		<circle cx="12" cy="12" r="10" />
		<line x1="12" x2="12" y1="8" y2="12" />
		<line x1="12" x2="12.01" y1="16" y2="16" />
	{:else if name === 'edit'}
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	{:else if name === 'save'}
		<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
		<polyline points="17 21 17 13 7 13 7 21" />
		<polyline points="7 3 7 8 15 8" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	{:else if name === 'panel-right'}
		<rect width="18" height="18" x="3" y="3" rx="2" />
		<path d="M15 3v18" />
	{:else if name === 'more-horizontal'}
		<circle cx="12" cy="12" r="1" />
		<circle cx="19" cy="12" r="1" />
		<circle cx="5" cy="12" r="1" />
	{:else if name === 'chevron-left'}
		<path d="m15 18-6-6 6-6" />
	{:else if name === 'chevron-down'}
		<path d="m6 9 6 6 6-6" />
	{:else if name === 'volume'}
		<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
		<path d="M16 9a5 5 0 0 1 0 6" />
		<path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
	{:else if name === 'volume-x'}
		<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
		<line x1="22" x2="16" y1="9" y2="15" />
		<line x1="16" x2="22" y1="9" y2="15" />
	{:else if name === 'git-branch'}
		<line x1="6" x2="6" y1="3" y2="15" />
		<circle cx="18" cy="6" r="3" />
		<circle cx="6" cy="18" r="3" />
		<path d="M18 9a9 9 0 0 1-9 9" />
	{:else if name === 'arrow-up'}
		<path d="m5 12 7-7 7 7" />
		<path d="M12 19V5" />
	{:else if name === 'columns-3'}
		<rect width="18" height="18" x="3" y="3" rx="2" />
		<path d="M9 3v18" />
		<path d="M15 3v18" />
	{:else if name === 'link'}
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	{:else if name === 'lock'}
		<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	{:else if name === 'search'}
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.3-4.3" />
	{:else if name === 'minus'}
		<path d="M5 12h14" />
	{:else if name === 'folder-x'}
		<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
		<path d="m9.5 10.5 5 5" />
		<path d="m14.5 10.5-5 5" />
	{:else if name === 'terminal'}
		<polyline points="4 17 10 11 4 5" />
		<line x1="12" x2="20" y1="19" y2="19" />
	{:else if name === 'info'}
		<circle cx="12" cy="12" r="10" />
		<path d="M12 16v-4" />
		<path d="M12 8h.01" />
	{:else if name === 'copy-plus'}
		<line x1="15" x2="15" y1="12" y2="18" />
		<line x1="12" x2="18" y1="15" y2="15" />
		<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	{:else if name === 'package-open'}
		<path d="M12 22v-9" />
		<path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.66 1.66 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" />
		<path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" />
		<path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.64 1.64 0 0 0 1.63 0z" />
	{/if}
</svg>
