import type { Access, Interface, Member } from './introspection';

export type Truth = { source: string; definition: Interface; zbus: boolean };
export type Copy = { where: (line: number) => string; definition: Interface; complete: boolean; zbus?: 'exported' | 'proxy' };

const ALLOWED: Record<Access, Access[]> = { read: ['read'], write: ['write'], readwrite: ['read', 'write', 'readwrite'] };

const list = (signatures: string[]) => `(${signatures.join('')})`;

function sameResults(copy: string[], truth: string[], zbus: boolean): boolean {
	if (list(copy) === list(truth)) return true;
	return zbus && ((copy.length === 1 && copy[0] === list(truth)) || (truth.length === 1 && truth[0] === list(copy)));
}

function difference(copy: Member, truth: Member, zbus: boolean, proxy: boolean): string | undefined {
	if (copy.kind !== truth.kind) return `is a ${copy.kind}, but it's a ${truth.kind}`;
	if (copy.kind === 'method' && truth.kind === 'method') {
		if (list(copy.inputs) !== list(truth.inputs)) return `takes ${list(copy.inputs)}, but it takes ${list(truth.inputs)}`;
		if (!sameResults(copy.outputs, truth.outputs, zbus)) return `returns ${list(copy.outputs)}, but it returns ${list(truth.outputs)}`;
	}
	if (copy.kind === 'signal' && truth.kind === 'signal' && list(copy.args) !== list(truth.args)) return `carries ${list(copy.args)}, but it carries ${list(truth.args)}`;
	if (copy.kind === 'property' && truth.kind === 'property') {
		if (copy.type !== truth.type && !(proxy && copy.type === 'v')) return `is ${copy.type}, but it's ${truth.type}`;
		if (!ALLOWED[truth.access].includes(copy.access)) return `is ${copy.access}, but it's only ${truth.access}`;
	}
	return undefined;
}

export function compare(copy: Copy, truth: Truth): string[] {
	const problems: string[] = [];
	const name = copy.definition.name;
	for (const member of copy.definition.members.values()) {
		const real = truth.definition.members.get(member.name);
		const problem = real ? difference(member, real, copy.zbus !== undefined || truth.zbus, copy.zbus === 'proxy') : `isn't in ${truth.source}`;
		if (problem) problems.push(`${copy.where(member.line)}: ${name}.${member.name} ${problem}${real ? ` in ${truth.source}` : ''}`);
	}
	if (copy.complete) {
		for (const member of truth.definition.members.values()) {
			if (!copy.definition.members.has(member.name)) problems.push(`${copy.where(copy.definition.line)}: ${name} lacks the ${member.kind} ${member.name} from ${truth.source}`);
		}
	}
	return problems;
}
