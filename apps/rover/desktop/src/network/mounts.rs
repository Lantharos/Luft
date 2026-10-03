use std::sync::mpsc;

use gio::prelude::*;
use serde::Serialize;

const DEVICE_SCHEMES: &[&str] = &["mtp", "gphoto2", "afc"];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    name: String,
    uri: String,
    path: String,
    device: bool,
}

fn location(mount: &gio::Mount) -> Option<Location> {
    let root = mount.root();
    let uri = root.uri().to_string();
    let scheme = root.uri_scheme()?.to_string();
    if scheme == "file" {
        return None;
    }
    Some(Location {
        name: mount.name().to_string(),
        path: root.path()?.to_string_lossy().into_owned(),
        device: DEVICE_SCHEMES.contains(&scheme.as_str()),
        uri,
    })
}

pub fn list() -> Vec<Location> {
    gio::VolumeMonitor::get()
        .mounts()
        .iter()
        .filter_map(location)
        .collect()
}

pub fn locate(file: &gio::File) -> Result<Location, String> {
    let mount = file
        .find_enclosing_mount(gio::Cancellable::NONE)
        .map_err(|error| explain(&error))?;
    let mut place = location(&mount).ok_or("This location can't be opened as a folder")?;
    if let Some(path) = file.path() {
        place.path = path.to_string_lossy().into_owned();
    }
    Ok(place)
}

pub fn unmount(uri: &str, reply: mpsc::Sender<Result<(), String>>) {
    let mount = match gio::File::for_uri(uri).find_enclosing_mount(gio::Cancellable::NONE) {
        Ok(mount) => mount,
        Err(error) => {
            let _ = reply.send(Err(explain(&error)));
            return;
        }
    };
    mount.unmount_with_operation(
        gio::MountUnmountFlags::NONE,
        gio::MountOperation::NONE,
        gio::Cancellable::NONE,
        move |result| {
            let _ = reply.send(result.map_err(|error| explain(&error)));
        },
    );
}

pub fn explain(error: &gio::glib::Error) -> String {
    if error.matches(gio::IOErrorEnum::FailedHandled) {
        return "cancelled".to_owned();
    }
    error.message().to_owned()
}
