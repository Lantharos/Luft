const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');

function status(pid) {
  const fields = Object.fromEntries(fs.readFileSync(`/proc/${pid}/status`, 'utf8').split('\n')
    .map(line => line.split(':\t')).filter(pair => pair.length === 2));
  return { seccomp: Number(fields.Seccomp), namespaces: fields.NSpid.split('\t').length };
}

app.whenReady().then(() => {
  const window = new BrowserWindow({ show: false });
  window.webContents.once('did-finish-load', () => {
    const found = {
      browser: status(process.pid),
      renderer: status(window.webContents.getOSProcessId()),
      noSandbox: app.commandLine.hasSwitch('no-sandbox'),
    };
    fs.writeSync(1, `${JSON.stringify(found)}\n`);
    app.quit();
  });
  window.loadURL('data:text/html,<p>Renderer</p>');
});
