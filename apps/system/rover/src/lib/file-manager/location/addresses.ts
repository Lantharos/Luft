import { t } from '@luft/i18n';
const SCHEME = /^([a-z][a-z0-9+.-]*):\/\//i;
const ALIASES: Record<string, string> = { ssh: 'sftp', http: 'dav', https: 'davs', webdav: 'dav', webdavs: 'davs' };
const NAMES: Record<string, string> = {
	sftp: 'rover-protocol-sftp',
	smb: 'rover-protocol-smb',
	ftp: 'rover-protocol-ftp',
	ftps: 'rover-protocol-ftps',
	dav: 'rover-protocol-dav',
	davs: 'rover-protocol-davs',
	nfs: 'rover-protocol-nfs',
	afp: 'rover-protocol-afp',
	mtp: 'rover-protocol-mtp',
	gphoto2: 'rover-protocol-gphoto2',
	afc: 'rover-protocol-afc'
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
	if (!scheme) return null;
	const name = NAMES[scheme];
	return name ? t(name) : scheme.toUpperCase();
}

export function addressName(uri: string) {
	try {
		const url = new URL(uri);
		const path = decodeURIComponent(url.pathname).replace(/\/+$/, '');
		const folder = path.split('/').filter(Boolean).at(-1);
		return folder ? t('rover-address-name', { folder, host: url.host }) : url.host;

	} catch {
		return uri;
	}
}

export function sameAddress(a: string, b: string) {
	return a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
}
