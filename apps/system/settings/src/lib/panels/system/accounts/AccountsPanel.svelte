<script lang="ts">
	import LogIn from '@lucide/svelte/icons/log-in';
	import { t } from '@luft/i18n';
	import { ActionRow, Section } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import LoginPage from './login/LoginPage.svelte';
	import OnlineAccounts from './online/OnlineAccounts.svelte';
	import UserSections from './users/UserSections.svelte';
</script>

{#if app.section === 'login'}
	<LoginPage onclose={() => (app.section = null)} />
{:else}
	<UserSections />
	<OnlineAccounts />
	<Section>
		<ActionRow title={t('settings-page-login')} icon={LogIn} onclick={() => (app.section = 'login')} />
	</Section>
{/if}
