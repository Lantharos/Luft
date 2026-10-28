import { covers } from './graph';

const BUILT_HERE = [
	'kestrel/engine',
	'kestrel/compositor',
	'kestrel/tools',
	'.github/ci/kestrel',
	'.github/scripts/kestrel',
	'os/image/packages/build.txt',
	'os/image/packages/runtime.txt',
];

export const touchesKestrel = (changed: string[], affected: Set<string>) =>
	[...affected].some((dir) => covers('kestrel', dir)) || changed.some((file) => BUILT_HERE.some((path) => covers(path, file)));
