use std::fs;
use std::path::PathBuf;

use super::Folders;

const NAME: &str = "net.imput.helium.desktop";
const LAUNCHER: &str = "[Desktop Entry]\nName=Helium\nExec=schelf --sandbox net.imput.helium @@u %U @@\nX-Sabine-Autostart-Arguments=--no-startup-window\n";

struct Scratch {
    root: PathBuf,
    folders: Folders,
}

impl Scratch {
    fn new(name: &str) -> Self {
        let root = std::env::temp_dir().join(format!("luft-startup-{}-{name}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        let folders = Folders {
            autostart: root.join("config/autostart"),
            applications: vec![
                root.join("home/applications"),
                root.join("system/applications"),
            ],
        };
        for folder in [
            &folders.autostart,
            &folders.applications[0],
            &folders.applications[1],
        ] {
            fs::create_dir_all(folder).unwrap();
        }
        Self { root, folders }
    }

    fn launcher(&self, text: &str) {
        fs::write(self.folders.applications[0].join(NAME), text).unwrap();
    }

    fn startup(&self) -> Option<String> {
        fs::read_to_string(self.folders.autostart.join(NAME)).ok()
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.root);
    }
}

#[test]
fn a_stale_copy_follows_the_launcher_and_keeps_the_persons_choice() {
    let scratch = Scratch::new("stale");
    scratch.launcher(LAUNCHER);
    fs::write(
        scratch.folders.autostart.join(NAME),
        "[Desktop Entry]\nName=Helium\nExec=env DESKTOPINTEGRATION=1 \"/home/me/Applications/helium.AppImage\"\nHidden=true\n",
    )
    .unwrap();
    scratch.folders.refresh_all().unwrap();
    assert_eq!(
        scratch.startup().unwrap(),
        "[Desktop Entry]\nHidden=true\nStartupNotify=false\nName=Helium\nExec=schelf --sandbox net.imput.helium @@u @@ --no-startup-window\nX-Sabine-Autostart-Arguments=--no-startup-window\n"
    );
}

#[test]
fn only_apps_already_starting_are_refreshed() {
    let scratch = Scratch::new("absent");
    scratch.launcher(LAUNCHER);
    scratch.folders.refresh(NAME).unwrap();
    assert_eq!(scratch.startup(), None);
}

#[test]
fn the_persons_launcher_wins_over_the_systems() {
    let scratch = Scratch::new("order");
    fs::write(
        scratch.folders.applications[1].join(NAME),
        "[Desktop Entry]\nExec=system\n",
    )
    .unwrap();
    scratch.launcher("[Desktop Entry]\nExec=own\n");
    let launcher = scratch.folders.launcher(NAME).unwrap();
    scratch.folders.add(NAME, &launcher).unwrap();
    assert_eq!(
        scratch.startup().unwrap(),
        "[Desktop Entry]\nHidden=false\nX-GNOME-Autostart-enabled=true\nExec=own\n"
    );
}

#[test]
fn an_entry_the_app_wrote_stays_as_it_is() {
    let scratch = Scratch::new("portal");
    scratch.launcher(LAUNCHER);
    let written = "[Desktop Entry]\nExec=schelf --sandbox net.imput.helium --minimized\nX-XDP-Autostart=net.imput.helium\n";
    fs::write(scratch.folders.autostart.join(NAME), written).unwrap();
    scratch.folders.refresh(NAME).unwrap();
    assert_eq!(scratch.startup().unwrap(), written);
}

#[test]
fn a_removed_app_stops_starting() {
    let scratch = Scratch::new("removed");
    scratch.launcher(LAUNCHER);
    let launcher = scratch.folders.launcher(NAME).unwrap();
    scratch.folders.add(NAME, &launcher).unwrap();
    scratch.folders.forget(NAME).unwrap();
    assert_eq!(scratch.startup(), None);
    scratch.folders.forget(NAME).unwrap();
}
