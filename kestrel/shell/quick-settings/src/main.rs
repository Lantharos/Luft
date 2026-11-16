//! Quick settings as a program of its own: a surface Kestrel places above
//! the taskbar, drawn by the shell's toolkit instead of inside the
//! compositor.

mod sources;
mod view;

use std::env;
use std::path::PathBuf;

use kestrel_toolkit::app::{App, Options, Sender, Surface, run};
use kestrel_toolkit::ui::Element;

use sources::settings::Settings;
use sources::sound::Sound;
use sources::system::System;

const APP_ID: &str = "com.lantharos.kestrel.quicksettings";
const WIDTH: f32 = 420.0;
const ICON_FOLDERS: [&str; 2] = [
    "/usr/share/icons/Adwaita/symbolic",
    "/usr/share/kestrel/icons",
];

#[derive(Clone)]
pub enum Message {
    Toggle,
    Dark(bool),
    Quiet(bool),
    Profile(String),
    Network(String),
    SoundChanged,
    Volume { level: f32, channels: u8 },
    PressDark,
    PressQuiet,
    PressProfile,
    SetVolume(f32),
}

pub struct QuickSettings {
    dark: bool,
    quiet: bool,
    profile: Option<String>,
    network: String,
    volume: Option<(f32, u8)>,
    settings: Settings,
    system: System,
    sound: Option<Sound>,
}

impl App for QuickSettings {
    type Message = Message;

    fn view(&self) -> Element<Message> {
        view::surface(self)
    }

    fn update(&mut self, message: Message, surface: &mut Surface) {
        match message {
            Message::Toggle if surface.is_open() => surface.close(),
            Message::Toggle => surface.open(),
            Message::Dark(dark) => self.dark = dark,
            Message::Quiet(quiet) => self.quiet = quiet,
            Message::Profile(profile) => self.profile = Some(profile),
            Message::Network(network) => self.network = network,
            Message::SoundChanged => {
                if let Some(sound) = &mut self.sound {
                    sound.read();
                }
            }
            Message::Volume { level, channels } => self.volume = Some((level, channels)),
            Message::PressDark => self.settings.set_dark(!self.dark),
            Message::PressQuiet => self.settings.set_quiet(!self.quiet),
            Message::PressProfile => {
                if let Some(profile) = &self.profile {
                    self.system
                        .set_profile(sources::system::next_profile(profile));
                }
            }
            Message::SetVolume(level) => {
                if let (Some(sound), Some((shown, channels))) = (&mut self.sound, &mut self.volume)
                {
                    *shown = level;
                    sound.set(level, *channels);
                }
            }
        }
    }
}

fn main() {
    let mut icons: Vec<PathBuf> = ICON_FOLDERS.iter().map(PathBuf::from).collect();
    if let Some(folders) = env::var_os("KESTREL_ICON_PATH") {
        icons.extend(env::split_paths(&folders));
    }
    run(
        Options {
            app_id: APP_ID,
            width: WIDTH,
            icons,
        },
        |messages: Sender<Message>| QuickSettings {
            dark: true,
            quiet: false,
            profile: None,
            network: String::new(),
            volume: None,
            settings: Settings::watch(messages.clone()),
            system: System::watch(messages.clone()),
            sound: Sound::connect(messages),
        },
    )
}
