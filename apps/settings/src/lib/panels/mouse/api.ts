import { invoke } from '$lib/bridge';

export const hasTouchpad = () => invoke<boolean>('mouse_has_touchpad');
