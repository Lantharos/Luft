import type { Extension } from '@luft/extension-api';

import type { Account, DeviceCode, ItemHit, Place, WaitingIn } from './types.js';

export type Granted = 'taskbar' | 'popups' | 'notifications' | 'search' | 'network';

export const SERVER = 'https://app.pult.sh';
const TOKEN = 'token';
const ACCOUNT = 'account';

export class SignedOut extends Error {}

/** Pult was reached and said no. */
export class Refused extends Error {
  constructor(readonly status: number) {
    super();
  }
}

/** Pult's API as the person signed in on this computer, with the token kept in the keyring. */
export class PultClient {
  private token: string | null = null;

  constructor(private readonly extension: Extension<Granted>) {}

  get account(): Account | null {
    return this.extension.storage.get<Account>(ACCOUNT) ?? null;
  }

  async load(): Promise<boolean> {
    this.token = await this.extension.secrets.get(TOKEN);
    return !!this.token;
  }

  get signedIn(): boolean {
    return !!this.token;
  }

  private async call<Answer>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: object): Promise<{ status: number; answer: Answer }> {
    const response = await this.extension.network.fetch(`${SERVER}/api${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...this.token && { authorization: `Bearer ${this.token}` },
      },
      body: body && JSON.stringify(body),
    });
    if (response.status === 401) {
      await this.forget();
      throw new SignedOut();
    }
    if (!response.ok && response.status !== 202) throw new Refused(response.status);
    return { status: response.status, answer: response.status === 204 ? undefined as Answer : response.json<Answer>() };
  }

  async waiting(): Promise<WaitingIn[]> {
    return (await this.call<{ places: WaitingIn[] }>('GET', '/me/waiting')).answer.places;
  }

  async find(query: string): Promise<(ItemHit & { place: Place })[]> {
    return (await this.call<{ items: (ItemHit & { place: Place })[] }>('GET', `/me/find?q=${encodeURIComponent(query)}`)).answer.items;
  }

  async requestCode(name: string): Promise<DeviceCode> {
    return (await this.call<DeviceCode>('POST', '/devices/code', { name })).answer;
  }

  /** Asks whether the code was confirmed: true once signed in, false while it waits. Pult refuses with 410 once the code expired or was turned down. */
  async redeem(code: DeviceCode): Promise<boolean> {
    const { status, answer } = await this.call<{ token: string; user: Account }>('POST', '/devices/token', { deviceCode: code.deviceCode });
    if (status === 202) return false;
    this.token = answer.token;
    await this.extension.secrets.set(TOKEN, answer.token);
    this.extension.storage.set(ACCOUNT, { ...answer.user });
    return true;
  }

  async signOut(): Promise<void> {
    await this.call('DELETE', '/devices/current').catch(() => {});
    await this.forget();
  }

  private async forget(): Promise<void> {
    this.token = null;
    this.extension.storage.delete(ACCOUNT);
    await this.extension.secrets.delete(TOKEN);
  }
}
