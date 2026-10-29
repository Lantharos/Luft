import { existsSync, readFileSync } from 'node:fs';

import { covers } from './graph';

const ALWAYS = ['.github/scripts/dbus', 'packages/dbus/introspection', 'kestrel/compositor/upstream.json'];
const DESCRIBES_DBUS = /<interface\b|<busconfig\b|#\[introspect\]|#\[(?:zbus::)?(?:interface|proxy)\(|loadInterfaceXML|new DBusService\(/;

export const touchesDbus = (changed: string[]) =>
	changed.some((file) => ALWAYS.some((path) => covers(path, file)) || (existsSync(file) && DESCRIBES_DBUS.test(readFileSync(file, 'utf8'))));
