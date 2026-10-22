import { git } from '../affected/range';
import { place } from './places';
import { busiest, markdown, merge, type Section } from './sections';

function since(revision: string): Section[] {
	const log = git('log', '--no-merges', '--format=%x00%s', '--name-only', `${revision}..HEAD`) ?? '';
	const commits = log.split('\0').filter(Boolean);
	return merge(
		commits.flatMap((commit) => {
			const [subject, ...files] = commit.trim().split('\n');
			const found = busiest(files.filter(Boolean).flatMap((file) => place(file) ?? []));
			return found ? [[{ ...found, changes: [subject] }]] : [];
		}),
	);
}

const input = async () => (await Bun.stdin.text()).split('\n').filter(Boolean);

const [command, argument = ''] = process.argv.slice(2);

switch (command) {
	case 'since':
		console.log(JSON.stringify(since(argument)));
		break;
	case 'merge':
		console.log(JSON.stringify(merge((await input()).map((line) => JSON.parse(line)))));
		break;
	case 'markdown':
		process.stdout.write(markdown(JSON.parse((await input()).join('\n'))));
		break;
	default:
		throw new Error('Usage: changelog since REVISION | merge < SECTION LISTS | markdown < SECTIONS');
}
