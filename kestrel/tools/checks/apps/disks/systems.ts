import type {Driver} from './driver.js';

const save = async (driver: Driver, name: string) => (await driver.app.settle(() => true)).save(`${name}-dark`);

export async function checkOtherSystems(driver: Driver) {
  await driver.click('crucial');
  await save(driver, 'disks-other-system');
  await driver.click('removeSystem');
  await save(driver, 'disks-remove-system');
  await driver.click('confirmRemoveSystem');
  await driver.called([
    'RemoveStartups EFI/Microsoft partitions=3', 'udisks Delete /dev/nvme1n1p2', 'udisks Delete /dev/nvme1n1p4', 'udisks Delete /dev/nvme1n1p3',
  ], 'disks takes Windows out of the startup list, then deletes its partitions');
  await save(driver, 'disks-system-removed');
  await driver.click('systemDone');
}
