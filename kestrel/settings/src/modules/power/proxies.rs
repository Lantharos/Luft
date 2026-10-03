use zbus::proxy;

#[proxy(
    interface = "org.gnome.Mutter.IdleMonitor",
    default_service = "org.gnome.Mutter.IdleMonitor",
    default_path = "/org/gnome/Mutter/IdleMonitor/Core"
)]
pub trait IdleMonitor {
    fn add_idle_watch(&self, interval: u64) -> zbus::Result<u32>;
    fn add_user_active_watch(&self) -> zbus::Result<u32>;
    fn remove_watch(&self, id: u32) -> zbus::Result<()>;

    #[zbus(signal)]
    fn watch_fired(&self, id: u32) -> zbus::Result<()>;
}

#[proxy(
    interface = "org.gnome.Mutter.DisplayConfig",
    default_service = "org.gnome.Mutter.DisplayConfig",
    default_path = "/org/gnome/Mutter/DisplayConfig"
)]
pub trait DisplayConfig {
    #[zbus(property)]
    fn set_power_save_mode(&self, mode: i32) -> zbus::Result<()>;
}

#[proxy(
    interface = "com.lantharos.Kestrel.Brightness",
    default_service = "com.lantharos.Kestrel.Brightness",
    default_path = "/com/lantharos/Kestrel/Brightness"
)]
pub trait ShellBrightness {
    fn set_dimming(&self, enable: bool) -> zbus::Result<()>;
    fn set_auto_brightness_target(&self, target: f64) -> zbus::Result<()>;

    #[zbus(signal)]
    fn brightness_changed(&self) -> zbus::Result<()>;
}

#[proxy(
    interface = "org.gnome.ScreenSaver",
    default_service = "org.gnome.ScreenSaver",
    default_path = "/org/gnome/ScreenSaver"
)]
pub trait ScreenSaver {
    fn lock(&self) -> zbus::Result<()>;
    fn set_active(&self, active: bool) -> zbus::Result<()>;

    #[zbus(signal)]
    fn active_changed(&self, active: bool) -> zbus::Result<()>;

    #[zbus(signal)]
    fn wake_up_screen(&self) -> zbus::Result<()>;
}

#[proxy(
    interface = "org.gnome.SessionManager",
    default_service = "org.gnome.SessionManager",
    default_path = "/org/gnome/SessionManager"
)]
pub trait SessionManager {
    fn shutdown(&self) -> zbus::Result<()>;
    fn logout(&self, mode: u32) -> zbus::Result<()>;
}

#[proxy(
    interface = "org.freedesktop.UPower.KbdBacklight",
    default_service = "org.freedesktop.UPower",
    default_path = "/org/freedesktop/UPower/KbdBacklight"
)]
pub trait KbdBacklight {
    fn get_brightness(&self) -> zbus::Result<i32>;
    fn get_max_brightness(&self) -> zbus::Result<i32>;
    fn set_brightness(&self, value: i32) -> zbus::Result<()>;

    #[zbus(signal)]
    fn brightness_changed_with_source(&self, value: i32, source: String) -> zbus::Result<()>;
}

#[proxy(
    interface = "org.freedesktop.UPower.PowerProfiles",
    default_service = "org.freedesktop.UPower.PowerProfiles",
    default_path = "/org/freedesktop/UPower/PowerProfiles"
)]
pub trait PowerProfiles {
    fn hold_profile(&self, profile: &str, reason: &str, application_id: &str) -> zbus::Result<u32>;
    fn release_profile(&self, cookie: u32) -> zbus::Result<()>;
}

#[proxy(
    interface = "net.hadess.SensorProxy",
    default_service = "net.hadess.SensorProxy",
    default_path = "/net/hadess/SensorProxy"
)]
pub trait SensorProxy {
    fn claim_light(&self) -> zbus::Result<()>;
    fn release_light(&self) -> zbus::Result<()>;
}
