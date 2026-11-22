<script lang="ts">
	import RefreshCw from '@luft/symbols/icons/refresh-cw';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import { mail } from '#lib/mail/mail.svelte.js';
</script>

<button type="button" class="icon-button" aria-label={t('mailman-check-mail')} aria-busy={mail.checking} onclick={mail.checkNow} {@attach tooltip(t('mailman-check-mail-tooltip'))}>
	<RefreshCw size={16} />
</button>
