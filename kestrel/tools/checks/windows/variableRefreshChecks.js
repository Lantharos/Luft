import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

function launch(command, environment = []) {
  const launcher = new Gio.SubprocessLauncher();
  for (const variable of environment) {
    const [name, value] = variable.split('=');
    launcher.setenv(name, value, true);
  }
  return launcher.spawnv(command);
}

export async function checkVariableRefresh({pause}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel variable refresh check failed: ${label}`);
    console.log(`Kestrel variable refresh check: ${label}`);
  };
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const client = GLib.getenv('KESTREL_CONTENT_TYPE_SCRIPT');
  const apps = [
    launch(['python3', client, 'game']),
    launch(['python3', client, 'video', 'steam'], ['SteamGameId=480']),
    launch(['python3', client, 'none', 'steam'], ['SteamGameId=480']),
    launch(['python3', client, 'none']),
    launch(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT')]),
  ];
  try {
    await pause(1500);
    const windows = global.get_window_actors().map(actor => actor.meta_window);
    const named = title => windows.find(window => window.title === title);
    const game = named('Kestrel content type: game');
    const steamVideo = named('Kestrel content type: video steam');
    const steamGame = named('Kestrel content type: none steam');
    const plain = named('Kestrel content type: none');
    const app = named('Kestrel window check');

    require(game.get_content_type() === Meta.WindowContentType.GAME &&
      steamVideo.get_content_type() === Meta.WindowContentType.VIDEO &&
      plain.get_content_type() === Meta.WindowContentType.NONE, 'windows report the content type their client declares');
    require(game.variable_refresh, 'a window that declares a game gets variable refresh');
    require(steamGame.variable_refresh, 'a Steam game without a content type gets variable refresh');
    require(!steamVideo.variable_refresh, 'declared video keeps a fixed refresh rate even when launched as a game');
    require(!plain.variable_refresh && !app.variable_refresh, 'other apps keep a fixed refresh rate');

    settings.set_string('variable-refresh', 'fullscreen');
    await pause(100);
    require(plain.variable_refresh && app.variable_refresh, 'every fullscreen app gets variable refresh when chosen');
    require(!steamVideo.variable_refresh, 'declared video keeps a fixed refresh rate for every fullscreen app');
  } finally {
    settings.reset('variable-refresh');
    for (const app of apps) app.force_exit();
  }
  await pause(500);
}
