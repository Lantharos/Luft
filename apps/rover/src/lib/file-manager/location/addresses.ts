const SCHEME = /^([a-z][a-z0-9+.-]*):\/\//i;
const ALIASES: Record<string, string> = { ssh: 'sftp', http: 'dav', https: 'davs', webdav: 'dav', webdavs: 'davs' };
const NAMES: Record<string, string> = {
	sftp: 'SFTP',
	smb: 'Windows file sharing (SMB)',
	ftp: 'FTP',
	ftps: 'FTP with encryption',
	dav: 'WebDAV',
	davs: 'WebDAV with encryption',
	nfs: 'NFS',
	afp: 'Apple file sharing',
	mtp: 'Phone or camera',
	gphoto2: 'Camera',
	afc: 'iPhone or iPad'
};

export function looksRemote(text: string) {
	const typed = text.trim();
	const scheme = SCHEME.exec(typed)?.[1].toLowerCase();
	return (scheme !== undefined && scheme !== 'file') || typed.startsWith('\\\\');
}

export function normalizeAddress(text: string) {
	const typed = text.trim();
	if (!typed) return null;
	if (typed.startsWith('\\\\')) return `smb://${typed.slice(2).replaceAll('\\', '/')}`;
	const scheme = SCHEME.exec(typed)?.[1].toLowerCase();
	if (scheme) {
		const known = ALIASES[scheme] ?? scheme;
		return scheme === known ? typed : `${known}${typed.slice(scheme.length)}`;
	}
	if (/^[^\s/@]+@[^\s/]+/.test(typed)) return `sftp://${typed}`;
	if (/^[^\s/]+(\/.*)?$/.test(typed)) return `smb://${typed}`;
	return null;
}

export function protocolName(uri: string) {
	const scheme = SCHEME.exec(uri)?.[1].toLowerCase();
	return scheme ? (NAMES[scheme] ?? scheme.toUpperCase()) : null;
}

export function addressName(uri: string) {
	try {
		const url = new URL(uri);
		const path = decodeURIComponent(url.pathname).replace(/\/+$/, '');
		const folder = path.split('/').filter(Boolean).at(-1);
		return folder ? `${folder} on ${url.host}` : url.host;
	} catch {
		return uri;
	}
}

export function sameAddress(a: string, b: string) {
	return a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
}
