use crate::apps::desktop::DesktopEntry;

const MAIN_GROUP: &str = "[Desktop Entry]";
const EXEC: &str = "Exec";
const STARTUP_NOTIFY: &str = "StartupNotify";
const NO_DISPLAY: &str = "NoDisplay";
const AUTOSTART_ARGUMENTS: &str = "X-Sabine-Autostart-Arguments";
const PORTAL: &str = "X-XDP-Autostart";
const CHOICES: [&str; 3] = [
    "Hidden",
    "X-GNOME-Autostart-enabled",
    "X-GNOME-Autostart-Delay",
];

pub type Choices = Vec<(String, String)>;

/// What a newly added startup app starts with: on.
pub fn starting() -> Choices {
    vec![
        ("Hidden".into(), "false".into()),
        ("X-GNOME-Autostart-enabled".into(), "true".into()),
    ]
}

/// Whether to start the app is the person's choice, kept when its launcher changes.
pub fn choices(entry: &str) -> Choices {
    let entry = DesktopEntry::parse(entry);
    CHOICES
        .iter()
        .filter_map(|key| Some(((*key).to_owned(), entry.get(key)?.to_owned())))
        .collect()
}

/// Startup entries the app writes for itself, through the background portal or as a Sabine
/// app's login item, start it the way it asked rather than the way its launcher does.
pub fn written_by_app(entry: &str) -> bool {
    let entry = DesktopEntry::parse(entry);
    entry.get(PORTAL).is_some() || entry.get(NO_DISPLAY) == Some("true")
}

/// The launcher, started at login the way the app declares: without files to open, with its
/// autostart arguments, and without a busy cursor for a window that may never appear.
pub fn from_launcher(launcher: &str, choices: &[(String, String)]) -> String {
    let arguments = DesktopEntry::parse(launcher)
        .get(AUTOSTART_ARGUMENTS)
        .map(str::to_owned);
    let mut lines = Vec::new();
    let mut main = false;
    for line in launcher.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') {
            main = trimmed == MAIN_GROUP;
            lines.push(line.to_owned());
            if main {
                lines.extend(choices.iter().map(|(key, value)| format!("{key}={value}")));
                if arguments.is_some() {
                    lines.push(format!("{STARTUP_NOTIFY}=false"));
                }
            }
            continue;
        }
        let Some((key, value)) = trimmed.split_once('=').filter(|_| main) else {
            lines.push(line.to_owned());
            continue;
        };
        match (key.trim(), &arguments) {
            (key, _) if CHOICES.contains(&key) => {}
            (STARTUP_NOTIFY, Some(_)) => {}
            (EXEC, Some(arguments)) => lines.push(format!("{EXEC}={}", declared(value, arguments))),
            _ => lines.push(line.to_owned()),
        }
    }
    lines.join("\n") + "\n"
}

fn declared(exec: &str, arguments: &str) -> String {
    let command: Vec<&str> = exec
        .split(' ')
        .filter(|word| !word.starts_with('%'))
        .collect();
    format!("{} {arguments}", command.join(" ").trim_end())
}

#[cfg(test)]
mod tests {
    use super::*;

    const SANDBOXED: &str = "[Desktop Entry]\nName=Helium\nTryExec=/home/me/Applications/helium.AppImage\nExec=\"/usr/lib/sabine/com.lantharos.schelf/schelf\" --sandbox net.imput.helium --load-extension=/usr/share/luft/chromium/autoscroll @@u %U @@\nStartupNotify=true\nX-Sabine-Autostart-Arguments=--no-startup-window\n\n[Desktop Action new-window]\nName=New Window\nExec=\"/usr/lib/sabine/com.lantharos.schelf/schelf\" --sandbox net.imput.helium --new-window\n";

    const STALE: &str = "[Desktop Entry]\nName=Helium\nExec=env DESKTOPINTEGRATION=1 \"/home/me/Applications/helium.AppImage\" --no-startup-window\nStartupNotify=false\nHidden=true\nX-GNOME-Autostart-enabled=false\nX-GNOME-Autostart-Delay=5\n";

    #[test]
    fn a_refreshed_entry_starts_the_current_launcher_with_its_autostart_arguments() {
        assert_eq!(
            from_launcher(SANDBOXED, &choices(STALE)),
            "[Desktop Entry]\nHidden=true\nX-GNOME-Autostart-enabled=false\nX-GNOME-Autostart-Delay=5\nStartupNotify=false\nName=Helium\nTryExec=/home/me/Applications/helium.AppImage\nExec=\"/usr/lib/sabine/com.lantharos.schelf/schelf\" --sandbox net.imput.helium --load-extension=/usr/share/luft/chromium/autoscroll @@u @@ --no-startup-window\nX-Sabine-Autostart-Arguments=--no-startup-window\n\n[Desktop Action new-window]\nName=New Window\nExec=\"/usr/lib/sabine/com.lantharos.schelf/schelf\" --sandbox net.imput.helium --new-window\n"
        );
    }

    #[test]
    fn an_added_app_starts_on() {
        let added = from_launcher(SANDBOXED, &starting());
        assert_eq!(choices(&added), starting());
    }

    #[test]
    fn a_launcher_without_autostart_arguments_starts_as_it_is() {
        let launcher = "[Desktop Entry]\nName=Vesktop\nExec=/usr/bin/flatpak run --command=startvesktop --file-forwarding dev.vencord.Vesktop @@u %U @@\nStartupNotify=true\nX-Flatpak=dev.vencord.Vesktop\n";
        assert_eq!(
            from_launcher(launcher, &starting()),
            "[Desktop Entry]\nHidden=false\nX-GNOME-Autostart-enabled=true\nName=Vesktop\nExec=/usr/bin/flatpak run --command=startvesktop --file-forwarding dev.vencord.Vesktop @@u %U @@\nStartupNotify=true\nX-Flatpak=dev.vencord.Vesktop\n"
        );
    }

    #[test]
    fn the_launchers_own_start_choices_give_way_to_the_persons() {
        let launcher =
            "[Desktop Entry]\nName=Tool\nExec=tool\nHidden=true\nX-GNOME-Autostart-enabled=false\n";
        assert_eq!(
            from_launcher(launcher, &starting()),
            "[Desktop Entry]\nHidden=false\nX-GNOME-Autostart-enabled=true\nName=Tool\nExec=tool\n"
        );
    }

    #[test]
    fn entries_apps_write_for_themselves_stay_theirs() {
        assert!(written_by_app(
            "[Desktop Entry]\nExec=flatpak run org.app --minimized\nX-XDP-Autostart=org.app\n"
        ));
        assert!(written_by_app(
            "[Desktop Entry]\nExec=/home/me/.local/share/sabine/apps/com.x/install/x --background\nNoDisplay=true\n"
        ));
        assert!(!written_by_app(STALE));
    }
}
