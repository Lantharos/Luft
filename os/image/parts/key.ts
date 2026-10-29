import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { listedTree, partSources } from './components/sources';
import { prunedWorkspace } from './stages/workspace';

type Stage = { name: string; image: string; instructions: string[] };

const WORKSPACE_FILES = new Set(['Cargo.toml', 'Cargo.lock']);
const SOURCES = 'sources';

const [containerfile, tree, checkout, ...assignments] = process.argv.slice(2);

if (!containerfile || !tree || !checkout) {
  throw new Error('Usage: key.ts CONTAINERFILE TREE CHECKOUT [NAME=VALUE...] < "PART TARGET [NAME=VALUE...]" lines');
}

function parseAssignments(list: string[]) {
  return Object.fromEntries(
    list.map((assignment) => {
      const split = assignment.indexOf('=');
      return [assignment.slice(0, split), assignment.slice(split + 1)];
    }),
  );
}

function instructions(text: string) {
  return text
    .replace(/\\\n/g, ' ')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter((line) => line && !line.startsWith('#'));
}

function parse(text: string) {
  const stages = new Map<string, Stage>();
  const defaults: Record<string, string> = {};
  let current: Stage | undefined;
  for (const line of instructions(text)) {
    const [keyword, ...words] = line.split(' ');
    if (keyword.toUpperCase() === 'FROM') {
      current = { name: words[2] ?? '', image: words[0], instructions: [] };
      stages.set(current.name, current);
    } else if (current) {
      current.instructions.push(line);
    } else if (keyword.toUpperCase() === 'ARG') {
      const [argument, fallback = ''] = words[0].split('=');
      defaults[argument] = fallback;
    }
  }
  return { stages, defaults };
}

function expand(text: string, values: Record<string, string>) {
  return text.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, braced, bare) => values[braced ?? bare] ?? '');
}

function flags(words: string[]) {
  const values: Record<string, string> = {};
  const rest = words.filter((word) => {
    const flag = /^--([\w-]+)=(.*)$/.exec(word);
    if (flag) values[flag[1]] = flag[2];
    return !flag;
  });
  return { values, rest };
}

const { stages, defaults } = parse(await Bun.file(containerfile).text());
const { objects, tree: checkoutTree } = listedTree(checkout, await Bun.file(tree).text());
const globals = parseAssignments(assignments);

function object(path: string) {
  const clean = path.replace(/^\.\//, '').replace(/\/+$/, '');
  const id = objects.get(clean);
  if (!id) throw new Error(`${clean} is not in the working tree`);
  return id;
}

function stagesOf(target: string, given: Record<string, string>) {
  const order: Stage[] = [];
  function visit(name: string) {
    const stage = stages.get(name);
    if (!stage) throw new Error(`${containerfile} has no stage ${name}`);
    if (order.includes(stage)) return;
    order.push(stage);
    const image = expand(stage.image, { ...defaults, ...given });
    if (stages.has(image)) visit(image);
    for (const line of stage.instructions) {
      const [keyword, ...words] = line.split(' ');
      const from = keyword.toUpperCase() === 'COPY' ? flags(words).values.from : undefined;
      if (from && from !== SOURCES) visit(from);
    }
  }
  visit(target);
  return order;
}

const partCopies = new Map<string, string[]>();

function copied(words: string[], values: Record<string, string>, part: string) {
  const { values: copyFlags, rest } = flags(words);
  if (copyFlags.from !== SOURCES) return copyFlags.from ? [] : rest.slice(0, -1).map((source) => expand(source, values));
  if (!partCopies.has(part)) partCopies.set(part, partSources(checkoutTree, part));
  return partCopies.get(part)!;
}

function copies(stage: Stage, given: Record<string, string>, part: string) {
  const values: Record<string, string> = {};
  const sources: string[] = [];
  for (const line of stage.instructions) {
    const [keyword, ...words] = line.split(' ');
    const instruction = keyword.toUpperCase();
    if (instruction === 'ARG') {
      const [argument, fallback] = words[0].split('=');
      values[argument] = given[argument] ?? fallback ?? '';
    } else if (instruction === 'COPY') {
      sources.push(...copied(words, values, part));
    }
  }
  return { values, sources };
}

function workspaceFiles(sources: string[]) {
  const copied = (path: string) => objects.has(path) && sources.some((source) => path === source || path.startsWith(`${source}/`));
  const read = (path: string) => readFileSync(join(checkout, path), 'utf8');
  const memberManifest = (dir: string) => (copied(`${dir}/Cargo.toml`) ? read(`${dir}/Cargo.toml`) : undefined);
  const workspace = prunedWorkspace(read('Cargo.toml'), read('Cargo.lock'), memberManifest);
  return { 'Cargo.toml': workspace.manifest, 'Cargo.lock': workspace.lock } as Record<string, string>;
}

function key(part: string, target: string, given: Record<string, string>) {
  const hash = new Bun.CryptoHasher('sha256');
  const chain = stagesOf(target, given);
  const sources = chain.flatMap((stage) => copies(stage, given, part).sources);
  const workspace = sources.some((source) => WORKSPACE_FILES.has(source)) ? workspaceFiles(sources) : {};

  for (const stage of chain) {
    const { values } = copies(stage, given, part);
    hash.update(`FROM ${expand(stage.image, { ...defaults, ...given })} AS ${stage.name}\n`);
    for (const line of stage.instructions) {
      hash.update(`${line}\n`);
      const [keyword, ...words] = line.split(' ');
      const instruction = keyword.toUpperCase();
      if (instruction === 'ARG') {
        const [argument] = words[0].split('=');
        hash.update(`${argument}=${values[argument]}\n`);
      } else if (instruction === 'COPY') {
        for (const path of copied(words, values, part)) hash.update(`${path} ${workspace[path] ?? object(path)}\n`);
      }
    }
  }

  return hash.digest('hex').slice(0, 32);
}

for (const line of (await Bun.stdin.text()).split('\n')) {
  const [part, target, ...partAssignments] = line.trim().split(/\s+/);
  if (!part) continue;
  console.log(`${part} ${key(part, target, { ...globals, ...parseAssignments(partAssignments) })}`);
}
