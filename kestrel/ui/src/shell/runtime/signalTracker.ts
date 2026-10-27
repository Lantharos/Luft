import GObject from 'gi://GObject';

type Handler = (...args: any[]) => unknown;

interface Emitter {
  connect(signal: string, handler: Handler): number;
  connect_after(signal: string, handler: Handler): number;
  disconnect(id: number): void;
}

type DestroyableType = (abstract new (...args: any[]) => GObject.Object) & { $gtype: GObject.GType };

interface SignalData {
  ownerSignals: number[];
  destroyId: number;
}

const destroyableTypes: DestroyableType[] = [];

const hasDestroySignal = (obj: unknown): obj is Emitter => destroyableTypes.some(type => obj instanceof type);

const objectProto = (obj: object): Emitter => (obj instanceof GObject.Object
  ? GObject.Object.prototype
  : Object.getPrototypeOf(obj)) as Emitter;

const disconnectSignal = (obj: object, id: number): void => {
  objectProto(obj).disconnect.call(obj, id);
};

interface TransientSignalHolderSignals extends GObject.Object.SignalSignatures {
  'destroy': () => void;
}

export const TransientSignalHolder = GObject.registerClass({
  Signals: { 'destroy': {} },
}, class TransientSignalHolder extends GObject.Object {
  declare emit: GObject.SignalMethods<this, TransientSignalHolderSignals>['emit'];

  constructor(owner?: object) {
    super();

    if (hasDestroySignal(owner))
      connectObject(owner, 'destroy', () => this.destroy(), this);
  }

  destroy(): void {
    this.emit('destroy');
  }
});
export type TransientSignalHolder = InstanceType<typeof TransientSignalHolder>;
registerDestroyableType(TransientSignalHolder);

class SignalManager {
  private static singleton?: SignalManager;

  static getDefault(): SignalManager {
    SignalManager.singleton ??= new SignalManager();
    return SignalManager.singleton;
  }

  private readonly signalTrackers = new Map<object, SignalTracker>();

  constructor() {
    global.connect_after('shutdown', () => {
      [...this.signalTrackers.values()].forEach(tracker => tracker.destroy());
      this.signalTrackers.clear();
    });
  }

  getSignalTracker(obj: object): SignalTracker {
    let signalTracker = this.signalTrackers.get(obj);
    if (signalTracker === undefined) {
      signalTracker = new SignalTracker(obj);
      this.signalTrackers.set(obj, signalTracker);
    }
    return signalTracker;
  }

  maybeGetSignalTracker(obj: object): SignalTracker | null {
    return this.signalTrackers.get(obj) ?? null;
  }

  removeSignalTracker(obj: object): void {
    this.signalTrackers.delete(obj);
  }
}

class SignalTracker {
  private ownerDestroyId = 0;
  private owner: object | undefined;
  private readonly map = new Map<object, SignalData>();

  constructor(owner: object) {
    if (hasDestroySignal(owner))
      this.ownerDestroyId = owner.connect_after('destroy', () => this.clear());

    this.owner = owner;
  }

  private getSignalData(obj: object): SignalData {
    let data = this.map.get(obj);
    if (data === undefined) {
      data = { ownerSignals: [], destroyId: 0 };
      this.map.set(obj, data);
    }
    return data;
  }

  private trackDestroy(obj: Emitter): void {
    const signalData = this.getSignalData(obj);
    if (signalData.destroyId) return;
    signalData.destroyId = obj.connect_after('destroy', () => this.untrack(obj));
  }

  private removeTracker(): void {
    const owner = this.owner;
    if (!owner) return;

    if (this.ownerDestroyId)
      disconnectSignal(owner, this.ownerDestroyId);

    SignalManager.getDefault().removeSignalTracker(owner);

    this.ownerDestroyId = 0;
    this.owner = undefined;
  }

  track(obj: object, ...handlerIds: number[]): void {
    if (hasDestroySignal(obj))
      this.trackDestroy(obj);

    this.getSignalData(obj).ownerSignals.push(...handlerIds);
  }

  untrack(obj: object): void {
    const { ownerSignals, destroyId } = this.getSignalData(obj);
    this.map.delete(obj);

    const owner = this.owner!;
    const ownerProto = objectProto(owner);
    ownerSignals.forEach(id => ownerProto.disconnect.call(owner, id));
    if (destroyId)
      disconnectSignal(obj, destroyId);

    if (this.map.size === 0)
      this.removeTracker();
  }

  clear(): void {
    this.map.forEach((_, obj) => this.untrack(obj));
  }

  destroy(): void {
    this.clear();
    this.removeTracker();
  }
}

type SignalArgs = [signalName: string, handler: Handler, flags: number, ...rest: unknown[]];

const signalArgs = (args: unknown[]): SignalArgs => {
  const [signalName, handler, arg, ...rest] = args as [string, Handler, unknown, ...unknown[]];
  if (typeof arg !== 'number')
    return [signalName, handler, 0, arg, ...rest];

  const flags = arg;
  let flagsMask = 0;
  Object.values(GObject.ConnectFlags).forEach(v => (flagsMask |= v as number));
  if (!(flags & flagsMask))
    throw new Error(`Invalid flag value ${flags}`);
  if (flags & GObject.ConnectFlags.SWAPPED)
    throw new Error('Swapped signals are not supported');
  return [signalName, handler, flags, ...rest];
};

const connectSignal = (emitter: object, signalName: string, handler: Handler, flags: number): number => {
  const isGObject = emitter instanceof GObject.Object;
  const proto = objectProto(emitter);
  const connect = (flags & GObject.ConnectFlags.AFTER) && isGObject ? proto.connect_after : proto.connect;
  return connect.call(emitter, signalName, handler);
};

export function connectObject(thisObj: object, ...args: unknown[]): void {
  const signalIds: number[] = [];
  while (args.length > 1) {
    const [signalName, handler, flags, ...rest] = signalArgs(args);
    signalIds.push(connectSignal(thisObj, signalName, handler, flags));
    args = rest;
  }

  const [obj] = args as [object | undefined];
  if (!obj)
    logError(new Error('No object to track signals'));
  const tracker = SignalManager.getDefault().getSignalTracker(thisObj);
  tracker.track(obj ?? globalThis, ...signalIds);
}

export function disconnectObject(thisObj: object, obj: object): void {
  SignalManager.getDefault().maybeGetSignalTracker(thisObj)?.untrack(obj);
}

export function registerDestroyableType(gtype: DestroyableType): void {
  if (!GObject.type_is_a(gtype.$gtype, GObject.Object.$gtype))
    throw new Error(`${gtype} is not a GObject subclass`);

  if (!GObject.signal_lookup('destroy', gtype.$gtype))
    throw new Error(`${gtype} does not have a destroy signal`);

  destroyableTypes.push(gtype);
}
