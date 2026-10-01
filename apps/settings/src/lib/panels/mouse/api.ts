import { invoke } from '$lib/bridge';

export interface Pointers {
	mouse: boolean;
	touchpad: boolean;
}

export const pointers = () => invoke<Pointers>('mouse_pointers');
