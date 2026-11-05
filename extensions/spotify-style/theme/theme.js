(() => {
  const STREAM = 'http://127.0.0.1:47291/';
  const REMEMBERED = 'luft:look';
  const SPICE_ROLES = {
    text: 'onSurface',
    subtext: 'onSurfaceVariant',
    main: 'surface',
    'main-elevated': 'surfaceContainerLow',
    highlight: 'surfaceContainerHigh',
    'highlight-elevated': 'surfaceContainerHighest',
    sidebar: 'surfaceContainerLow',
    player: 'surfaceContainerLow',
    card: 'surfaceContainerLow',
    'selected-row': 'onSurface',
    button: 'primary',
    'button-active': 'primary',
    'button-disabled': 'outline',
    'tab-active': 'surfaceContainerHigh',
    notification: 'surfaceContainerHigh',
    'notification-error': 'error',
    misc: 'outline',
  };
  const root = document.documentElement;

  const kebab = name => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  const channels = hex => [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)).join(',');

  const paint = ({ dark, colors, font, textScale, squareCorners, reducedMotion }) => {
    for (const [role, color] of Object.entries(colors)) root.style.setProperty(`--kestrel-${kebab(role)}`, color);
    for (const [name, role] of Object.entries(SPICE_ROLES)) {
      root.style.setProperty(`--spice-${name}`, colors[role]);
      root.style.setProperty(`--spice-rgb-${name}`, channels(colors[role]));
    }
    root.style.setProperty('--luft-font', `"${font}"`);
    root.style.setProperty('--luft-text-scale', textScale);
    root.dataset.scheme = dark ? 'dark' : 'light';
    root.dataset.corners = squareCorners ? 'square' : 'rounded';
    root.dataset.motion = reducedMotion ? 'off' : 'on';
  };

  const remembered = localStorage.getItem(REMEMBERED);
  if (remembered) paint(JSON.parse(remembered));

  new EventSource(STREAM).onmessage = ({ data }) => {
    paint(JSON.parse(data));
    localStorage.setItem(REMEMBERED, data);
  };
})();
