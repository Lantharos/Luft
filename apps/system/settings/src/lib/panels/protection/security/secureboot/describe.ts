import { t } from '@luft/i18n';
import type { Disk } from '#lib/bindings.js';

export const withoutKeySentence = (disk: Disk) => t(disk.encrypted ? 'settings-secure-boot-without-key' : 'settings-secure-boot-without-key-unencrypted');
