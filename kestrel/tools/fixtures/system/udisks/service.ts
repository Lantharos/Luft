import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

import {failureOf} from '../../../checks/lib/errors.js';
import {type Block, type Configuration, type Drive, Failure, type FormatOptions, Model, type PartitionEntry} from './model.js';

const ROOT = '/org/freedesktop/UDisks2';
type Options = Record<string, GLib.Variant>;

const IFACE = (name: string) => `org.freedesktop.UDisks2.${name}`;
const RESIZE: Record<string, number> = {ext4: 2 | 4 | 16, btrfs: 2 | 4 | 8 | 16, ntfs: 2 | 4, vfat: 2 | 4};
const IMAGE_BYTES = 8 * 1024 * 1024;

const nodeInfo = Gio.DBusNodeInfo.new_for_xml(new TextDecoder().decode(GLib.file_get_contents(
  GLib.build_filenamev([KESTREL_TOOLS.root, 'kestrel/tools/fixtures/system/udisks/interfaces.xml']))[1]));
const bytes = (text: string) => [...new TextEncoder().encode(text), 0];
const unpack = (options: Options): FormatOptions => Object.fromEntries(Object.entries(options).map(([key, value]) => [key, value.deepUnpack<FormatOptions[keyof FormatOptions]>()]));

function answer(invocation: Gio.DBusMethodInvocation, work: () => GLib.Variant | void) {
  try {
    const result = work();
    invocation.return_value(result === undefined ? null : result);
  } catch (error) {
    const failure = failureOf(error);
    invocation.return_dbus_error(failure instanceof Failure ? failure.dbusName : 'org.freedesktop.UDisks2.Error.Failed', failure.message);
  }
}

function imageFile(device: string) {
  const folder = GLib.build_filenamev([GLib.get_user_cache_dir(), 'udisks-fixture']);
  GLib.mkdir_with_parents(folder, 0o700);
  return GLib.build_filenamev([folder, `${GLib.path_get_basename(device)}.img`]);
}

function openImage(device: string, restoring: boolean) {
  const path = imageFile(device);
  const file = Gio.File.new_for_path(path);
  if (restoring) return file.replace(null, false, Gio.FileCreateFlags.NONE, null);
  if (!file.query_exists(null)) {
    const pattern = new Uint8Array(IMAGE_BYTES);
    pattern.forEach((_, index) => (pattern[index] = index % 251));
    GLib.file_set_contents(path, pattern);
  }
  return file.read(null);
}

function openDevice(block: Block) {
  const file = Gio.File.new_for_path(imageFile(`${block.device}-device`));
  if (!file.query_exists(null)) file.create(Gio.FileCreateFlags.NONE, null).close(null);
  const stream = file.open_readwrite(null);
  if (file.query_info('standard::size', Gio.FileQueryInfoFlags.NONE, null).get_size() < block.size) stream.truncate(block.size, null);
  return stream.get_output_stream();
}

export function publishUdisks(calls: string[]) {
  const server = Gio.DBusObjectManagerServer.new(ROOT);
  const user = GLib.get_user_name();
  const exported = new Map<string, Gio.DBusObjectSkeleton>();
  let model: Model;

  function returnFd(invocation: Gio.DBusMethodInvocation, stream: Gio.InputStream | Gio.OutputStream) {
    if (!(stream instanceof GioUnix.FileDescriptorBased)) throw new Error('Fixture images are local files');
    const descriptors = new Gio.UnixFDList();
    invocation.return_value_with_unix_fd_list(new GLib.Variant('(h)', [descriptors.append(stream.get_fd())]), descriptors);
  }

  const skeleton = (name: string, implementation: object) => Gio.DBusExportedObject.wrapJSObject(nodeInfo.lookup_interface(IFACE(name))!, implementation);

  function blockInterfaces(block: Block) {
    const record = (method: string, detail = '') => calls.push(`udisks ${method} ${block.device}${detail}`);
    const interfaces = [skeleton('Block', {
      Device: bytes(block.device), PreferredDevice: bytes(block.device), Symlinks: [], DeviceNumber: 0, Id: '', Size: block.size,
      ReadOnly: false, Drive: block.drive, MDRaid: '/', MDRaidMember: '/', IdUsage: block.IdUsage, IdType: block.IdType,
      IdVersion: block.IdVersion, IdLabel: block.IdLabel, IdUUID: block.IdUUID, Configuration: block.configuration,
      CryptoBackingDevice: block.cryptoBacking, HintPartitionable: true, HintSystem: !model.drives.get(block.drive)?.Removable,
      HintIgnore: false, HintAuto: false, HintName: '', HintIconName: '', HintSymbolicIconName: '', UserspaceMountOptions: [],
      FormatAsync: ([type, options]: [string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        const values = unpack(options);
        record('Format', ` ${type}${values['encrypt.passphrase'] ? ' encrypted' : ''}${values.erase ? ' erase' : ''} label=${values.label ?? ''}`);
        model.format(block.path, type, values);
      }),
      AddConfigurationItemAsync: ([item]: [Configuration, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record('AddConfigurationItem', ` ${item[0]}`);
        block.configuration = [...block.configuration, item];
        model.changed(block.path);
      }),
      RemoveConfigurationItemAsync: ([item]: [Configuration, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record('RemoveConfigurationItem', ` ${item[0]}`);
        block.configuration = block.configuration.filter(entry => entry[0] !== item[0]);
        model.changed(block.path);
      }),
      OpenForBackupAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => {
        record('OpenForBackup');
        returnFd(invocation, openImage(block.device, false));
      },
      OpenForRestoreAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => {
        record('OpenForRestore');
        returnFd(invocation, openImage(block.device, true));
      },
      OpenDeviceAsync: ([mode]: [string, Options], invocation: Gio.DBusMethodInvocation) => {
        record('OpenDevice', ` ${mode}`);
        returnFd(invocation, openDevice(block));
      },
      RescanAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record('Rescan');
      }),
    })];
    if (block.table) {
      interfaces.push(skeleton('PartitionTable', {
        Partitions: block.table.partitions, Type: block.table.type,
        CreatePartitionAndFormatAsync: ([offset, size, type, name, , format, options]: [number, number, string, string, Options, string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('CreatePartitionAndFormat', ` ${format} size=${size}${type ? ` type=${type}` : ''}${name ? ` name=${name}` : ''}`);
          return new GLib.Variant('(o)', [model.createPartition(block.path, offset, size, format, unpack(options), {type, name})]);
        }),
        CreatePartitionAsync: ([offset, size, type, name, options]: [number, number, string, string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          const values = unpack(options);
          record('CreatePartition', ` offset=${offset} size=${size} type=${type}${name ? ` name=${name}` : ''}${values['partition-uuid'] ? ` uuid=${values['partition-uuid']}` : ''}`);
          return new GLib.Variant('(o)', [model.createPartition(block.path, offset, size, '', {}, {type, name, uuid: values['partition-uuid']})]);
        }),
      }));
    }
    if (block.partition) {
      const {number, type, offset, name, flags, uuid: partitionUuid, table} = block.partition;
      const set = <Field extends keyof PartitionEntry>(method: string, field: Field,
        describe: (value: PartitionEntry[Field]) => string | number = value => value) => ([value]: [PartitionEntry[Field], Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record(method, ` ${describe(value)}`);
        model.setPartition(block.path, field, value);
      });
      interfaces.push(skeleton('Partition', {
        Number: number, Type: type, Flags: flags, Offset: offset, Size: block.size, Name: name, UUID: partitionUuid, Table: table,
        IsContainer: false, IsContained: false,
        SetTypeAsync: set('SetType', 'type'),
        SetNameAsync: set('SetName', 'name'),
        SetFlagsAsync: set('SetFlags', 'flags', value => `0x${BigInt(value).toString(16)}`),
        DeleteAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('Delete');
          model.deletePartition(block.path);
        }),
        ResizeAsync: ([size]: [number, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('Resize', ` ${size}`);
          model.resizePartition(block.path, size);
        }),
      }));
    }
    if (block.mountPoints !== null) {
      interfaces.push(skeleton('Filesystem', {
        MountPoints: block.mountPoints.map(bytes), Size: block.size,
        MountAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('Mount');
          return new GLib.Variant('(s)', [model.mount(block.path)]);
        }),
        UnmountAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('Unmount');
          model.unmount(block.path);
        }),
        SetLabelAsync: ([label]: [string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('SetLabel', ` ${label}`);
          model.setLabel(block.path, label);
        }),
        ResizeAsync: ([size]: [number, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('FilesystemResize', ` ${size}`);
        }),
      }));
    }
    if (block.encrypted) {
      interfaces.push(skeleton('Encrypted', {
        ChildConfiguration: [], HintEncryptionType: 'luks2', MetadataSize: 16 * 1024 * 1024, CleartextDevice: block.encrypted.cleartext,
        UnlockAsync: ([passphrase]: [string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('Unlock');
          return new GLib.Variant('(o)', [model.unlock(block.path, passphrase)]);
        }),
        LockAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('Lock');
          model.lock(block.path);
        }),
        ChangePassphraseAsync: ([current, next]: [string, string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
          record('ChangePassphrase');
          model.changePassphrase(block.path, current, next);
        }),
      }));
    }
    return interfaces;
  }

  function driveInterfaces(drive: Drive) {
    const {path, ata, nvme, device, partitionPrefix, ...properties} = drive;
    const record = (method: string) => calls.push(`udisks ${method} ${drive.Id}`);
    const selftest = {
      SmartSelftestStartAsync: ([type]: [string, Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record(`SelftestStart ${type}`);
        model.selftest(path);
      }),
      SmartSelftestAbortAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record('SelftestAbort');
        model.abortSelftest(path);
      }),
    };
    const interfaces = [skeleton('Drive', {
      ...properties, Configuration: {}, MediaChangeDetected: true, TimeDetected: 0, TimeMediaDetected: 0, OpticalBlank: false,
      OpticalNumTracks: 0, OpticalNumAudioTracks: 0, OpticalNumDataTracks: 0, OpticalNumSessions: 0, Seat: 'seat0', SiblingId: '',
      PowerOffAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record('PowerOff');
        model.powerOff(path);
      }),
      EjectAsync: (_args: [Options], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
        record('Eject');
        model.powerOff(path);
      }),
    })];
    if (ata) {
      interfaces.push(skeleton('Drive.Ata', {
        SmartSupported: true, SmartEnabled: true, SmartNumAttributesFailing: 0, SmartNumAttributesFailedInThePast: 0,
        SmartSelftestStatus: 'success', SmartSelftestPercentRemaining: -1, ...ata, ...selftest,
      }));
    }
    if (nvme) {
      interfaces.push(skeleton('NVMe.Controller', {
        State: 'live', ControllerID: 1, SubsystemNQN: [], FGUID: '', NVMeRevision: '2.0', UnallocatedCapacity: 0,
        SmartSelftestPercentRemaining: -1, SanitizeStatus: '', SanitizePercentRemaining: -1, ...nvme, ...selftest,
      }));
    }
    return interfaces;
  }

  function publishObject(path: string, interfaces: Gio.DBusExportedObject[]) {
    const object = Gio.DBusObjectSkeleton.new(path);
    for (const iface of interfaces) object.add_interface(iface);
    server.export(object);
    exported.set(path, object);
  }

  function changed(path: string, removed = false) {
    if (exported.has(path)) {
      server.unexport(path);
      exported.delete(path);
    }
    if (removed) return;
    const block = model.blocks.get(path);
    const drive = model.drives.get(path);
    if (block) publishObject(path, blockInterfaces(block));
    else if (drive) publishObject(path, driveInterfaces(drive));
  }

  model = new Model(user, (path, removed) => changed(path, removed));
  publishObject(`${ROOT}/Manager`, [skeleton('Manager', {
    Version: '2.11.2', SupportedFilesystems: ['ext4', 'btrfs', 'exfat', 'ntfs', 'vfat'], SupportedEncryptionTypes: ['luks1', 'luks2'],
    DefaultEncryptionType: 'luks2',
    CanFormat: () => [true, ''],
    CanResize: (type: string) => [type in RESIZE, RESIZE[type] ?? 0, ''],
    GetBlockDevices: () => [...model.blocks.keys()],
  })]);
  for (const path of [...model.drives.keys(), ...model.blocks.keys()]) changed(path);
  server.set_connection(Gio.DBus.system);
  return model;
}
