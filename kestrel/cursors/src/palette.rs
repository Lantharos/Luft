pub const RED: &str = "#ef5a5f";

pub struct Palette {
    pub body: &'static str,
    pub edge: &'static str,
    pub wave: &'static str,
    pub disc: &'static str,
    pub disc_wave: &'static str,
    pub badge: &'static str,
    pub badge_glyph: &'static str,
}

pub const LIGHT: Palette = Palette {
    body: "#ffffff",
    edge: "#2b2f36",
    wave: "#a3adb8",
    disc: "#a3adb8",
    disc_wave: "#ffffff",
    badge: "#2b2f36",
    badge_glyph: "#ffffff",
};

pub const DARK: Palette = Palette {
    body: "#262a30",
    edge: "#ffffff",
    wave: "#7d8794",
    disc: "#262a30",
    disc_wave: "#a3adb8",
    badge: "#ffffff",
    badge_glyph: "#262a30",
};
