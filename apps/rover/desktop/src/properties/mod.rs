mod measure;

use std::fs;
use std::os::unix::fs::{MetadataExt, PermissionsExt};
use std::path::Path;

use gio::prelude::*;
use serde::Serialize;

pub use measure::Measurements;

const MODE_BITS: u32 = 0o7777;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Ownership {
    owner: String,
    group: String,
    mode: u32,
    editable: bool,
}

pub fn ownership(path: &str) -> Result<Ownership, String> {
    let metadata = fs::symlink_metadata(path).map_err(|error| error.to_string())?;
    let user = metadata.uid();
    let group = metadata.gid();
    let current = uzers::get_effective_uid();
    Ok(Ownership {
        owner: uzers::get_user_by_uid(user).map_or_else(
            || user.to_string(),
            |user| user.name().to_string_lossy().into_owned(),
        ),
        group: uzers::get_group_by_gid(group).map_or_else(
            || group.to_string(),
            |group| group.name().to_string_lossy().into_owned(),
        ),
        mode: metadata.mode() & MODE_BITS,
        editable: !metadata.is_symlink() && (current == 0 || current == user),
    })
}

pub fn set_permissions(path: &str, mode: u32) -> Result<(), String> {
    fs::set_permissions(path, fs::Permissions::from_mode(mode & MODE_BITS))
        .map_err(|error| error.to_string())
}

pub fn set_default_app(path: &str, app: &str) -> Result<(), String> {
    let content_type = gio::File::for_path(Path::new(path))
        .query_info(
            gio::FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE,
            gio::FileQueryInfoFlags::NONE,
            gio::Cancellable::NONE,
        )
        .map_err(|error| error.to_string())?
        .content_type()
        .ok_or("This kind of file can't have a default app")?;
    gio_unix::DesktopAppInfo::new(app)
        .ok_or("This app is no longer installed")?
        .set_as_default_for_type(&content_type)
        .map_err(|error| error.to_string())
}
