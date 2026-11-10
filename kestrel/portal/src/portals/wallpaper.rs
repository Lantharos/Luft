use std::fmt::Write as _;
use std::fs::File;
use std::io::{self, Read, Seek, Write};

use gio::prelude::*;
use luft_dbus_macros::introspect;
use rustix::fs::{MemfdFlags, Mode, OFlags, memfd_create};
use sha2::{Digest, Sha256};
use zbus::message::Header;
use zbus::{Fd, ObjectPath};
use zbus::{fdo, interface};

use super::{ENDED, Options, SUCCESS, option};
use crate::context::Context;
use crate::request::while_open;

const LARGEST: u64 = 64 << 20;
const STORED_PREFIX: &str = "portal-";

pub struct Wallpaper {
    context: Context,
}

impl Wallpaper {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }

    async fn confirm(
        &self,
        handle: &ObjectPath<'_>,
        app_id: &str,
        picture: &[u8],
    ) -> io::Result<u32> {
        let mut image = File::from(memfd_create("wallpaper", MemfdFlags::CLOEXEC)?);
        image.write_all(picture)?;
        image.rewind()?;
        let asked = self.context.shell.answer(|dialogs| async move {
            dialogs
                .confirm_wallpaper(handle.as_str(), app_id, Fd::from(&image))
                .await
        });
        Ok(while_open(&self.context, handle, asked)
            .await
            .unwrap_or(ENDED))
    }

    async fn apply(&self, picture: &[u8]) -> io::Result<()> {
        let folder = glib::user_data_dir().join("backgrounds");
        std::fs::create_dir_all(&folder)?;
        let name = stored_name(picture);
        let stored = folder.join(&name);
        std::fs::write(&stored, picture)?;
        let uri = glib::filename_to_uri(&stored, None)
            .map_err(io::Error::other)?
            .to_string();
        self.context.gio.run(move || use_wallpaper(&uri)).await;
        for entry in std::fs::read_dir(&folder)?.flatten() {
            let earlier = entry.file_name();
            if earlier != *name
                && earlier
                    .as_encoded_bytes()
                    .starts_with(STORED_PREFIX.as_bytes())
                && let Err(error) = std::fs::remove_file(entry.path())
            {
                eprintln!("Couldn't remove the earlier wallpaper: {error}");
            }
        }
        Ok(())
    }
}

fn load(uri: &str) -> io::Result<Vec<u8>> {
    let unusable = |reason: &str| io::Error::new(io::ErrorKind::InvalidData, reason.to_owned());
    let (path, _) = glib::filename_from_uri(uri).map_err(io::Error::other)?;
    let flags = OFlags::RDONLY | OFlags::NONBLOCK | OFlags::CLOEXEC;
    let file = File::from(rustix::fs::open(&path, flags, Mode::empty())?);
    let metadata = file.metadata()?;
    if !metadata.is_file() {
        return Err(unusable("it isn't a file"));
    }
    if metadata.len() > LARGEST {
        return Err(unusable("it's larger than 64 MB"));
    }
    let mut bytes = Vec::new();
    file.take(LARGEST).read_to_end(&mut bytes)?;
    let (kind, _) = gio::content_type_guess(Some(&path), bytes.as_slice());
    if !kind.starts_with("image/") {
        return Err(unusable("it isn't a picture"));
    }
    Ok(bytes)
}

fn stored_name(picture: &[u8]) -> String {
    let digest = Sha256::digest(picture);
    let mut name = STORED_PREFIX.to_owned();
    for byte in &digest[..8] {
        let _ = write!(name, "{byte:02x}");
    }
    name
}

fn use_wallpaper(uri: &str) {
    let background = gio::Settings::new("org.gnome.desktop.background");
    let kestrel = gio::Settings::new("com.lantharos.kestrel");
    let set = [
        background.set_string("picture-uri", uri),
        background.set_string("picture-uri-dark", uri),
        background.set_string("picture-options", "zoom"),
        kestrel.set_value("wallpaper-focus", &(0.5, 0.5).to_variant()),
        kestrel.set_value("wallpaper-focus-dark", &(0.5, 0.5).to_variant()),
    ];
    for error in set.into_iter().filter_map(Result::err) {
        eprintln!("Couldn't change the wallpaper setting: {error}");
    }
    gio::Settings::sync();
}

#[introspect]
#[interface(name = "org.freedesktop.impl.portal.Wallpaper")]
impl Wallpaper {
    #[zbus(name = "SetWallpaperURI")]
    async fn set_wallpaper_uri(
        &self,
        handle: ObjectPath<'_>,
        app_id: &str,
        _parent_window: &str,
        uri: String,
        options: Options,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<u32> {
        self.context.allow(&header).await?;
        let loaded = tokio::task::spawn_blocking(move || load(&uri))
            .await
            .map_err(io::Error::other)
            .flatten();
        let picture = match loaded {
            Ok(picture) => picture,
            Err(error) => {
                eprintln!("Couldn't open the wallpaper for {app_id}: {error}");
                return Ok(ENDED);
            }
        };
        if option::<bool>(&options, "show-preview").unwrap_or(false) {
            let response = self
                .confirm(&handle, app_id, &picture)
                .await
                .unwrap_or_else(|error| {
                    eprintln!("Couldn't show the wallpaper preview: {error}");
                    ENDED
                });
            if response != SUCCESS {
                return Ok(response);
            }
        }
        Ok(match self.apply(&picture).await {
            Ok(()) => SUCCESS,
            Err(error) => {
                eprintln!("Couldn't keep the wallpaper for {app_id}: {error}");
                ENDED
            }
        })
    }
}
