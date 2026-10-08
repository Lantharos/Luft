import AccountsService from 'gi://AccountsService';

import type { GreeterConfig } from './config.js';

export const displayName = (user: AccountsService.User) => user.get_real_name() || user.user_name;

export class Accounts {
  private readonly manager = AccountsService.UserManager.get_default();

  constructor(changed: () => void) {
    this.manager.connect('notify::is-loaded', changed);
    this.manager.connect('user-added', changed);
    this.manager.connect('user-removed', changed);
  }

  get loaded(): boolean {
    return this.manager.is_loaded;
  }

  listed(config: GreeterConfig): AccountsService.User[] {
    if (!config.showUsers) return [];
    return this.manager.list_users()
      .filter(user => !user.system_account && !user.locked && !config.hiddenUsers.includes(user.user_name))
      .sort((a, b) => displayName(a).localeCompare(displayName(b)));
  }

  hasUnlisted(config: GreeterConfig): boolean {
    return !config.showUsers || config.hiddenUsers.length > 0;
  }

  lastSignedIn(users: AccountsService.User[]): AccountsService.User | null {
    return users.reduce<AccountsService.User | null>((latest, user) =>
      !latest || user.get_login_time() > latest.get_login_time() ? user : latest, null);
  }

  find(name: string): AccountsService.User {
    return this.manager.get_user(name);
  }
}
