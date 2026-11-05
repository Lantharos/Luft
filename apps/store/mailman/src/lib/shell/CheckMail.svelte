<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { tooltip } from '@luft/ui';
	import { mail } from '#lib/mail/mail.svelte.js';
</script>

<button type="button" class="icon-button" aria-label="Check for new mail" aria-busy={mail.checking} onclick={mail.checkNow} {@attach tooltip('Check for new mail (F5)')}>
	<RefreshCw size={16} class={mail.checking ? 'animate-spin' : ''} />
</button>
