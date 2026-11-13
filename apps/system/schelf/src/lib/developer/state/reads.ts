import { commands } from '#lib/bindings.js';
import { developer } from './developer.svelte';

const get = developer.resources.get.bind(developer.resources);

export const reads = {
	project: (id: string) => get(`project:${id}`, () => commands.developerProject({ id })),
	releases: (id: string) => get(`releases:${id}`, () => commands.developerReleases({ id })),
	release: (id: string, release: string) => get(`release:${id}:${release}`, () => commands.developerRelease({ id, release })),
	stats: (id: string, days: number) => get(`stats:${id}:${days}`, () => commands.developerStats({ id, days })),
	people: (id: string, channel: string) => get(`people:${id}:${channel}`, () => commands.developerPeople({ id, channel })),
	tools: (publisher: string) => get(`tools:${publisher}`, () => commands.developerTools({ publisher })),
	members: (publisher: string) => get(`members:${publisher}`, () => commands.developerMembers({ publisher })),
	verification: (publisher: string) => get(`verification:${publisher}`, () => commands.developerVerification({ publisher })),
	namespaces: (publisher: string) => get(`namespaces:${publisher}`, () => commands.developerNamespaces({ publisher })),
	domain: (publisher: string) => get(`domain:${publisher}`, () => commands.developerDomain({ publisher }))
};

/** Marks what a change to project `id` may have changed, reading again what's on screen. */
export function changed(id: string) {
	for (const prefix of [`project:${id}`, `releases:${id}`, `release:${id}:`, `people:${id}:`]) developer.resources.expire(prefix);
	if (developer.publisher) developer.resources.expire(`projects:${developer.publisher.id}`);
}
