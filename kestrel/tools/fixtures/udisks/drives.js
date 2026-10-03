const MiB = 1024 ** 2;
const GiB = 1024 ** 3;

export const KELVIN = 273.15;
export const PASSPHRASE = 'correct horse';
export const LINUX_DATA = '0fc63daf-8483-4772-8e79-3d69d8477de4';
export const BASIC_DATA = 'ebd0a0a2-b9e5-4433-87c0-68b6b72699c7';
const EFI = 'c12a7328-f81f-11d2-ba4b-00a0c93ec93b';

const drive = (id, props) => ({
  path: `/org/freedesktop/UDisks2/drives/${id}`,
  Vendor: '', Model: '', Revision: '1.0', Serial: `${id}-serial`, WWN: '', Id: id, Media: '', MediaCompatibility: [],
  MediaRemovable: false, MediaAvailable: true, Removable: false, Ejectable: false, CanPowerOff: false, ConnectionBus: '',
  RotationRate: 0, SortKey: `00coldplug/${id}`, Optical: false, ...props,
});

const partition = (name, number, offset, size, type, filesystem) => ({name, number, offset, size, type, ...filesystem});

export function fixtureDrives(user) {
  return [
    {
      drive: drive('Samsung_SSD_990_PRO', {Model: 'Samsung SSD 990 PRO 1TB', Size: 1000 * GiB}),
      nvme: {SmartUpdated: 1, SmartCriticalWarning: [], SmartPowerOnHours: 2140, SmartTemperature: 311, SmartSelftestStatus: 'success'},
      device: 'nvme0n1', partitionPrefix: 'p', size: 1000 * GiB, table: 'gpt',
      partitions: [
        partition('', 1, MiB, 600 * MiB, EFI, {IdUsage: 'filesystem', IdType: 'vfat', IdVersion: 'FAT32', IdUUID: '7A21-0C3E', mounts: ['/boot/efi']}),
        partition('', 2, 601 * MiB, GiB, LINUX_DATA, {IdUsage: 'filesystem', IdType: 'ext4', IdVersion: '1.0', IdUUID: 'boot-uuid', mounts: ['/boot']}),
        partition('', 3, 1625 * MiB, 990 * GiB, LINUX_DATA, {IdUsage: 'filesystem', IdType: 'btrfs', IdLabel: 'fedora', IdUUID: 'root-uuid', mounts: ['/', '/home']}),
      ],
    },
    {
      drive: drive('WDC_WD20EZRZ', {Vendor: 'Western Digital', Model: 'WDC WD20EZRZ', Size: 2000 * GiB, RotationRate: 5400, ConnectionBus: ''}),
      ata: {SmartUpdated: 1, SmartPowerOnSeconds: 3 * 365 * 24 * 3600, SmartTemperature: 32 + KELVIN, SmartNumBadSectors: 0, SmartFailing: false},
      device: 'sda', partitionPrefix: '', size: 2000 * GiB, table: 'gpt',
      partitions: [
        partition('', 1, MiB, 1500 * GiB, LINUX_DATA, {IdUsage: 'crypto', IdType: 'crypto_LUKS', IdVersion: '2', IdUUID: 'archive-luks',
          encrypted: {passphrase: PASSPHRASE, inner: {IdType: 'ext4', IdLabel: 'Archive', IdUUID: 'archive-ext4'}}}),
      ],
    },
    {
      drive: drive('SanDisk_Ultra', {Vendor: 'SanDisk', Model: 'Ultra', Size: 32 * GiB, ConnectionBus: 'usb', Media: 'thumb',
        Removable: true, MediaRemovable: true, Ejectable: true, CanPowerOff: true, SortKey: '01hotplug/SanDisk'}),
      device: 'sdb', partitionPrefix: '', size: 32 * GiB, table: 'dos',
      partitions: [
        partition('', 1, MiB, 32 * GiB - 2 * MiB, '0x07', {IdUsage: 'filesystem', IdType: 'exfat', IdVersion: '1.0', IdLabel: 'TRAVEL', IdUUID: '64A1-22F0',
          mounts: [`/run/media/${user}/TRAVEL`]}),
      ],
    },
    {
      drive: drive('Seagate_Barracuda', {Vendor: 'Seagate', Model: 'ST1000DM010', Size: 1000 * GiB, RotationRate: 7200}),
      ata: {SmartUpdated: 1, SmartPowerOnSeconds: 7 * 365 * 24 * 3600, SmartTemperature: 41 + KELVIN, SmartNumBadSectors: 24, SmartFailing: true},
      device: 'sdc', partitionPrefix: '', size: 1000 * GiB, table: 'gpt',
      partitions: [
        partition('', 1, MiB, 400 * GiB, BASIC_DATA, {IdUsage: 'filesystem', IdType: 'ntfs', IdLabel: 'Old Windows', IdUUID: '0AB2C3D4E5F60718'}),
      ],
    },
  ];
}
