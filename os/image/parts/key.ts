type Stage = { name: string; image: string; instructions: string[] };

const [containerfile, tree, ...assignments] = process.argv.slice(2);

if (!containerfile || !tree) {
  throw new Error('Usage: key.ts CONTAINERFILE TREE [NAME=VALUE...] < "PART TARGET [NAME=VALUE...]" lines');
}

function parseAssignments(list: string[]) {
  return Object.fromEntries(
    list.map((assignment) => {
      const split = assignment.indexOf('=');
      return [assignment.slice(0, split), assignment.slice(split + 1)];
    }),
  );
}

function treeObjects(listing: string) {
  return new Map(
    listing
      .split('\0')
      .filter(Boolean)
      .map((entry) => {
        const tab = entry.indexOf('\t');
        return [entry.slice(tab + 1), entry.slice(0, tab).split(' ')[2]];
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
const objects = treeObjects(await Bun.file(tree).text());
const globals = parseAssignments(assignments);

function object(path: string) {
  const clean = path.replace(/^\.\//, '').replace(/\/+$/, '');
  const id = objects.get(clean);
  if (!id) throw new Error(`${clean} is not in the working tree`);
  return id;
}

function key(target: string, given: Record<string, string>) {
  const hash = new Bun.CryptoHasher('sha256');
  const visited = new Set<string>();

  function visit(name: string) {
    const stage = stages.get(name);
    if (!stage) throw new Error(`${containerfile} has no stage ${name}`);
    if (visited.has(name)) return;
    visited.add(name);
    const image = expand(stage.image, { ...defaults, ...given });
    if (stages.has(image)) visit(image);

    const values: Record<string, string> = {};
    hash.update(`FROM ${stage.image} AS ${name}\n`);
    for (const line of stage.instructions) {
      hash.update(`${line}\n`);
      const [keyword, ...words] = line.split(' ');
      const instruction = keyword.toUpperCase();
      if (instruction === 'ARG') {
        const [argument, fallback] = words[0].split('=');
        values[argument] = given[argument] ?? fallback ?? '';
        hash.update(`${argument}=${values[argument]}\n`);
      } else if (instruction === 'COPY') {
        const { values: copyFlags, rest } = flags(words);
        if (copyFlags.from) {
          visit(copyFlags.from);
          continue;
        }
        for (const source of rest.slice(0, -1)) {
          const path = expand(source, values);
          hash.update(`${path} ${object(path)}\n`);
        }
      }
    }
  }

  visit(target);
  return hash.digest('hex').slice(0, 32);
}

for (const line of (await Bun.stdin.text()).split('\n')) {
  const [part, target, ...partAssignments] = line.trim().split(/\s+/);
  if (!part) continue;
  console.log(`${part} ${key(target, { ...globals, ...parseAssignments(partAssignments) })}`);
}
