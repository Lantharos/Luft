use tokio::sync::mpsc;
use zbus::{fdo, interface};

pub const NAME: &str = "org.gnome.SettingsDaemon.Color";
pub const PATH: &str = "/org/gnome/SettingsDaemon/Color";
const LONGEST_PREVIEW: u32 = 120;

pub enum Command {
    Preview(u32),
    PauseUntilTomorrow(bool),
}

pub struct Color {
    pub active: bool,
    pub temperature: u32,
    pub paused: bool,
    pub sunrise: f64,
    pub sunset: f64,
    pub commands: mpsc::UnboundedSender<Command>,
}

#[interface(name = "org.gnome.SettingsDaemon.Color")]
impl Color {
    fn night_light_preview(&self, duration: u32) -> fdo::Result<()> {
        if duration == 0 || duration > LONGEST_PREVIEW {
            return Err(fdo::Error::InvalidArgs(format!(
                "A preview lasts between 1 and {LONGEST_PREVIEW} seconds"
            )));
        }
        let _ = self.commands.send(Command::Preview(duration));
        Ok(())
    }

    #[zbus(property)]
    fn night_light_active(&self) -> bool {
        self.active
    }

    #[zbus(property)]
    fn temperature(&self) -> u32 {
        self.temperature
    }

    #[zbus(property)]
    fn disabled_until_tomorrow(&self) -> bool {
        self.paused
    }

    #[zbus(property)]
    fn set_disabled_until_tomorrow(&mut self, paused: bool) {
        self.paused = paused;
        let _ = self.commands.send(Command::PauseUntilTomorrow(paused));
    }

    #[zbus(property)]
    fn sunrise(&self) -> f64 {
        self.sunrise
    }

    #[zbus(property)]
    fn sunset(&self) -> f64 {
        self.sunset
    }
}
