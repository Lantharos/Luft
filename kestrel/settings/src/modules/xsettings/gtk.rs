use zbus::interface;

pub const NAME: &str = "org.gtk.Settings";
pub const PATH: &str = "/org/gtk/Settings";

#[derive(Default)]
pub struct GtkSettings {
    pub fontconfig_timestamp: i64,
    pub modules: String,
    pub enable_animations: bool,
}

#[interface(name = "org.gtk.Settings")]
impl GtkSettings {
    #[zbus(property)]
    fn fontconfig_timestamp(&self) -> i64 {
        self.fontconfig_timestamp
    }

    #[zbus(property)]
    fn modules(&self) -> &str {
        &self.modules
    }

    #[zbus(property)]
    fn enable_animations(&self) -> bool {
        self.enable_animations
    }
}
