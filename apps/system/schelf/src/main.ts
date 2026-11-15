import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import InstallWindow from '#lib/install/InstallWindow.svelte';
import { installRequest } from '#lib/install/start.js';

const request = installRequest();
if (request === null) mount(App, { target: document.body });
else mount(InstallWindow, { target: document.body, props: { request } });
