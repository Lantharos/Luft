const { app, BrowserWindow } = require('electron');

const [title, background, frame] = process.argv.slice(-3);

app.whenReady().then(() => {
  const window = new BrowserWindow({ title, backgroundColor: background, frame: frame === 'framed', width: 400, height: 240 });
  window.loadURL(`data:text/html,<title>${title}</title><body style="margin:0;background:${background}">`);
});
