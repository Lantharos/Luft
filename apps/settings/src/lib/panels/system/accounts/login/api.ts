import { commands } from '#lib/bindings.js';

const WAIT_FOR_PERMISSION = { timeoutMs: 300_000 };

export const chooseWallpaper = () => commands.loginChooseWallpaper(WAIT_FOR_PERMISSION);
export const clearWallpaper = () => commands.loginClearWallpaper(WAIT_FOR_PERMISSION);
export const setShowUsers = (enabled: boolean) => commands.loginSetShowUsers({ enabled }, WAIT_FOR_PERMISSION);
export const setHiddenUsers = (users: string[]) => commands.loginSetHiddenUsers({ users }, WAIT_FOR_PERMISSION);
export const setDefaultSession = (session: string) => commands.loginSetDefaultSession({ session }, WAIT_FOR_PERMISSION);
export const setAutomaticLogin = (user: string) => commands.loginSetAutomaticLogin({ user }, WAIT_FOR_PERMISSION);
