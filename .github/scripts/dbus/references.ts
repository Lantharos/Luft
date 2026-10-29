import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { $ } from 'bun';

import { type Interface, parse } from './introspection';

export type Reference = { source: string; definition: Interface };

const FEDORA = '45';
const SHIPPED = ['systemd', 'NetworkManager-libnm-devel', 'upower-devel', 'fprintd-devel', 'geoclue2-devel', 'ModemManager-devel', 'accountsservice', 'bolt', 'xdg-desktop-portal', 'flatpak', 'fwupd'];
const IN_SOURCES: Record<string, string[]> = {
	udisks2: ['data/org.freedesktop.UDisks2.xml'],
	polkit: ['data/org.freedesktop.PolicyKit1.Authority.xml'],
	'power-profiles-daemon': ['src/org.freedesktop.UPower.PowerProfiles.xml.in'],
	'iio-sensor-proxy': ['src/net.hadess.SensorProxy.xml'],
	'switcheroo-control': ['src/net.hadess.SwitcherooControl.xml'],
};
const MUTTER = ['org.gnome.Mutter.DisplayConfig', 'org.gnome.Mutter.IdleMonitor', 'org.gnome.Mutter.ScreenCast'];
export const UNPUBLISHED: Record<string, string> = {
	'com.lantharos.KestrelChecks': 'Controls the checks give their own stand-ins',
	'org.freedesktop.DBus': 'The bus and its standard interfaces, which no package ships as XML',
	'org.kde.StatusNotifierItem': 'Served by apps, from a specification that ships no XML',
	'com.canonical.dbusmenu': 'Served by apps, from a specification that ships no XML',
};
const MUTTER_LOCK = 'kestrel/compositor/upstream.json';
const WEEK = 7 * 24 * 60 * 60 * 1000;
const STAMP = '.fetched';
const INTERFACES = './usr/share/dbus-1/interfaces/*';

const plan = () => JSON.stringify({ FEDORA, SHIPPED, IN_SOURCES, MUTTER, mutter: JSON.parse(readFileSync(MUTTER_LOCK, 'utf8')).revision });

const fresh = (folder: string) => {
	const stamp = join(folder, STAMP);
	return existsSync(stamp) && readFileSync(stamp, 'utf8') === plan() && Date.now() - statSync(stamp).mtimeMs < WEEK;
};

const packageName = async (rpm: string) => (await $`rpm -qp --qf %{NAME} ${rpm}`.quiet().text()).trim();

async function shipped(work: string, into: string) {
	const rpms = join(work, 'shipped');
	await $`dnf download -q --releasever=${FEDORA} --arch=x86_64 --arch=noarch --destdir ${rpms} ${SHIPPED}`;
	for (const rpm of readdirSync(rpms).map((file) => join(rpms, file))) {
		const name = await packageName(rpm);
		const unpacked = join(work, name);
		mkdirSync(unpacked, { recursive: true });
		await $`rpm2cpio ${rpm} | cpio -idm --quiet -D ${unpacked} ${INTERFACES}`;
		const interfaces = join(unpacked, 'usr/share/dbus-1/interfaces');
		mkdirSync(join(into, name), { recursive: true });
		for (const file of readdirSync(interfaces)) renameSync(join(interfaces, file), join(into, name, file));
	}
}

async function inSources(work: string, into: string) {
	const rpms = join(work, 'sources');
	await $`dnf download -q --releasever=${FEDORA} --source --enablerepo=fedora-source --enablerepo=updates-source --destdir ${rpms} ${Object.keys(IN_SOURCES)}`;
	for (const rpm of readdirSync(rpms).map((file) => join(rpms, file))) {
		const name = await packageName(rpm);
		const unpacked = join(work, name);
		mkdirSync(unpacked, { recursive: true });
		await $`rpm2cpio ${rpm} | cpio -idm --quiet -D ${unpacked}`;
		const tarball = readdirSync(unpacked)
			.filter((file) => /\.tar\.\w+$/.test(file))
			.map((file) => join(unpacked, file))
			.sort((a, b) => statSync(b).size - statSync(a).size)[0];
		await $`tar -xf ${tarball} -C ${unpacked} --wildcards ${IN_SOURCES[name].map((file) => `*/${file}`)}`;
		mkdirSync(join(into, name), { recursive: true });
		for (const file of IN_SOURCES[name]) {
			const [found] = await Array.fromAsync(new Bun.Glob(`*/${file}`).scan(unpacked));
			const interfaceName = basename(file).replace(/\.xml(\.in)?$/, '');
			writeFileSync(join(into, name, `${interfaceName}.xml`), readFileSync(join(unpacked, found), 'utf8').replaceAll('@dbus_iface@', interfaceName));
		}
	}
}

async function mutter(into: string) {
	const { revision } = JSON.parse(readFileSync(MUTTER_LOCK, 'utf8'));
	mkdirSync(join(into, 'mutter'), { recursive: true });
	for (const name of MUTTER) {
		const response = await fetch(`https://raw.githubusercontent.com/GNOME/mutter/${revision}/data/dbus-interfaces/${name}.xml`);
		if (!response.ok) throw new Error(`Mutter ${revision} has no ${name}.xml (${response.status})`);
		writeFileSync(join(into, 'mutter', `${name}.xml`), await response.text());
	}
}

export async function fetchReferences(folder: string) {
	if (fresh(folder)) return;
	rmSync(folder, { recursive: true, force: true });
	const work = join(folder, '.work');
	mkdirSync(work, { recursive: true });
	await shipped(work, folder);
	await inSources(work, folder);
	await mutter(folder);
	rmSync(work, { recursive: true, force: true });
	writeFileSync(join(folder, STAMP), plan());
}

export function references(folder: string): Reference[] {
	return readdirSync(folder, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap(({ name: origin }) =>
			readdirSync(join(folder, origin))
				.filter((file) => file.endsWith('.xml'))
				.flatMap((file) => parse(readFileSync(join(folder, origin, file), 'utf8')).map((definition) => ({ source: `${origin}'s ${file}`, definition }))),
		);
}
