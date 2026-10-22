import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import type { Unit } from './units';

const SUBSTITUTIONS: Record<string, string> = {
	bindir: '/usr/bin',
	gjs: '/usr/bin/gjs',
	libexecdir: '/usr/libexec',
	pkgdatadir: '/usr/share/kestrel',
	schemadir: '/usr/share/glib-2.0/schemas',
};
const PLACEHOLDER = /@([a-z_]+)@/g;
const TEMPLATE = /@(\.service)$/;
const OVERALL = /Overall exposure level for .+: (\d+\.\d+)/;

export type Analysis = { exposure: number; warnings: string };

function fill(path: string): string {
	return readFileSync(path, 'utf8').replace(PLACEHOLDER, (placeholder, name: string) => {
		const value = SUBSTITUTIONS[name];
		if (value === undefined) throw new Error(`${path} uses ${placeholder}, which the check doesn't know how to fill in`);
		return value;
	});
}

const installedName = (path: string) => basename(path).replace(/\.in$/, '').replace(TEMPLATE, '@check$1');

async function analyse(unit: Unit, folder: string): Promise<Analysis> {
	mkdirSync(folder);
	const copy = join(folder, installedName(unit.path));
	writeFileSync(copy, fill(unit.path));
	const scope = unit.scope === 'user' ? ['--user'] : [];
	const env = { ...process.env, XDG_RUNTIME_DIR: folder };
	const analysis = Bun.spawn(['systemd-analyze', 'security', '--offline=yes', '--no-pager', ...scope, copy], { env, stdout: 'pipe', stderr: 'pipe' });
	const [output, errors, status] = await Promise.all([new Response(analysis.stdout).text(), new Response(analysis.stderr).text(), analysis.exited]);
	const overall = output.match(OVERALL);
	if (status !== 0 || !overall) throw new Error(`systemd-analyze couldn't score ${unit.path}:\n${errors}`);
	return { exposure: Number(overall[1]), warnings: errors.replaceAll(copy, unit.path).trim() };
}

export async function exposures(units: Unit[]): Promise<Map<string, Analysis>> {
	const folder = mkdtempSync(join(tmpdir(), 'luft-units-'));
	try {
		const analyses = await Promise.all(units.map((unit, index) => analyse(unit, join(folder, String(index)))));
		return new Map(units.map((unit, index) => [unit.path, analyses[index]]));
	} finally {
		rmSync(folder, { recursive: true, force: true });
	}
}
