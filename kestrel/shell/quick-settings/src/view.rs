use kestrel_toolkit::color::Color;
use kestrel_toolkit::text::TextStyle;
use kestrel_toolkit::ui::{Element, column, icon, row, slider, text};

use crate::{Message, QuickSettings};

const TILE_ICON: f32 = 22.0;
const SLIDER_ICON: f32 = 16.0;

#[derive(Clone, Copy)]
enum Key {
    Network,
    Profile,
    Dark,
    Quiet,
    Volume,
}

struct Palette {
    ink: Color,
    density: f32,
}

impl Palette {
    fn new(dark: bool) -> Self {
        if dark {
            Self {
                ink: Color::rgba(255, 255, 255, 1.0),
                density: 1.0,
            }
        } else {
            Self {
                ink: Color::rgba(27, 27, 31, 1.0),
                density: 0.7,
            }
        }
    }

    fn fill(&self, alpha: f32) -> Color {
        self.ink.alpha(alpha * self.density)
    }
}

struct Tile<'a> {
    key: Key,
    icon: &'static str,
    title: &'a str,
    subtitle: &'a str,
    checked: bool,
    press: Option<Message>,
}

fn tile(palette: &Palette, tile: Tile) -> Element<Message> {
    let levels = if tile.checked {
        [0.26, 0.32, 0.38]
    } else {
        [0.07, 0.13, 0.19]
    };
    let subtitle = palette.ink.alpha(if tile.checked { 0.85 } else { 0.65 });
    let body = column(vec![
        row(vec![icon(tile.icon, TILE_ICON, palette.ink)]).height(32.0),
        text(
            tile.title,
            TextStyle {
                size: 13.0,
                weight: 600.0,
                color: palette.ink,
            },
        ),
        text(
            tile.subtitle,
            TextStyle {
                size: 11.0,
                weight: 400.0,
                color: subtitle,
            },
        ),
    ])
    .gap(3.0)
    .padding(14.0, 14.0)
    .radius(12.0)
    .grow()
    .key(tile.key as u64)
    .states(
        palette.fill(levels[0]),
        palette.fill(levels[1]),
        palette.fill(levels[2]),
    );
    match tile.press {
        Some(message) => body.on_press(message),
        None => body,
    }
}

fn on_off(on: bool) -> &'static str {
    if on { "On" } else { "Off" }
}

pub fn surface(state: &QuickSettings) -> Element<Message> {
    let palette = Palette::new(state.dark);
    let (network_icon, network) = match state.network.as_str() {
        "802-3-ethernet" => ("network-wired-symbolic", "Wired"),
        "802-11-wireless" => ("network-wireless-signal-excellent-symbolic", "Wi-Fi"),
        _ => ("network-offline-symbolic", "Network"),
    };
    let (profile_icon, profile) = match state.profile.as_deref() {
        Some("performance") => ("power-profile-performance-symbolic", "Performance"),
        Some("power-saver") => ("power-profile-power-saver-symbolic", "Power Saver"),
        _ => ("power-profile-balanced-symbolic", "Balanced"),
    };
    let tiles = column(vec![
        row(vec![
            tile(
                &palette,
                Tile {
                    key: Key::Network,
                    icon: network_icon,
                    title: network,
                    subtitle: on_off(!state.network.is_empty()),
                    checked: !state.network.is_empty(),
                    press: None,
                },
            ),
            tile(
                &palette,
                Tile {
                    key: Key::Profile,
                    icon: profile_icon,
                    title: "Power Mode",
                    subtitle: profile,
                    checked: false,
                    press: state.profile.is_some().then_some(Message::PressProfile),
                },
            ),
        ])
        .gap(8.0),
        row(vec![
            tile(
                &palette,
                Tile {
                    key: Key::Dark,
                    icon: "dark-mode-symbolic",
                    title: "Dark Style",
                    subtitle: on_off(state.dark),
                    checked: state.dark,
                    press: Some(Message::PressDark),
                },
            ),
            tile(
                &palette,
                Tile {
                    key: Key::Quiet,
                    icon: "notifications-disabled-symbolic",
                    title: "Do Not Disturb",
                    subtitle: on_off(state.quiet),
                    checked: state.quiet,
                    press: Some(Message::PressQuiet),
                },
            ),
        ])
        .gap(8.0),
    ])
    .gap(8.0);
    let mut content = vec![tiles];
    if let Some((level, _)) = state.volume {
        let glyph = match level {
            level if level <= 0.0 => "audio-volume-muted-symbolic",
            level if level < 0.34 => "audio-volume-low-symbolic",
            level if level < 0.67 => "audio-volume-medium-symbolic",
            _ => "audio-volume-high-symbolic",
        };
        content.push(
            row(vec![
                row(vec![icon(glyph, SLIDER_ICON, palette.ink)])
                    .width(36.0)
                    .height(36.0)
                    .center()
                    .padding(10.0, 0.0),
                slider(Key::Volume as u64, level, palette.ink, Message::SetVolume),
            ])
            .center()
            .gap(8.0)
            .padding(0.0, 0.0),
        );
    }
    let tint = if state.dark {
        Color::TRANSPARENT
    } else {
        Color::rgba(250, 250, 252, 0.34)
    };
    column(content).gap(14.0).padding(14.0, 14.0).fill(tint)
}
