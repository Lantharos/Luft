import { existsSync, readFileSync } from 'node:fs';

import { Glob } from 'bun';

export type Scope = 'system' | 'user';
export type Unit = { path: string; scope: Scope };

const UNIT_FILE = /\.service(?:\.in)?$/;
const SERVICE_SECTION = /^\[Service\]$/m;
const TEST_ONLY = ['**/vm/**', '**/tools/check/**'].map((pattern) => new Glob(pattern));

const SCOPES: [string, Scope][] = [
	['apps/setup/installer/data/*', 'system'],
	['apps/*/data/*', 'user'],
	['sushi/data/systemd/*', 'system'],
	['kestrel/engine/data/system/*', 'system'],
	['kestrel/engine/data/session/*', 'user'],
	['kestrel/engine/data/*', 'user'],
	['kestrel/greeter/data/*', 'system'],
	['kestrel/keyring/data/system/*', 'system'],
	['kestrel/keyring/data/user/*', 'user'],
	['kestrel/passkeys/data/luft-passkeys-relay@.service', 'system'],
	['kestrel/passkeys/data/luft-passkeys.service', 'user'],
	['kestrel/watchdog/data/*', 'system'],
	['os/image/files/usr/lib/systemd/system/*', 'system'],
	['os/image/files/usr/lib/systemd/user/*', 'user'],
	['os/iso/live/files/usr/lib/systemd/system/*', 'system'],
	['os/iso/live/files/usr/lib/dracut/**', 'system'],
	['security/data/**', 'system'],
	['services/accounts/data/*', 'user'],
	['services/speech/data/*', 'user'],
	['services/windows/data/luft-windows-notice.service', 'user'],
	['services/*/data/*', 'system'],
];

const patterns = SCOPES.map(([pattern, scope]) => ({ glob: new Glob(pattern), scope }));

export const isUnitPath = (path: string) => UNIT_FILE.test(path) && !TEST_ONLY.some((glob) => glob.match(path));

const scopeOf = (path: string) => patterns.find(({ glob }) => glob.match(path))?.scope;

export function luftUnits(files: string[]): Unit[] {
	return files
		.filter((path) => isUnitPath(path) && existsSync(path) && SERVICE_SECTION.test(readFileSync(path, 'utf8')))
		.map((path) => {
			const scope = scopeOf(path);
			if (!scope) throw new Error(`${path} isn't known to install as a system or a user unit. Add it to the scopes in ${import.meta.path}`);
			return { path, scope };
		});
}
