import GLib from 'gi://GLib';

import {type DriveProperties, type FixtureDrive, fixtureDrives, type Identity, LINUX_DATA, BASIC_DATA, type Smart} from './drives.js';

const MiB = 1024 ** 2;
const ROOT = '/org/freedesktop/UDisks2';
const WINDOWS_TYPES = ['exfat', 'ntfs', 'vfat'];
const DOS_TYPES: Record<string, string> = {exfat: '0x07', ntfs: '0x07', vfat: '0x0c'};

export type Configuration = [string, Record<string, GLib.Variant>];

interface PartitionTable {
  type: string;
  partitions: string[];
}

export interface PartitionEntry {
  number: number;
  offset: number;
  type: string;
  name: string;
  flags: number;
  uuid: string;
  table: string;
}

interface Encryption {
  passphrase: string;
  cleartext: string;
  inner: Identity;
}

export interface Block extends Identity {
  path: string;
  device: string;
  size: number;
  drive: string;
  IdUsage: string;
  IdVersion: string;
  configuration: Configuration[];
  cryptoBacking: string;
  table: PartitionTable | null;
  partition: PartitionEntry | null;
  encrypted: Encryption | null;
  mountPoints: string[] | null;
}

type PartitionBlock = Block & {partition: PartitionEntry};

export type Drive = DriveProperties & {ata?: Smart; nvme?: Smart; device: string; partitionPrefix: string};

export interface FormatOptions {
  'label'?: string;
  'erase'?: boolean;
  'encrypt.passphrase'?: string;
  'update-partition-type'?: boolean;
  'partition-uuid'?: string;
}

const hasPartition = (block: Block): block is PartitionBlock => block.partition !== null;

export class Failure extends Error {
  readonly dbusName: string;

  constructor(name: string, message: string) {
    super(message);
    this.dbusName = `org.freedesktop.UDisks2.Error.${name}`;
  }
}

const blockPath = (device: string) => `${ROOT}/block_devices/${device}`;
const uuid = () => GLib.uuid_string_random();

export class Model {
  readonly user: string;
  readonly changed: (path: string, removed?: boolean) => void;
  readonly drives: Map<string, Drive>;
  readonly blocks: Map<string, Block>;
  private _mappers: number;

  constructor(user: string, changed: (path: string, removed?: boolean) => void) {
    this.user = user;
    this.changed = changed;
    this.drives = new Map();
    this.blocks = new Map();
    this._mappers = 0;
    for (const fixture of fixtureDrives(user)) this._add(fixture);
  }

  private _add({drive, ata, nvme, device, partitionPrefix, size, table, partitions}: FixtureDrive) {
    this.drives.set(drive.path, {...drive, ata, nvme, device, partitionPrefix});
    const wholeTable: PartitionTable = {type: table, partitions: []};
    const whole = this._block(device, size, drive.path, {table: wholeTable});
    for (const part of partitions) {
      const {name, number, offset, size: length, type, flags, uuid: partitionUuid, mounts, encrypted, ...ids} = part;
      const block = this._block(`${device}${partitionPrefix}${number}`, length, drive.path,
        {partition: {number, offset, type, name, flags, uuid: partitionUuid, table: whole.path}, ...ids});
      if (ids.IdUsage === 'filesystem') block.mountPoints = mounts ?? [];
      if (encrypted) block.encrypted = {...encrypted, cleartext: '/'};
      wholeTable.partitions.push(block.path);
    }
  }

  private _block(device: string, size: number, drive: string, fields: Partial<Block> = {}) {
    const block: Block = {path: blockPath(device), device: `/dev/${device}`, size, drive, IdUsage: '', IdType: '', IdVersion: '', IdLabel: '',
      IdUUID: '', configuration: [], cryptoBacking: '/', table: null, partition: null, encrypted: null, mountPoints: null, ...fields};
    this.blocks.set(block.path, block);
    return block;
  }

  block(path: string) {
    const block = this.blocks.get(path);
    if (!block) throw new Failure('NotFound', `No block device at ${path}`);
    return block;
  }

  private _partition(path: string) {
    const block = this.block(path);
    if (!hasPartition(block)) throw new Failure('NotSupported', 'Not a partition');
    return block;
  }

  private _table(path: string) {
    const {table} = this.block(path);
    if (!table) throw new Failure('NotSupported', 'No partition table');
    return table;
  }

  private _remove(path: string) {
    const block = this.blocks.get(path);
    if (!block) return;
    if (block.encrypted?.cleartext && block.encrypted.cleartext !== '/') this._remove(block.encrypted.cleartext);
    for (const child of block.table?.partitions ?? []) this._remove(child);
    this.blocks.delete(path);
    this.changed(path, true);
  }

  mount(path: string) {
    const block = this.block(path);
    if (block.mountPoints === null) throw new Failure('NotSupported', 'Not a filesystem');
    if (block.mountPoints.length) throw new Failure('AlreadyMounted', `${block.device} is already mounted`);
    block.mountPoints = [`/run/media/${this.user}/${block.IdLabel || block.IdUUID}`];
    this.changed(path);
    return block.mountPoints[0];
  }

  unmount(path: string) {
    const block = this.block(path);
    if (!block.mountPoints?.length) throw new Failure('NotMounted', `${block.device} is not mounted`);
    block.mountPoints = [];
    this.changed(path);
  }

  setLabel(path: string, label: string) {
    this.block(path).IdLabel = label;
    this.changed(path);
  }

  private _busy(block: Block) {
    if (block.mountPoints?.length) throw new Failure('DeviceBusy', `${block.device} is mounted`);
    if (block.encrypted?.cleartext && block.encrypted.cleartext !== '/') throw new Failure('DeviceBusy', `${block.device} is unlocked`);
  }

  format(path: string, type: string, options: FormatOptions) {
    const block = this.block(path);
    this._busy(block);
    for (const child of block.table?.partitions ?? []) this._remove(child);
    Object.assign(block, {table: null, encrypted: null, mountPoints: null, IdUsage: '', IdType: '', IdVersion: '', IdLabel: '', IdUUID: ''});
    if (type === 'gpt' || type === 'dos') {
      block.table = {type, partitions: []};
    } else if (type !== 'empty') {
      const label = options.label ?? '';
      if (options['encrypt.passphrase']) {
        Object.assign(block, {IdUsage: 'crypto', IdType: 'crypto_LUKS', IdVersion: '2', IdUUID: uuid()});
        block.encrypted = {passphrase: options['encrypt.passphrase'], cleartext: '/', inner: {IdType: type, IdLabel: label, IdUUID: uuid()}};
      } else {
        Object.assign(block, {IdUsage: 'filesystem', IdType: type, IdLabel: label, IdUUID: uuid()});
        block.mountPoints = [];
      }
      if (block.partition && options['update-partition-type'])
        block.partition.type = this._partitionType(block.partition.table, options['encrypt.passphrase'] ? 'crypto' : type);
    }
    this.changed(path);
  }

  private _partitionType(table: string, type: string) {
    const kind = this._table(table).type;
    if (kind === 'dos') return DOS_TYPES[type] ?? '0x83';
    return WINDOWS_TYPES.includes(type) ? BASIC_DATA : LINUX_DATA;
  }

  createPartition(tablePath: string, offset: number, size: number, format: string, options: FormatOptions,
    {type = '', name = '', uuid: partitionUuid = uuid()}: {type?: string; name?: string; uuid?: string} = {}) {
    const whole = this.block(tablePath);
    if (!whole.table) throw new Failure('NotSupported', 'No partition table');
    const parts = whole.table.partitions.map(path => this._partition(path)).sort((a, b) => a.partition.offset - b.partition.offset);
    const start = Math.max(offset, MiB);
    const next = parts.find(part => part.partition.offset >= start);
    const limit = next ? next.partition.offset : whole.size - MiB;
    const length = size === 0 ? limit - start : size;
    if (parts.some(part => start < part.partition.offset + part.size && start + length > part.partition.offset) || start + length > limit)
      throw new Failure('Failed', 'The requested space overlaps another partition');
    const drive = this.drives.get(whole.drive)!;
    const number = Math.max(0, ...parts.map(part => part.partition.number)) + 1;
    const block = this._block(`${drive.device}${drive.partitionPrefix}${number}`, length, whole.drive,
      {partition: {number, offset: start, type: type || this._partitionType(tablePath, format), name, flags: 0, uuid: partitionUuid, table: tablePath}});
    whole.table.partitions.push(block.path);
    this.changed(tablePath);
    if (format) this.format(block.path, format, options);
    else this.changed(block.path);
    return block.path;
  }

  deletePartition(path: string) {
    const block = this._partition(path);
    this._busy(block);
    const table = this._table(block.partition.table);
    table.partitions = table.partitions.filter(part => part !== path);
    this._remove(path);
    this.changed(block.partition.table);
  }

  resizePartition(path: string, size: number) {
    const block = this._partition(path);
    const whole = this.block(block.partition.table);
    const limit = this._table(whole.path).partitions.map(part => this._partition(part).partition.offset)
      .filter(offset => offset > block.partition.offset).reduce((a, b) => Math.min(a, b), whole.size - MiB);
    if (block.partition.offset + size > limit) throw new Failure('Failed', 'Not enough free space after the partition');
    block.size = size;
    this.changed(path);
  }

  setPartition<Field extends keyof PartitionEntry>(path: string, field: Field, value: PartitionEntry[Field]) {
    const block = this._partition(path);
    block.partition[field] = value;
    this.changed(path);
  }

  unlock(path: string, passphrase: string) {
    const block = this.block(path);
    if (!block.encrypted) throw new Failure('NotSupported', 'Not encrypted');
    if (block.encrypted.cleartext !== '/') throw new Failure('AlreadyUnlocked', `${block.device} is already unlocked`);
    if (passphrase !== block.encrypted.passphrase) throw new Failure('Failed', 'Error unlocking: Failed to activate device: Operation not permitted');
    return this._open(block);
  }

  byDevice(device: string) {
    const block = [...this.blocks.values()].find(candidate => candidate.device === device);
    if (!block) throw new Failure('NotFound', `No block device ${device}`);
    return block;
  }

  encryptInPlace(device: string, passphrase: string) {
    const block = this.byDevice(device);
    this._busy(block);
    const inner = {IdType: block.IdType, IdLabel: block.IdLabel, IdUUID: block.IdUUID};
    Object.assign(block, {IdUsage: 'crypto', IdType: 'crypto_LUKS', IdVersion: '2', IdUUID: uuid(), mountPoints: null});
    block.encrypted = {passphrase, cleartext: '/', inner};
    this.changed(block.path);
    this._open(block);
    return block.IdUUID;
  }

  decryptInPlace(device: string) {
    const block = this.byDevice(device);
    const clear = block.encrypted && this.blocks.get(block.encrypted.cleartext);
    if (clear) this._remove(clear.path);
    Object.assign(block, {IdUsage: 'filesystem', IdVersion: '1.0', encrypted: null, mountPoints: clear?.mountPoints ?? [], ...block.encrypted?.inner});
    this.changed(block.path);
  }

  private _open(block: Block) {
    const path = block.path;
    const encrypted = block.encrypted!;
    const clear = this._block(`dm_2d${this._mappers++}`, block.size - 16 * MiB, '/',
      {cryptoBacking: path, IdUsage: 'filesystem', ...encrypted.inner});
    clear.device = `/dev/dm-${this._mappers - 1}`;
    clear.mountPoints = [];
    encrypted.cleartext = clear.path;
    this.changed(clear.path);
    this.changed(path);
    return clear.path;
  }

  lock(path: string) {
    const block = this.block(path);
    const clear = block.encrypted && this.blocks.get(block.encrypted.cleartext);
    if (!clear) throw new Failure('NotUnlocked', `${block.device} is not unlocked`);
    if (clear.mountPoints?.length) throw new Failure('DeviceBusy', `${clear.device} is mounted`);
    this._remove(clear.path);
    block.encrypted!.cleartext = '/';
    this.changed(path);
  }

  changePassphrase(path: string, current: string, next: string) {
    const encrypted = this.block(path).encrypted;
    if (encrypted?.passphrase !== current) throw new Failure('Failed', 'Error changing passphrase: No key available with this passphrase');
    encrypted.passphrase = next;
  }

  powerOff(drivePath: string) {
    for (const block of [...this.blocks.values()].filter(candidate => candidate.drive === drivePath)) {
      if (block.mountPoints?.length) throw new Failure('DeviceBusy', `${block.device} is mounted`);
    }
    for (const block of [...this.blocks.values()].filter(candidate => candidate.drive === drivePath && !candidate.partition)) this._remove(block.path);
    this.drives.delete(drivePath);
    this.changed(drivePath, true);
  }

  selftest(drivePath: string) {
    const drive = this.drives.get(drivePath)!;
    const smart = drive.ata ?? drive.nvme!;
    smart.SmartSelftestStatus = 'inprogress';
    smart.SmartSelftestPercentRemaining = 90;
    this.changed(drivePath);
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 700, () => {
      if (!this.drives.has(drivePath) || smart.SmartSelftestStatus !== 'inprogress') return GLib.SOURCE_REMOVE;
      smart.SmartSelftestPercentRemaining! -= 30;
      if (smart.SmartSelftestPercentRemaining! <= 0) smart.SmartSelftestStatus = 'success';
      this.changed(drivePath);
      return smart.SmartSelftestStatus === 'inprogress' ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE;
    });
  }

  abortSelftest(drivePath: string) {
    const drive = this.drives.get(drivePath)!;
    (drive.ata ?? drive.nvme!).SmartSelftestStatus = 'aborted';
    this.changed(drivePath);
  }

}
