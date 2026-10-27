import { commands, type Source } from '#lib/bindings.js';
import { settle, UNTIL_DONE } from '#lib/bridge/meet.js';

export type Making = Parameters<typeof commands.meetMakeStick>[0];

export const sticks = (iso: string | null) => settle(commands.meetSticks({ iso }, UNTIL_DONE));
export const room = (stick: string, needed: number) => settle(commands.meetVentoyRoom({ stick, needed }, UNTIL_DONE));
export const offer = (source: Source) => settle(commands.meetStickOffer({ source }, UNTIL_DONE));
export const make = (making: Making) => settle(commands.meetMakeStick(making, UNTIL_DONE));
