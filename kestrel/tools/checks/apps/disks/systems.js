import {saveBothStyles} from '../lib/palette.js';

export async function checkOtherSystems(driver, palette) {
  await driver.click('crucial');
  await saveBothStyles(driver.app, palette, 'disks-other-system');
  await driver.click('removeSystem');
  await saveBothStyles(driver.app, palette, 'disks-remove-system');
  await driver.click('confirmRemoveSystem');
  await driver.called([
    'RemoveStartups EFI/Microsoft partitions=3', 'udisks Delete /dev/nvme1n1p2', 'udisks Delete /dev/nvme1n1p4', 'udisks Delete /dev/nvme1n1p3',
  ], 'disks takes Windows out of the startup list, then deletes its partitions');
  await saveBothStyles(driver.app, palette, 'disks-system-removed');
  await driver.click('systemDone');
}
