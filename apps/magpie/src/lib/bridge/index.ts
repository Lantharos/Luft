import { fileUrl } from '@lantharos/sabine';

export function fileSource(path: string, version: number = 0) {
	return `${fileUrl(path)}?v=${version}`;
}
