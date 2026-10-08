import {LuftApp, sabineService} from '../../lib/luftApp.js';

const LINK_TIMEOUT = 10000;

export async function openApp(name, args = []) {
  await sabineService();
  const app = new LuftApp(name, args);
  await app.open();
  return app;
}

export async function withApp(name, args, use) {
  const app = await openApp(name, args);
  try {
    return await use(app);
  } finally {
    await app.close();
  }
}

export async function changes(app, label, act, area = null) {
  const region = () => area ? app.area(area) : undefined;
  const before = await app.frame(region());
  await act();
  return app.changes(before, label, region());
}

export async function followLink(name, link) {
  await sabineService();
  await new LuftApp(name, [link]).finished(LINK_TIMEOUT);
}
