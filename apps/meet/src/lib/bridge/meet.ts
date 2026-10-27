import { commands, type Failure, type Intent, type Outcome, type Source, type WindowsChoices } from '#lib/bindings.js';

export type Packing = Parameters<typeof commands.meetPack>[0];

export class Failed extends Error {
	constructor(
		readonly failure: Failure,
		detail: string
	) {
		super(detail);
	}
}

export const UNTIL_DONE = { timeoutMs: 2 ** 31 - 1 };

export async function settle<T>(running: Promise<Outcome<T>>): Promise<T> {
	const outcome = await running;
	if ('failure' in outcome) throw new Failed(outcome.failure, outcome.detail);
	return outcome.value;
}

export const check = (source: Source) => settle(commands.meetCheck({ source }, UNTIL_DONE));
export const prepare = (luft: number, source: Source, place: string) => settle(commands.meetPrepare({ luft, source, place }, UNTIL_DONE));
export const refresh = (source: Source) => settle(commands.meetRefresh({ source }, UNTIL_DONE));
export const pack = (packing: Packing) => settle(commands.meetPack(packing, UNTIL_DONE));
export const restart = (intent: Intent, windows: WindowsChoices) => settle(commands.meetRestart({ intent, windows }, UNTIL_DONE));
export const tidy = () => settle(commands.meetTidy(UNTIL_DONE));
export const firmwareSettings = () => settle(commands.meetFirmwareSettings(UNTIL_DONE));
export const undo = () => settle(commands.meetUndo(UNTIL_DONE));
export const luft = () => settle(commands.meetLuft(UNTIL_DONE));
export const luftRange = () => settle(commands.meetLuftRange(UNTIL_DONE));
export const resizeLuft = (size: number) => settle(commands.meetResizeLuft({ size }, UNTIL_DONE));
export const cancelResize = () => settle(commands.meetCancelResize(UNTIL_DONE));
export const giveWindows = () => settle(commands.meetGiveWindows(UNTIL_DONE));
export const startLuft = () => settle(commands.meetStartLuft(UNTIL_DONE));
export const removeLuft = () => settle(commands.meetRemoveLuft(UNTIL_DONE));
export const installed = () => settle(commands.meetInstalled(UNTIL_DONE));
export const pickIso = () => settle(commands.meetPickIso(UNTIL_DONE));
export const saveLogs = () => settle(commands.meetSaveLogs(UNTIL_DONE));
export const showFile = (path: string) => settle(commands.meetShowFile({ path }, UNTIL_DONE));
export const belongings = () => settle(commands.meetBelongings(UNTIL_DONE));
