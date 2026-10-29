use luft_dbus_macros::introspect;
use tokio::sync::mpsc;
use zbus::interface;

pub const NAME: &str = "com.lantharos.Settings.NightLight";
pub const PATH: &str = "/com/lantharos/Settings/NightLight";

pub enum Command {
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

#[introspect]
#[interface(name = "com.lantharos.Settings.NightLight")]
impl Color {
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
