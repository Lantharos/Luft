import type { Security } from '../api';
import { configurable, type Enterprise, type Family, type Ip, type Profile } from './profile';

export type Errors = Record<string, string>;

const MTU_RANGE = [576, 9000] as const;
const OCTET = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const DOMAIN = /^(?!-)[a-z0-9-]{1,63}(\.(?!-)[a-z0-9-]{1,63})*\.?$/i;
const MAC = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;
const EXAMPLES: Record<Family, { address: string; router: string; prefix: number }> = {
	ipv4: { address: '192.168.1.20', router: '192.168.1.1', prefix: 32 },
	ipv6: { address: '2001:db8::20', router: '2001:db8::1', prefix: 128 }
};

export const words = (text: string) => text.split(/[\s,]+/).filter(Boolean);

export const isIpv4 = (text: string) => {
	const parts = text.split('.');
	return parts.length === 4 && parts.every((part) => OCTET.test(part));
};

export function isIpv6(text: string) {
	if (!text.includes(':') || /[[\]/%]/.test(text)) return false;
	try {
		new URL(`http://[${text}]/`);
		return true;
	} catch {
		return false;
	}
}

export const isAddress = (family: Family, text: string) => (family === 'ipv4' ? isIpv4(text) : isIpv6(text));

function isNetwork(family: Family, text: string, prefixRequired: boolean) {
	const [address, prefix, ...rest] = text.split('/');
	if (rest.length || !isAddress(family, address)) return false;
	if (prefix === undefined) return !prefixRequired;
	return /^\d+$/.test(prefix) && Number(prefix) <= EXAMPLES[family].prefix;
}

export const isMac = (text: string) => MAC.test(text);

export function minimumPassword(security: Security) {
	if (security === 'wep') return 5;
	if (security === 'psk' || security === 'sae') return 8;
	return 0;
}

function checkIp(family: Family, ip: Ip, errors: Errors) {
	const example = EXAMPLES[family];
	if (!configurable(ip.method)) return;
	if (ip.method === 'manual') {
		if (!ip.addresses.length) errors[`${family}.addresses`] = 'Add at least one address';
		ip.addresses.forEach((address, index) => {
			if (!isNetwork(family, address, true)) errors[`${family}.address.${index}`] = `Enter an address with its prefix, like ${example.address}/${family === 'ipv4' ? 24 : 64}`;
		});
		if (ip.gateway && !isAddress(family, ip.gateway)) errors[`${family}.gateway`] = `Enter a router address, like ${example.router}`;
	}
	const badServer = ip.dns.find((server) => !isAddress(family, server));
	if (badServer) errors[`${family}.dns`] = `“${badServer}” isn't a valid address`;
	const badDomain = ip.search.find((domain) => !DOMAIN.test(domain));
	if (badDomain) errors[`${family}.search`] = `“${badDomain}” isn't a valid domain`;
	ip.routes.forEach((route, index) => {
		if (!isNetwork(family, route.destination, false)) errors[`${family}.route.${index}.destination`] = `Enter a network, like ${family === 'ipv4' ? '10.0.0.0/8' : '2001:db8::/32'}`;
		if (route.gateway && !isAddress(family, route.gateway)) errors[`${family}.route.${index}.gateway`] = `Enter a router address, like ${example.router}`;
		if (route.metric !== null && !(Number.isInteger(route.metric) && route.metric >= 0)) errors[`${family}.route.${index}.metric`] = 'Use a whole number for the priority';
	});
}

export function checkEnterprise(enterprise: Enterprise, errors: Errors) {
	if (!enterprise.identity.trim()) errors['enterprise.identity'] = 'Enter your username';
	if (enterprise.domain && !DOMAIN.test(enterprise.domain)) errors['enterprise.domain'] = 'Enter a domain, like example.com';
	if (enterprise.method === 'tls') {
		if (!enterprise.clientCertificate) errors['enterprise.clientCertificate'] = 'Choose your certificate';
		if (!enterprise.privateKey) errors['enterprise.privateKey'] = 'Choose your private key';
	}
}

export function checkProfile(profile: Profile, password: string, passwordNeeded: boolean): Errors {
	const errors: Errors = {};
	if (!profile.name.trim()) errors.name = 'Enter a name';
	checkIp('ipv4', profile.ipv4, errors);
	checkIp('ipv6', profile.ipv6, errors);
	if (profile.kind === 'wired' || profile.kind === 'wifi') {
		const [lowest, highest] = MTU_RANGE;
		if (profile.mtu !== 0 && !(Number.isInteger(profile.mtu) && profile.mtu >= lowest && profile.mtu <= highest)) errors.mtu = `Use a number from ${lowest} to ${highest}, or leave it empty`;
		if (!['', 'preserve', 'permanent', 'random', 'stable'].includes(profile.mac) && !isMac(profile.mac)) errors.mac = 'Enter an address like 12:34:56:78:9A:BC';
	}
	const wireless = profile.wireless;
	if (wireless?.security === 'enterprise' && wireless.enterprise) checkEnterprise(wireless.enterprise, errors);
	if (wireless?.security === 'enterprise' && wireless.enterprise?.method !== 'tls' && passwordNeeded && !password) errors.password = 'Enter your password';
	const minimum = wireless ? minimumPassword(wireless.security) : 0;
	if (minimum && (password || passwordNeeded) && password.length < minimum) errors.password = `Use at least ${minimum} characters`;
	return errors;
}
