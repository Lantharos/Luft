import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Curve, DampedSpring, Duration, Spring } from './src/index';

const SAMPLES_PER_SECOND = 90;
const REST = 0.002;

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const round = (value: number) => Number(value.toFixed(4));

function springEasing(name: keyof typeof Spring): string[] {
	const spring = new DampedSpring(Spring[name], { offset: -1, velocity: 0 });
	const duration = spring.settleTime(REST);
	const steps = Math.ceil(duration * SAMPLES_PER_SECOND);
	const points = Array.from({ length: steps + 1 }, (_, step) => round(1 + spring.at((duration * step) / steps).offset));
	points[steps] = 1;
	return [`--spring-${kebab(name)}: linear(${points.join(', ')});`, `--spring-${kebab(name)}-duration: ${Math.round(duration * 1000)}ms;`];
}

function stylesheet(): string {
	const durations = Object.entries(Duration).map(([name, ms]) => `--motion-${kebab(name)}: ${ms}ms;`);
	const curves = Object.entries(Curve).map(([name, points]) => `--ease-${kebab(name)}: cubic-bezier(${points.join(', ')});`);
	const springs = (Object.keys(Spring) as (keyof typeof Spring)[]).flatMap(springEasing);
	const block = (lines: string[]) => lines.map((line) => `\t${line}`).join('\n');
	return [
		'/* Generated from packages/motion/tokens.json by packages/motion/generate.ts. */',
		'',
		'@theme static {',
		block([...durations, ...curves, ...springs]),
		'\t--default-transition-duration: var(--motion-tap);',
		'\t--default-transition-timing-function: var(--ease-decelerate);',
		'}',
		''
	].join('\n');
}

function shellStylesheet(): string {
	const durations = Object.entries(Duration).map(([name, ms]) => `$motion-${kebab(name)}: ${ms}ms;`);
	return ['// Generated from packages/motion/tokens.json by packages/motion/generate.ts.', '', ...durations, ''].join('\n');
}

const ROOT = join(import.meta.dir, '../..');
const outputs: [string, string][] = [
	['packages/ui/src/styles/motion.css', stylesheet()],
	['kestrel/engine/data/theme/sass/_motion.scss', shellStylesheet()]
];

const checking = process.argv.includes('--check');
const stale = outputs.filter(([path, contents]) => {
	const file = join(ROOT, path);
	if (checking) return readFileSync(file, 'utf8') !== contents;
	writeFileSync(file, contents);
	return false;
});
if (stale.length) {
	console.error(`${stale.map(([path]) => path).join(' and ')} out of date; run bun run generate in packages/motion`);
	process.exit(1);
}
