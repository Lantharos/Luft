export type Access = 'read' | 'write' | 'readwrite';

export type Member =
	| { kind: 'method'; name: string; line: number; inputs: string[]; outputs: string[] }
	| { kind: 'signal'; name: string; line: number; args: string[] }
	| { kind: 'property'; name: string; line: number; type: string; access: Access };

export type Interface = { name: string; line: number; members: Map<string, Member> };

const TAG = /<!--[\s\S]*?-->|<(\/?)([\w:]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
const ATTRIBUTE = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const NODE = /<node[\s>][\s\S]*?<\/node>/g;
const C_STRINGS = /"\s*\n\s*"/g;
const INTERPOLATED = /\$\{|@\w+@/;
const CONSTANT = /\bconst\s+([A-Z][A-Z0-9_]*)\s*=\s*(['"])([^'"\n]*)\2/g;

const lineAt = (text: string, offset: number) => text.slice(0, offset).split('\n').length;

function attributes(text: string): Record<string, string> {
	return Object.fromEntries([...text.matchAll(ATTRIBUTE)].map(([, name, double, single]) => [name, double ?? single]));
}

export function parse(xml: string, firstLine = 1): Interface[] {
	const interfaces: Interface[] = [];
	let current: Interface | undefined;
	let member: Member | undefined;
	let resolved = true;
	for (const match of xml.matchAll(TAG)) {
		const [whole, closing, tag, rest, selfClosing] = match;
		if (whole.startsWith('<!--')) continue;
		const line = firstLine + lineAt(xml, match.index) - 1;
		if (closing) {
			if (tag === 'interface') current = undefined;
			if (tag === 'method' || tag === 'signal' || tag === 'property') member = undefined;
			continue;
		}
		const values = attributes(rest);
		if (tag === 'interface') {
			resolved = !INTERPOLATED.test(values.name);
			current = { name: values.name, line, members: new Map() };
			if (resolved) interfaces.push(current);
			if (selfClosing) current = undefined;
			continue;
		}
		if (!current || INTERPOLATED.test(values.name ?? '')) continue;
		if (tag === 'method') member = { kind: 'method', name: values.name, line, inputs: [], outputs: [] };
		else if (tag === 'signal') member = { kind: 'signal', name: values.name, line, args: [] };
		else if (tag === 'property') member = { kind: 'property', name: values.name, line, type: values.type, access: values.access as Access };
		else if (tag === 'arg' && member?.kind === 'method') (values.direction === 'out' ? member.outputs : member.inputs).push(values.type);
		else if (tag === 'arg' && member?.kind === 'signal') member.args.push(values.type);
		if (tag === 'method' || tag === 'signal' || tag === 'property') {
			current.members.set(member!.name, member!);
			if (selfClosing) member = undefined;
		}
	}
	for (const found of interfaces) {
		for (const [name, member] of found.members) if (INTERPOLATED.test(signatures(member).join(''))) found.members.delete(name);
	}
	return interfaces;
}

function signatures(member: Member): string[] {
	if (member.kind === 'method') return [...member.inputs, ...member.outputs];
	return member.kind === 'signal' ? member.args : [member.type];
}

export function embedded(path: string, text: string): Interface[] {
	if (path.endsWith('.xml')) return parse(text);
	const source = path.endsWith('.patch') ? added(text) : path.endsWith('.ts') ? substituted(text) : text;
	return [...source.matchAll(NODE)].flatMap((match) => {
		const line = lineAt(source, match.index);
		return path.endsWith('.c') ? parse(match[0].replace(C_STRINGS, ''), line).map((found) => flatten(found, line)) : parse(match[0], line);
	});
}

function substituted(script: string): string {
	const constants = new Map([...script.matchAll(CONSTANT)].map(([, name, , value]) => [name, value]));
	return script.replace(/\$\{([A-Z][A-Z0-9_]*)\}/g, (whole, name) => constants.get(name) ?? whole);
}

function added(patch: string): string {
	return patch
		.split('\n')
		.map((line) => (line.startsWith('+') && !line.startsWith('+++') ? line.slice(1) : ''))
		.join('\n');
}

function flatten(found: Interface, line: number): Interface {
	for (const member of found.members.values()) member.line = line;
	return { ...found, line };
}
