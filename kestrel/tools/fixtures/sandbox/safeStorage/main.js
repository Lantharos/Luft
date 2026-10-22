const { app, safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

async function previous(file) {
  if (!fs.existsSync(file)) return 'none';
  try {
    return (await safeStorage.decryptStringAsync(fs.readFileSync(file))).result;
  } catch {
    return 'unreadable';
  }
}

async function report() {
  const file = path.join(app.getPath('userData'), 'secret');
  const available = await safeStorage.isAsyncEncryptionAvailable();
  const found = { available, previous: await previous(file) };
  if (available) fs.writeFileSync(file, await safeStorage.encryptStringAsync('lighthouse keeper'));
  return found;
}

app.whenReady().then(async () => {
  let found;
  try {
    found = await report();
  } catch (error) {
    found = { error: String(error) };
  }
  process.stdout.write(`${JSON.stringify(found)}\n`);
  app.quit();
});
