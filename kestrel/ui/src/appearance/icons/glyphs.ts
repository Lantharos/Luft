import Gio from 'gi://Gio';

const SHIPPED: Record<string, string> = {
  '1password': '1password',
  'blender': 'blender',
  'chromium': 'chrome',
  'chromium-browser': 'chrome',
  'chromium_chromium': 'chrome',
  'claude-desktop': 'claude',
  'claude-desktop-unofficial': 'claude',
  'code': 'vscode',
  'code-oss': 'vscode',
  'code_code': 'vscode',
  'codium': 'vscode',
  'com.discordapp.Discord': 'discord',
  'com.google.Chrome': 'chrome',
  'com.mitchellh.ghostty': 'ghostty',
  'com.obsproject.Studio': 'obs',
  'com.onepassword.OnePassword': '1password',
  'com.spotify.Client': 'spotify',
  'com.valvesoftware.Steam': 'steam',
  'com.visualstudio.code': 'vscode',
  'com.vscodium.codium': 'vscode',
  'dev.vencord.Vesktop': 'discord',
  'dev.zed.Zed': 'zed',
  'discord': 'discord',
  'firefox': 'firefox',
  'firefox_firefox': 'firefox',
  'gimp': 'gimp',
  'google-chrome': 'chrome',
  'helium': 'helium',
  'io.github.Figma_Linux.figma_linux': 'figma',
  'net.imput.helium': 'helium',
  'net.thunderbird.Thunderbird': 'thunderbird',
  'obs': 'obs',
  'org.blender.Blender': 'blender',
  'org.chromium.Chromium': 'chrome',
  'org.gimp.GIMP': 'gimp',
  'org.mozilla.firefox': 'firefox',
  'org.mozilla.thunderbird': 'thunderbird',
  'org.telegram.desktop': 'telegram',
  'raffi': 'raffi',
  'spotify': 'spotify',
  'spotify_spotify': 'spotify',
  'steam': 'steam',
  'telegram-desktop': 'telegram',
  'telegramdesktop': 'telegram',
  'thunderbird': 'thunderbird',
  'vesktop': 'discord',
  'zed': 'zed',
};

const WEB_APPS: Record<string, string> = {
  mccjnooclmfoaijmijbeelljlikjmmam: 'figma',
};

const WEB_APP = /^(?:chrome|chromium|brave|msedge|helium)-([a-p]{32})-/;

function shipped(base: string): string | undefined {
  const webApp = WEB_APP.exec(base);
  return webApp ? WEB_APPS[webApp[1]] : SHIPPED[base];
}

export function glyphNames(id: string | null, source: Gio.Icon): string[] {
  const base = id?.replace(/\.desktop$/, '') ?? null;
  const themed = source instanceof Gio.ThemedIcon ? source.get_names().filter(name => !name.endsWith('-symbolic')) : [];
  const glyph = base ? shipped(base) : undefined;
  const names = [...base ? [base] : [], ...themed].map(name => `${name}-symbolic`);
  if (glyph) names.push(`kestrel-${glyph}-symbolic`);
  return [...new Set(names)];
}
