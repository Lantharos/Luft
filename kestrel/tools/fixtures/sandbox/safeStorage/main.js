const { app, safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

function previous(file) {
  if (!fs.existsSync(file)) return 'none';
  try {
    return safeStorage.decryptString(fs.readFileSync(file));
  } catch {
    return 'unreadable';
  }
}

function report() {
  const file = path.join(app.getPath('userData'), 'secret');
  const available = safeStorage.isEncryptionAvailable();
  const found = { backend: safeStorage.getSelectedStorageBackend(), available, previous: previous(file) };
  if (available) fs.writeFileSync(file, safeStorage.encryptString('lighthouse keeper'));
  return found;
}

app.whenReady().then(() => {
  let found;
  try {
    found = report();
  } catch (error) {
    found = { error: String(error) };
  }
  process.stdout.write(`${JSON.stringify(found)}\n`);
  app.quit();
});
