import { commands } from '#lib/bindings.js';

const WAIT_FOR_PERMISSION = { timeoutMs: 300_000 };

export const hostSecurity = () => commands.securityHost({ timeoutMs: 120_000 });

export const setUsbProtection = (enabled: boolean) => commands.securitySetUsb({ enabled }, WAIT_FOR_PERMISSION);

export const setUpTpmUnlock = (pin: string) => (unlock: string) => commands.securitySetUpTpm({ unlock, pin }, WAIT_FOR_PERMISSION);
export const removeTpmUnlock = (unlock: string) => commands.securityRemoveTpm({ unlock }, WAIT_FOR_PERMISSION);
export const showRecoveryKey = () => commands.securityShowKey(WAIT_FOR_PERMISSION);
export const acceptSecureBootChange = () => commands.securityAcceptSecureBoot(WAIT_FOR_PERMISSION);
export const replaceRecoveryKey = (unlock: string) => commands.securityReplaceKey({ unlock }, WAIT_FOR_PERMISSION);
export const generateRecoveryKey = () => commands.securityGenerateKey();
export const onBattery = () => commands.securityOnBattery();
export const encryptDisk = (recoveryKey: string, passphrase: string) => commands.securityEncryptDisk({ recoveryKey, passphrase }, WAIT_FOR_PERMISSION);
export const cancelEncryption = () => commands.securityCancelEncryption(WAIT_FOR_PERMISSION);

export const enrollSigningKey = () => commands.securityEnrollKey(WAIT_FOR_PERMISSION);
export const cancelSigningKey = () => commands.securityCancelEnrollment(WAIT_FOR_PERMISSION);
export const removeOtherKeys = () => commands.securityRemoveOtherKeys(WAIT_FOR_PERMISSION);
export const keepOtherKeys = () => commands.securityKeepOtherKeys(WAIT_FOR_PERMISSION);
export const installSignedStartup = () => commands.securityInstallStartup(WAIT_FOR_PERMISSION);

export const saveRecoveryKey = (key: string) => commands.securitySaveKey({ key }, WAIT_FOR_PERMISSION);
export const printRecoveryKey = (key: string) => commands.securityPrintKey({ key }, WAIT_FOR_PERMISSION);
export const restart = () => commands.securityRestart(WAIT_FOR_PERMISSION);
