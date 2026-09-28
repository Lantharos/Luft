export interface FileDetails {
	kind: string;
	mimeType: string | null;
	created: number | null;
	accessed: number | null;
	dimensions: [number, number] | null;
	itemCount: number | null;
	linkTarget: string | null;
}

export interface AppChoice {
	id: string;
	name: string;
	icon: string | null;
}

export interface OpenWithApps {
	default: AppChoice | null;
	others: AppChoice[];
}
