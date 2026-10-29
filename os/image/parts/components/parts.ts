import { listedTree, partNames, partSources } from './sources';

const [listing, checkout, command, part] = process.argv.slice(2);

if (!listing || !checkout || !(command === 'names' || (command === 'sources' && part))) {
  throw new Error('Usage: parts.ts TREE CHECKOUT names | sources PART');
}

const { tree } = listedTree(checkout, await Bun.file(listing).text());
const lines = command === 'names' ? partNames(tree) : partSources(tree, part);
process.stdout.write(lines.map((line) => `${line}\n`).join(''));
