import GLib from 'gi://GLib';

const MANAGER = `<node><interface name="org.freedesktop.PackageKit">
  <method name="CreateTransaction"><arg type="o" direction="out"/></method>
  <method name="GetTransactionList"><arg type="ao" direction="out"/></method>
  <signal name="TransactionListChanged"><arg type="as"/></signal>
</interface></node>`;
const OFFLINE = `<node><interface name="org.freedesktop.PackageKit.Offline">
  <method name="GetPrepared"><arg type="as" direction="out"/></method>
  <method name="GetResults">
    <arg type="b" direction="out"/><arg type="as" direction="out"/><arg type="u" direction="out"/>
    <arg type="t" direction="out"/><arg type="u" direction="out"/><arg type="s" direction="out"/>
  </method>
</interface></node>`;
const TRANSACTION = `<node><interface name="org.freedesktop.PackageKit.Transaction">
  <property name="Role" type="u" access="read"/>
  <property name="Status" type="u" access="read"/>
  <property name="Percentage" type="u" access="read"/>
  <property name="TransactionFlags" type="t" access="read"/>
  <property name="Sender" type="s" access="read"/>
  <property name="Uid" type="u" access="read"/>
  <method name="SetHints"><arg type="as" direction="in"/></method>
  <method name="RefreshCache"><arg type="b" direction="in"/></method>
  <method name="GetUpdates"><arg type="t" direction="in"/></method>
  <method name="GetDetails"><arg type="as" direction="in"/></method>
  <method name="Resolve"><arg type="t" direction="in"/><arg type="as" direction="in"/></method>
  <method name="UpdatePackages"><arg type="t" direction="in"/><arg type="as" direction="in"/></method>
  <method name="Cancel"/>
  <signal name="Package"><arg type="u"/><arg type="s"/><arg type="s"/></signal>
  <signal name="Details"><arg type="a{sv}"/></signal>
  <signal name="ErrorCode"><arg type="u"/><arg type="s"/></signal>
  <signal name="Finished"><arg type="u"/><arg type="u"/></signal>
  <signal name="Destroy"/>
</interface></node>`;

const PATH = '/org/freedesktop/PackageKit';
export const PACKAGEKIT_NAME = 'org.freedesktop.PackageKit';

const UPDATES = [
  {id: 'kernel;6.17.4-300.fc45;x86_64;updates', installed: '6.17.1-300.fc45', summary: 'The Linux kernel', size: 72_400_000},
  {id: 'mesa-dri-drivers;25.2.5-1.fc45;x86_64;updates', installed: '25.2.3-1.fc45', summary: 'Mesa-based DRI drivers', size: 31_800_000},
  {id: 'systemd;258.2-1.fc45;x86_64;updates', installed: '258.1-1.fc45', summary: 'System and service manager', size: 6_200_000},
  {id: 'openssl-libs;3.5.4-1.fc45;x86_64;updates', installed: '3.5.2-1.fc45', summary: 'A general purpose cryptography library', size: 2_600_000, security: true},
];
const INFO = {installed: 1, normal: 5, security: 8};
const ROLE = {refresh: 13, resolve: 17, details: 3, updates: 9, update: 22};
const STATUS = {query: 2, refresh: 13, download: 8, update: 10, finished: 18};
const EXIT = {success: 1, cancelled: 3};
const ONLY_DOWNLOAD = 1 << 3;
const CANCELLED = 65;
const STEP = 150;
const REFRESH_STEPS = 10;
const LINGER = 500;

const name = id => id.split(';')[0];

export function publishPackageKit(publish, calls) {
  const transactions = new Map();
  let prepared = [];
  let next = 1;
  let manager = null;

  const listChanged = () => manager.emit_signal('TransactionListChanged', new GLib.Variant('(as)', [[...transactions.keys()]]));

  function createTransaction(sender) {
    const path = `/${next++}_fixture`;
    const state = {Role: 0, Status: 1, Percentage: 101, TransactionFlags: 0, Sender: sender, Uid: 0, timer: 0, finish: null};
    const set = (property, signature, value) => {
      state[property] = value;
      exported.emit_property_changed(property, new GLib.Variant(signature, value));
      exported.flush();
    };
    const emit = (signal, signature, values) => exported.emit_signal(signal, new GLib.Variant(signature, values));
    const finish = code => {
      if (state.timer) GLib.source_remove(state.timer);
      state.timer = 0;
      set('Status', 'u', STATUS.finished);
      emit('Finished', '(uu)', [code, 0]);
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, LINGER, () => {
        emit('Destroy', '()', []);
        exported.unexport();
        transactions.delete(path);
        listChanged();
        return GLib.SOURCE_REMOVE;
      });
    };
    const begin = (role, status) => {
      calls.push(`PackageKit ${Object.keys(ROLE).find(key => ROLE[key] === role)}`);
      set('Role', 'u', role);
      set('Status', 'u', status);
    };
    const progress = (steps, status, done) => {
      let step = 0;
      begin(state.Role, status);
      state.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, STEP, () => {
        set('Percentage', 'u', Math.round(++step / steps * 100));
        if (step < steps) return GLib.SOURCE_CONTINUE;
        state.timer = 0;
        done();
        finish(EXIT.success);
        return GLib.SOURCE_REMOVE;
      });
    };
    const answer = (role, emitAll) => {
      begin(role, STATUS.query);
      emitAll();
      finish(EXIT.success);
    };
    const exported = publish(TRANSACTION, {
      get Role() { return state.Role; },
      get Status() { return state.Status; },
      get Percentage() { return state.Percentage; },
      get TransactionFlags() { return state.TransactionFlags; },
      get Sender() { return state.Sender; },
      get Uid() { return state.Uid; },
      SetHints: () => {},
      RefreshCache() {
        state.Role = ROLE.refresh;
        progress(REFRESH_STEPS, STATUS.refresh, () => {});
      },
      GetUpdates() {
        answer(ROLE.updates, () => UPDATES.forEach(update =>
          emit('Package', '(uss)', [update.security ? INFO.security : INFO.normal, update.id, update.summary])));
      },
      GetDetails(ids) {
        answer(ROLE.details, () => UPDATES.filter(update => ids.includes(update.id)).forEach(update =>
          emit('Details', '(a{sv})', [{'package-id': new GLib.Variant('s', update.id), 'download-size': new GLib.Variant('t', update.size)}])));
      },
      Resolve(_filter, names) {
        answer(ROLE.resolve, () => UPDATES.filter(update => names.includes(name(update.id))).forEach(update => {
          const [packageName, , arch] = update.id.split(';');
          emit('Package', '(uss)', [INFO.installed, `${packageName};${update.installed};${arch};installed`, update.summary]);
        }));
      },
      UpdatePackages(flags, ids) {
        state.Role = ROLE.update;
        set('TransactionFlags', 't', flags);
        const downloadOnly = (flags & ONLY_DOWNLOAD) !== 0;
        progress(100, downloadOnly ? STATUS.download : STATUS.update, () => {
          if (downloadOnly) prepared = ids;
        });
      },
      Cancel() {
        if (!state.timer) return;
        calls.push('PackageKit cancel');
        emit('ErrorCode', '(us)', [CANCELLED, 'The task was stopped']);
        finish(EXIT.cancelled);
      },
    }, path);
    transactions.set(path, exported);
    listChanged();
    return path;
  }

  manager = publish(MANAGER, {
    CreateTransactionAsync(_parameters, invocation) {
      invocation.return_value(new GLib.Variant('(o)', [createTransaction(invocation.get_sender())]));
    },
    GetTransactionList: () => [...transactions.keys()],
  }, PATH);
  publish(OFFLINE, {
    GetPrepared: () => prepared,
    GetResultsAsync(_parameters, invocation) {
      invocation.return_dbus_error('org.freedesktop.PackageKit.Offline.Error.NoData', 'No offline update results');
    },
  }, PATH);
}
