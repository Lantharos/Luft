import { t } from '@luft/i18n';
import type { Enterprise, Family, Ip, Profile, Security } from '@luft/network';
import { configurable } from './profile';

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

const isIpv4 = (text: string) => {
	const parts = text.split('.');
	return parts.length === 4 && parts.every((part) => OCTET.test(part));
};

function isIpv6(text: string) {
	if (!text.includes(':') || /[[\]/%]/.test(text)) return false;
	try {
		new URL(`http://[${text}]/`);
		return true;
	} catch {
		return false;
	}
}

const isAddress = (family: Family, text: string) => (family === 'ipv4' ? isIpv4(text) : isIpv6(text));

function isNetwork(family: Family, text: string, prefixRequired: boolean) {
	const [address, prefix, ...rest] = text.split('/');
	if (rest.length || !isAddress(family, address)) return false;
	if (prefix === undefined) return !prefixRequired;
	return /^\d+$/.test(prefix) && Number(prefix) <= EXAMPLES[family].prefix;
}

const isMac = (text: string) => MAC.test(text);

export function minimumPassword(security: Security) {
	if (security === 'wep') return 5;
	if (security === 'psk' || security === 'sae') return 8;
	return 0;
}

function checkIp(family: Family, ip: Ip, errors: Errors) {
	const example = EXAMPLES[family];
	if (!configurable(ip.method)) return;
	if (ip.method === 'manual') {
		if (!ip.addresses.length) errors[`${family}.addresses`] = t('settings-network-error-no-addresses');
		ip.addresses.forEach((address, index) => {
			if (!isNetwork(family, address, true)) errors[`${family}.address.${index}`] = t('settings-network-error-address', { example: `${example.address}/${family === 'ipv4' ? 24 : 64}` });
		});
		if (ip.gateway && !isAddress(family, ip.gateway)) errors[`${family}.gateway`] = t('settings-network-error-router', { example: example.router });
	}
	const badServer = ip.dns.find((server) => !isAddress(family, server));
	if (badServer) errors[`${family}.dns`] = t('settings-network-error-dns', { address: badServer });
	const badDomain = ip.search.find((domain) => !DOMAIN.test(domain));
	if (badDomain) errors[`${family}.search`] = t('settings-network-error-search-domain', { domain: badDomain });
	ip.routes.forEach((route, index) => {
		if (!isNetwork(family, route.destination, false)) errors[`${family}.route.${index}.destination`] = t('settings-network-error-route', { example: family === 'ipv4' ? '10.0.0.0/8' : '2001:db8::/32' });
		if (route.gateway && !isAddress(family, route.gateway)) errors[`${family}.route.${index}.gateway`] = t('settings-network-error-router', { example: example.router });
		if (route.metric !== null && !(Number.isInteger(route.metric) && route.metric >= 0)) errors[`${family}.route.${index}.metric`] = t('settings-network-error-priority');
	});
}

export function checkEnterprise(enterprise: Enterprise, errors: Errors) {
	if (!enterprise.identity.trim()) errors['enterprise.identity'] = t('settings-network-error-username');
	if (enterprise.domain && !DOMAIN.test(enterprise.domain)) errors['enterprise.domain'] = t('settings-network-error-domain');
	if (enterprise.method === 'tls') {
		if (!enterprise.clientCertificate) errors['enterprise.clientCertificate'] = t('settings-network-error-certificate');
		if (!enterprise.privateKey) errors['enterprise.privateKey'] = t('settings-network-error-private-key');
	}
}

interface Context {
	password: string;
	passwordNeeded: boolean;
	customMac: boolean;
}

export function checkProfile(profile: Profile, { password, passwordNeeded, customMac }: Context): Errors {
	const errors: Errors = {};
	if (!profile.name.trim()) errors.name = t('settings-network-error-name');
	checkIp('ipv4', profile.ipv4, errors);
	checkIp('ipv6', profile.ipv6, errors);
	if (profile.kind === 'wired' || profile.kind === 'wifi') {
		const [lowest, highest] = MTU_RANGE;
		if (profile.mtu !== 0 && !(Number.isInteger(profile.mtu) && profile.mtu >= lowest && profile.mtu <= highest)) errors.mtu = t('settings-network-error-mtu', { lowest, highest });
		if (customMac && !isMac(profile.mac)) errors.mac = t('settings-network-error-mac');
	}
	const wireless = profile.wireless;
	if (wireless?.security === 'enterprise' && wireless.enterprise) checkEnterprise(wireless.enterprise, errors);
	if (wireless?.security === 'enterprise' && wireless.enterprise?.method !== 'tls' && passwordNeeded && !password) errors.password = t('settings-network-error-password');
	const minimum = wireless ? minimumPassword(wireless.security) : 0;
	if (minimum && (password || passwordNeeded) && password.length < minimum) errors.password = t('settings-network-error-password-length', { count: minimum });
	return errors;
}
