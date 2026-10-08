import { fileUri } from '../text/paths';

export function dragFiles(transfer: DataTransfer, paths: string[]) {
	transfer.setData('text/uri-list', paths.map(fileUri).join('\r\n'));
	transfer.setData('text/plain', paths.join('\n'));
	transfer.effectAllowed = 'copy';
}

export function fileDragStart(path: string) {
	return (event: DragEvent) => {
		if (event.dataTransfer) dragFiles(event.dataTransfer, [path]);
	};
}
