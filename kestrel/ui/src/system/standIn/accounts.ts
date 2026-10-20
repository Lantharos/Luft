import AccountsService from 'gi://AccountsService';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import { standInBus } from './bus.js';

const ACCOUNTS = 'org.freedesktop.Accounts';
const ACCOUNTS_PATH = '/org/freedesktop/Accounts';
const USER = 'org.freedesktop.Accounts.User';
const READ = GObject.ParamFlags.READABLE;

interface UserSignals extends GObject.Object.SignalSignatures {
  'changed': () => void;
  'sessions-changed': () => void;
}

const StandInUser = GObject.registerClass({
  Properties: {
    'is-loaded': GObject.ParamSpec.boolean('is-loaded', null, null, READ, true),
    'uid': GObject.ParamSpec.uint64('uid', null, null, READ, 0, Number.MAX_SAFE_INTEGER, 0),
    'user-name': GObject.ParamSpec.string('user-name', null, null, READ, ''),
    'real-name': GObject.ParamSpec.string('real-name', null, null, READ, ''),
    'icon-file': GObject.ParamSpec.string('icon-file', null, null, READ, ''),
    'login-time': GObject.ParamSpec.int64('login-time', null, null, READ, 0, Number.MAX_SAFE_INTEGER, 0),
    'password-mode': GObject.ParamSpec.int('password-mode', null, null, READ, 0, 2, 0),
    'locked': GObject.ParamSpec.boolean('locked', null, null, READ, false),
    'system-account': GObject.ParamSpec.boolean('system-account', null, null, READ, false),
    'language': GObject.ParamSpec.string('language', null, null, READ, ''),
  },
  Signals: { 'changed': {}, 'sessions-changed': {} },
}, class StandInUser extends GObject.Object {
  private readonly proxy: Gio.DBusProxy;
  declare connect: GObject.SignalMethods<this, UserSignals>['connect'];
  declare emit: GObject.SignalMethods<this, UserSignals>['emit'];

  constructor(connection: Gio.DBusConnection, path: string) {
    super();
    this.proxy = Gio.DBusProxy.new_sync(connection, Gio.DBusProxyFlags.NONE, null, ACCOUNTS, path, USER, null);
    this.proxy.connect('g-properties-changed', () => this.emit('changed'));
    this.proxy.connect('g-signal', (_proxy, _sender, signal) => {
      if (signal === 'Changed') this.emit('changed');
    });
  }

  private value<T>(name: string, fallback: T): T {
    return (this.proxy.get_cached_property(name)?.deepUnpack() as T | undefined) ?? fallback;
  }

  get is_loaded(): boolean { return true; }
  get uid(): number { return this.value('Uid', 0); }
  get user_name(): string { return this.value('UserName', ''); }
  get real_name(): string { return this.value('RealName', ''); }
  get icon_file(): string { return this.value('IconFile', ''); }
  get login_time(): number { return this.value('LoginTime', 0); }
  get password_mode(): AccountsService.UserPasswordMode { return this.value('PasswordMode', AccountsService.UserPasswordMode.REGULAR); }
  get locked(): boolean { return this.value('Locked', false); }
  get system_account(): boolean { return this.value('SystemAccount', false); }
  get language(): string { return this.value('Language', ''); }

  get_uid(): number { return this.uid; }
  get_user_name(): string { return this.user_name; }
  get_real_name(): string { return this.real_name; }
  get_icon_file(): string { return this.icon_file; }
  get_login_time(): number { return this.login_time; }
  get_password_mode(): AccountsService.UserPasswordMode { return this.password_mode; }
  get_language(): string { return this.language; }
});

type StandInUser = InstanceType<typeof StandInUser>;

const StandInManager = GObject.registerClass({
  Properties: {
    'is-loaded': GObject.ParamSpec.boolean('is-loaded', null, null, READ, true),
    'has-multiple-users': GObject.ParamSpec.boolean('has-multiple-users', null, null, READ, false),
  },
  Signals: {
    'user-added': { param_types: [GObject.Object.$gtype] },
    'user-removed': { param_types: [GObject.Object.$gtype] },
    'user-changed': { param_types: [GObject.Object.$gtype] },
  },
}, class StandInManager extends GObject.Object {
  private readonly users = new Map<string, StandInUser>();

  constructor(private readonly connection: Gio.DBusConnection) {
    super();
  }

  get is_loaded(): boolean { return true; }
  get has_multiple_users(): boolean { return this.list_users().length > 1; }

  get_user(name: string): StandInUser {
    return this.user(this.call('FindUserByName', new GLib.Variant('(s)', [name])) as string);
  }

  list_users(): StandInUser[] {
    return (this.call('ListCachedUsers', null) as string[]).map(path => this.user(path));
  }

  private user(path: string): StandInUser {
    let user = this.users.get(path);
    if (!user) {
      user = new StandInUser(this.connection, path);
      this.users.set(path, user);
    }
    return user;
  }

  private call(method: string, parameters: GLib.Variant | null): unknown {
    return this.connection.call_sync(ACCOUNTS, ACCOUNTS_PATH, ACCOUNTS, method, parameters, null,
      Gio.DBusCallFlags.NONE, -1, null).deepUnpack<[unknown]>()[0];
  }
});

export function useStandInAccounts(): void {
  const connection = standInBus();
  if (!connection) return;
  const manager = new StandInManager(connection);
  Object.defineProperty(AccountsService.UserManager, 'get_default', { value: () => manager });
}
