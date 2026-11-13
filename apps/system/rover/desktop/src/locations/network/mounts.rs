use std::sync::mpsc;

use gio::prelude::*;
use serde::Serialize;
use specta::Type;

const DEVICE_SCHEMES: &[&str] = &["mtp", "gphoto2", "afc"];
const APPLE_SCHEME: &str = "afc";
const UNTRUSTED: &str = "Unlock your iPhone and tap Trust";

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct NetworkLocation {
    name: String,
    uri: String,
    path: String,
    device: bool,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PluggedDevice {
    name: String,
    uri: String,
}

fn is_device(scheme: &str) -> bool {
    DEVICE_SCHEMES.contains(&scheme)
}

fn location(mount: &gio::Mount) -> Option<NetworkLocation> {
    let root = mount.root();
    let uri = root.uri().to_string();
    let scheme = root.uri_scheme()?.to_string();
    if scheme == "file" {
        return None;
    }
    Some(NetworkLocation {
        name: mount.name().to_string(),
        path: root.path()?.to_string_lossy().into_owned(),
        device: is_device(&scheme),
        uri,
    })
}

pub fn list() -> Vec<NetworkLocation> {
    gio::VolumeMonitor::get()
        .mounts()
        .iter()
        .filter_map(location)
        .collect()
}

pub fn plugged() -> Vec<PluggedDevice> {
    gio::VolumeMonitor::get()
        .volumes()
        .iter()
        .filter(|volume| volume.get_mount().is_none())
        .filter_map(|volume| {
            let root = volume.activation_root()?;
            let scheme = root.uri_scheme()?;
            is_device(&scheme).then(|| PluggedDevice {
                name: volume.name().to_string(),
                uri: root.uri().to_string(),
            })
        })
        .collect()
}

pub fn explain_connect(uri: &str, error: &gio::glib::Error) -> String {
    let refused = error.matches(gio::IOErrorEnum::ConnectionRefused)
        || error.matches(gio::IOErrorEnum::PermissionDenied);
    if refused && gio::File::for_uri(uri).uri_scheme().as_deref() == Some(APPLE_SCHEME) {
        return UNTRUSTED.to_owned();
    }
    explain(error)
}

pub fn locate(file: &gio::File) -> Result<NetworkLocation, String> {
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
