import { pathsFromUriList } from '../text/paths';

const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

export function fileDrop(open: (paths: string[]) => void) {
	return {
		ondragover(event: DragEvent) {
			if (carriesFiles(event)) event.preventDefault();
		},
		ondrop(event: DragEvent) {
			if (!carriesFiles(event)) return;
			event.preventDefault();
			event.stopPropagation();
			const paths = pathsFromUriList(event.dataTransfer!.getData('text/uri-list'));
			if (paths.length) open(paths);
		}
	};
}
