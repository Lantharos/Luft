use gio::prelude::*;
use serde::{Deserialize, Serialize};
use specta::Type;

const SCHEMA: &str = "org.gnome.desktop.notifications";
const APPLICATION_SCHEMA: &str = "org.gnome.desktop.notifications.application";
const APPLICATION_PATH: &str = "/org/gnome/desktop/notifications/application";
const RULES_SCHEMA: &str = "com.lantharos.kestrel.notifications.application";
const RULES_PATH: &str = "/com/lantharos/kestrel/notifications/application";

#[derive(Deserialize, Type)]
pub struct Notifying {
    desktop: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Notifications {
    allowed: bool,
    banners: bool,
    lock_screen: bool,
    details_on_lock_screen: bool,
    shown_on_lock_screen: bool,
    sound: String,
    during_do_not_disturb: String,
    kept_in_list: bool,
}

#[derive(Deserialize, Type)]
#[serde(tag = "setting", content = "value", rename_all = "camelCase")]
pub enum Setting {
    Allowed(bool),
    Banners(bool),
    LockScreen(bool),
    DetailsOnLockScreen(bool),
    Sound(String),
    DuringDoNotDisturb(String),
    KeptInList(bool),
}

#[derive(Deserialize, Type)]
pub struct Change {
    desktop: String,
    setting: Setting,
}

struct AppSettings {
    child: String,
    id: String,
    options: gio::Settings,
    rules: gio::Settings,
}

/// The name Kestrel files an app's notification settings under.
fn child_of(id: &str) -> String {
    let mut child = String::with_capacity(id.len());
    for character in id.to_lowercase().chars() {
        let character = if character.is_ascii_alphanumeric() || character == '-' {
            character
        } else {
            '-'
        };
        if !(character == '-' && child.ends_with('-')) {
            child.push(character);
        }
    }
    child
}

fn settings_for(desktop: &str) -> AppSettings {
    let id = desktop
        .strip_suffix(".desktop")
        .unwrap_or(desktop)
        .to_owned();
    let child = child_of(&id);
    AppSettings {
        options: gio::Settings::with_path(
            APPLICATION_SCHEMA,
            &format!("{APPLICATION_PATH}/{child}/"),
        ),
        rules: gio::Settings::with_path(RULES_SCHEMA, &format!("{RULES_PATH}/{child}/")),
        child,
        id,
    }
}

pub fn state(Notifying { desktop }: Notifying) -> Result<Notifications, String> {
    let AppSettings { options, rules, .. } = settings_for(&desktop);
    Ok(Notifications {
        allowed: options.boolean("enable"),
        banners: options.boolean("show-banners"),
        lock_screen: options.boolean("show-in-lock-screen"),
        details_on_lock_screen: options.boolean("details-in-lock-screen"),
        shown_on_lock_screen: gio::Settings::new(SCHEMA).boolean("show-in-lock-screen"),
        sound: rules.string("sound").to_string(),
        during_do_not_disturb: rules.string("during-do-not-disturb").to_string(),
        kept_in_list: rules.boolean("keep-in-list"),
    })
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

/// Lists the app among those with notification settings, as Kestrel does when it first hears from it.
fn remember(settings: &AppSettings) -> Result<(), String> {
    settings
        .options
        .set_string("application-id", &format!("{}.desktop", settings.id))
        .map_err(failed)?;
    let notifications = gio::Settings::new(SCHEMA);
    let mut children: Vec<String> = notifications
        .strv("application-children")
        .iter()
        .map(ToString::to_string)
        .collect();
    if children.contains(&settings.child) {
        return Ok(());
    }
    children.push(settings.child.clone());
    notifications
        .set_strv("application-children", children)
        .map_err(failed)
}

pub fn set(Change { desktop, setting }: Change) -> Result<(), String> {
    let settings = settings_for(&desktop);
    remember(&settings)?;
    let AppSettings { options, rules, .. } = &settings;
    match setting {
        Setting::Allowed(on) => options.set_boolean("enable", on),
        Setting::Banners(on) => options.set_boolean("show-banners", on),
        Setting::LockScreen(on) => options.set_boolean("show-in-lock-screen", on),
        Setting::DetailsOnLockScreen(on) => options.set_boolean("details-in-lock-screen", on),
        Setting::Sound(sound) => rules.set_string("sound", &sound),
        Setting::DuringDoNotDisturb(choice) => rules.set_string("during-do-not-disturb", &choice),
        Setting::KeptInList(on) => rules.set_boolean("keep-in-list", on),
    }
    .map_err(failed)
}

#[cfg(test)]
mod tests {
    use super::child_of;

    #[test]
    fn files_apps_under_the_name_kestrel_gives_them() {
        assert_eq!(child_of("org.mozilla.Firefox"), "org-mozilla-firefox");
        assert_eq!(
            child_of("com.lantharos.tern__beta"),
            "com-lantharos-tern-beta"
        );
    }
}
