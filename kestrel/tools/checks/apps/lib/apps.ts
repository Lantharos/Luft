import {LuftApp, sabineService} from '../../lib/apps/luftApp.js';

const LINK_TIMEOUT = 10000;

export interface Region {
  x: number;
  y: number;
  width: number;
  height?: number;
}

export type Environment = Record<string, string | null>;

export async function openApp(name: string, args: string[] = [], env: Environment = {}, options: {slice?: string | null} = {}) {
  await sabineService();
  const app = new LuftApp(name, args, env, options);
  await app.open();
  return app;
}

export async function withApp<T>(name: string, args: string[], use: (app: LuftApp) => T | Promise<T>, env: Environment = {}): Promise<T> {
  const app = await openApp(name, args, env);
  try {
    return await use(app);
  } finally {
    await app.close();
  }
}

export async function changes(app: LuftApp, label: string, act: () => unknown, area: Region | null = null) {
  const region = () => area ? app.area(area) : undefined;
  const before = await app.frame(region());
  await act();
  return app.changes(before, label, region());
}

export async function followLink(name: string, link: string) {
  await sabineService();
  await new LuftApp(name, [link]).finished(LINK_TIMEOUT);
}
