export type Status = 'uploading' | 'checking' | 'failed' | 'in-review' | 'changes-requested' | 'rejected' | 'rolling-out' | 'live' | 'withdrawn' | 'pulled';
export type Release = { release: string; version: string; channel: string; status: Status; commit: string | null; created: string };
export type Artifact = { platform: string; kind: string; url: string; sha256: string };
type IndexRelease = { version: string; channel: string; artifacts: Artifact[] };

const API = 'https://schelf.store/api/v1/publish/apps';
const INDEX = 'https://dl.schelf.store/index/v1/apps';
const RETRYABLE: Status[] = ['uploading', 'failed'];
const SETTLING: Status[] = ['uploading', 'checking'];
const OUT: Status[] = ['rolling-out', 'live'];

export const taken = (release: Release) => !RETRYABLE.includes(release.status);
export const settling = (release: Release) => SETTLING.includes(release.status);
export const isOut = (release: Release) => OUT.includes(release.status);

async function identity() {
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const token = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !token) throw new Error('Run this in a GitHub Actions job with permissions: id-token: write');
  const response = await fetch(`${url}&audience=schelf.store`, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`GitHub didn't hand out an identity token: ${response.status}`);
  return ((await response.json()) as { value: string }).value;
}

async function request(path: string, init: RequestInit = {}) {
  return fetch(`${API}/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${await identity()}`, 'content-type': 'application/json' },
  });
}

async function read<T>(response: Response) {
  if (!response.ok) throw new Error(`schelf.store answered ${response.status} for ${response.url}: ${await response.text()}`);
  return (await response.json()) as T;
}

export async function releases(id: string) {
  const response = await request(`${id}/releases`);
  if (response.status === 404) return undefined;
  return (await read<{ releases: Release[] }>(response)).releases;
}

export async function promote(id: string, version: string, channel: string, notes: string) {
  return read<Release>(await request(`${id}/promote`, { method: 'POST', body: JSON.stringify({ version, channel, notes }) }));
}

export async function listed(id: string) {
  const response = await fetch(`${INDEX}/${id}.json`);
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`schelf.store answered ${response.status} for ${id}`);
  return ((await response.json()) as { releases: IndexRelease[] }).releases;
}
