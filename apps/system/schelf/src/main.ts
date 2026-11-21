import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import DialogPage from '#lib/install/dialogs/DialogPage.svelte';
import InstallWindow from '#lib/install/InstallWindow.svelte';
import { installRoute } from '#lib/install/start.js';

const route = installRoute();
if (!route) mount(App, { target: document.body });
else {
	document.title = 'Parcel';
	if (route.window === 'dialog') mount(DialogPage, { target: document.body, props: { dialog: route.id } });
	else mount(InstallWindow, { target: document.body, props: { request: route.id } });
}
