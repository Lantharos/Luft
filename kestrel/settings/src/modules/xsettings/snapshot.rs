use crate::shared::settings::Schemas;

use super::wire::{Value, Values};

pub const MOUSE: &str = "org.gnome.desktop.peripherals.mouse";
pub const BACKGROUND: &str = "org.gnome.desktop.background";
pub const INTERFACE: &str = "org.gnome.desktop.interface";
pub const SOUND: &str = "org.gnome.desktop.sound";
pub const PRIVACY: &str = "org.gnome.desktop.privacy";
pub const WM: &str = "org.gnome.desktop.wm.preferences";
pub const A11Y: &str = "org.gnome.desktop.a11y";
pub const A11Y_INTERFACE: &str = "org.gnome.desktop.a11y.interface";
pub const SCHEMAS: [&str; 8] = [
    MOUSE,
    BACKGROUND,
    INTERFACE,
    SOUND,
    PRIVACY,
    WM,
    A11Y,
    A11Y_INTERFACE,
];

const DPI: f64 = 96.0;
const COLOR_PALETTE: &str = "black:white:gray50:red:purple:blue:light blue:green:yellow:orange:lavender:brown:goldenrod4:dodger blue:pink:light green:gray10:gray30:gray75:gray90";

enum Kind {
    Int,
    Bool,
    Str,
}

const TRANSLATIONS: [(&str, &str, &str, Kind); 21] = [
    (MOUSE, "double-click", "Net/DoubleClickTime", Kind::Int),
    (MOUSE, "drag-threshold", "Net/DndDragThreshold", Kind::Int),
    (
        BACKGROUND,
        "show-desktop-icons",
        "Gtk/ShellShowsDesktop",
        Kind::Bool,
    ),
    (INTERFACE, "font-name", "Gtk/FontName", Kind::Str),
    (INTERFACE, "gtk-key-theme", "Gtk/KeyThemeName", Kind::Str),
    (INTERFACE, "cursor-blink", "Net/CursorBlink", Kind::Bool),
    (
        INTERFACE,
        "cursor-blink-time",
        "Net/CursorBlinkTime",
        Kind::Int,
    ),
    (
        INTERFACE,
        "cursor-blink-timeout",
        "Gtk/CursorBlinkTimeout",
        Kind::Int,
    ),
    (INTERFACE, "icon-theme", "Net/IconThemeName", Kind::Str),
    (
        INTERFACE,
        "gtk-enable-primary-paste",
        "Gtk/EnablePrimaryPaste",
        Kind::Bool,
    ),
    (
        INTERFACE,
        "overlay-scrolling",
        "Gtk/OverlayScrolling",
        Kind::Bool,
    ),
    (SOUND, "theme-name", "Net/SoundThemeName", Kind::Str),
    (SOUND, "event-sounds", "Net/EnableEventSounds", Kind::Bool),
    (
        SOUND,
        "input-feedback-sounds",
        "Net/EnableInputFeedbackSounds",
        Kind::Bool,
    ),
    (
        PRIVACY,
        "recent-files-max-age",
        "Gtk/RecentFilesMaxAge",
        Kind::Int,
    ),
    (
        PRIVACY,
        "remember-recent-files",
        "Gtk/RecentFilesEnabled",
        Kind::Bool,
    ),
    (
        WM,
        "action-double-click-titlebar",
        "Gtk/TitlebarDoubleClick",
        Kind::Str,
    ),
    (
        WM,
        "action-middle-click-titlebar",
        "Gtk/TitlebarMiddleClick",
        Kind::Str,
    ),
    (
        WM,
        "action-right-click-titlebar",
        "Gtk/TitlebarRightClick",
        Kind::Str,
    ),
    (
        A11Y,
        "always-show-text-caret",
        "Gtk/KeynavUseCaret",
        Kind::Bool,
    ),
    (
        A11Y_INTERFACE,
        "show-status-shapes",
        "Gtk/ShowStatusShapes",
        Kind::Bool,
    ),
];

const FIXED: [(&str, i32); 10] = [
    ("Gtk/MenuImages", 0),
    ("Gtk/ButtonImages", 0),
    ("Gtk/ShowInputMethodMenu", 0),
    ("Gtk/ShowUnicodeMenu", 0),
    ("Gtk/AutoMnemonics", 1),
    ("Gtk/DialogsUseHeader", 1),
    ("Gtk/ShellShowsAppMenu", 0),
    ("Gtk/CanChangeAccels", 0),
    ("Gtk/TimeoutInitial", 200),
    ("Gtk/TimeoutRepeat", 20),
];

const FIXED_STRINGS: [(&str, &str); 8] = [
    ("Gtk/ColorPalette", COLOR_PALETTE),
    ("Net/FallbackIconTheme", "gnome"),
    ("Gtk/ToolbarStyle", "both-horiz"),
    ("Gtk/ToolbarIconSize", "large"),
    ("Gtk/ColorScheme", ""),
    ("Gtk/IMPreeditStyle", "callback"),
    ("Gtk/IMStatusStyle", "callback"),
    ("Gtk/MenuBarAccel", "F10"),
];

pub struct Inputs<'a> {
    pub settings: &'a Schemas,
    pub bus_id: &'a str,
    pub window_scale: i32,
    pub animations: bool,
    pub modules: &'a str,
    pub fonts_changed: i64,
}

#[derive(Clone, Default, PartialEq)]
pub struct Snapshot {
    pub values: Values,
    pub resources: Vec<(&'static str, String)>,
}

pub fn build(inputs: &Inputs) -> Snapshot {
    let settings = inputs.settings;
    let mut values = Values::new();
    for (name, value) in FIXED {
        values.insert(name, Value::Int(value));
    }
    for (name, value) in FIXED_STRINGS {
        values.insert(name, Value::Str(value.to_owned()));
    }
    values.insert("Gtk/SessionBusId", Value::Str(inputs.bus_id.to_owned()));
    for (schema, key, name, kind) in &TRANSLATIONS {
        let value = match kind {
            Kind::Int => Value::Int(settings.get(schema, key)),
            Kind::Bool => Value::Int(settings.get::<bool>(schema, key).into()),
            Kind::Str => Value::Str(settings.get(schema, key)),
        };
        values.insert(name, value);
    }
    let im_module = settings.get::<String>(INTERFACE, "gtk-im-module");
    values.insert(
        "Gtk/IMModule",
        Value::Str(if im_module.is_empty() {
            "ibus".into()
        } else {
            im_module
        }),
    );
    let theme = if settings.get(A11Y_INTERFACE, "high-contrast") {
        "HighContrast".to_owned()
    } else {
        settings.get(INTERFACE, "gtk-theme")
    };
    values.insert("Net/ThemeName", Value::Str(theme));
    values.insert(
        "Gtk/DecorationLayout",
        Value::Str(button_layout(&settings.get::<String>(WM, "button-layout"))),
    );
    values.insert("Gtk/EnableAnimations", Value::Int(inputs.animations.into()));
    if !inputs.modules.is_empty() {
        values.insert("Gtk/Modules", Value::Str(inputs.modules.to_owned()));
    }
    if inputs.fonts_changed > 0 {
        values.insert(
            "Fontconfig/Timestamp",
            Value::Int((inputs.fonts_changed / 1_000_000) as i32),
        );
    }
    let resources = fonts_and_cursor(settings, inputs.window_scale, &mut values);
    Snapshot { values, resources }
}

fn fonts_and_cursor(
    settings: &Schemas,
    scale: i32,
    values: &mut Values,
) -> Vec<(&'static str, String)> {
    let antialiasing = settings.get::<String>(INTERFACE, "font-antialiasing");
    let hinting = settings.get::<String>(INTERFACE, "font-hinting");
    let antialias = antialiasing != "none";
    let hinted = hinting != "none";
    let hint_style = format!("hint{hinting}");
    let rgba = if antialiasing == "rgba" {
        settings.get::<String>(INTERFACE, "font-rgba-order")
    } else {
        "none".to_owned()
    };
    let dpi = DPI * settings.get::<f64>(INTERFACE, "text-scaling-factor");
    let scaled_dpi = (dpi * f64::from(scale) * 1024.0) as i32;
    let cursor_size = settings.get::<i32>(INTERFACE, "cursor-size") * scale;
    let cursor_theme = settings.get::<String>(INTERFACE, "cursor-theme");
    values.insert("Xft/Antialias", Value::Int(antialias.into()));
    values.insert("Xft/Hinting", Value::Int(hinted.into()));
    values.insert("Xft/HintStyle", Value::Str(hint_style.clone()));
    values.insert("Gdk/WindowScalingFactor", Value::Int(scale));
    values.insert("Gdk/UnscaledDPI", Value::Int((dpi * 1024.0) as i32));
    values.insert("Xft/DPI", Value::Int(scaled_dpi));
    values.insert("Xft/RGBA", Value::Str(rgba.clone()));
    values.insert("Gtk/CursorThemeSize", Value::Int(cursor_size));
    values.insert("Gtk/CursorThemeName", Value::Str(cursor_theme.clone()));
    vec![
        (
            "Xft.dpi",
            ((f64::from(scaled_dpi) / 1024.0) + 0.5).floor().to_string(),
        ),
        ("Xft.antialias", u8::from(antialias).to_string()),
        ("Xft.hinting", u8::from(hinted).to_string()),
        ("Xft.hintstyle", hint_style),
        ("Xft.rgba", rgba),
        ("Xcursor.size", cursor_size.to_string()),
        ("Xcursor.theme", cursor_theme),
    ]
}

fn button_layout(layout: &str) -> String {
    layout
        .split(':')
        .take(2)
        .map(|side| {
            side.split(',')
                .filter_map(|button| match button {
                    "menu" => Some("icon"),
                    "appmenu" => Some("menu"),
                    "minimize" | "maximize" | "close" => Some(button),
                    _ => None,
                })
                .collect::<Vec<_>>()
                .join(",")
        })
        .collect::<Vec<_>>()
        .join(":")
}
