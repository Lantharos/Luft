import { pathsFromUriList } from '../text/paths';

const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

export function droppedPaths(transfer: DataTransfer) {
	const paths = [...transfer.files].map((file) => (file as File & { path?: string }).path).filter((path) => path !== undefined);
	return paths.length ? paths : pathsFromUriList(transfer.getData('text/uri-list'));
}

export function fileDrop(open: (paths: string[]) => void) {
	return {
		ondragover(event: DragEvent) {
			if (carriesFiles(event)) event.preventDefault();
		},
		ondrop(event: DragEvent) {
			if (!carriesFiles(event)) return;
			event.preventDefault();
			event.stopPropagation();
			const paths = droppedPaths(event.dataTransfer!);
			if (paths.length) open(paths);
		}
	};
}
