use std::fmt::Write as _;
use std::fs::File;
use std::io::{Seek, Write};
use std::path::{Path, PathBuf};

use gio::prelude::*;
use rustix::fs::{MemfdFlags, memfd_create};
use sha2::{Digest, Sha256};
use zbus::message::Header;
use zbus::{Fd, ObjectPath};
use zbus::{fdo, interface};

use super::{ENDED, Options, SUCCESS, option};
use crate::context::Context;
use crate::request::while_open;

struct Picture {
    bytes: Vec<u8>,
    name: String,
}

pub struct Wallpaper {
    context: Context,
}

impl Wallpaper {
    pub fn new(context: &Context) -> Self {
        Self {
            context: context.clone(),
        }
    }

    async fn load(&self, uri: String) -> Result<Picture, glib::Error> {
        self.context
            .gio
            .run_async(move || async move {
                let file = gio::File::for_uri(&uri);
                let (bytes, _) = file.load_bytes_future().await?;
                let name = file
                    .basename()
                    .map(|name| name.to_string_lossy().into_owned())
                    .unwrap_or_default();
                Ok(Picture {
                    bytes: bytes.to_vec(),
                    name,
                })
            })
            .await
    }

    async fn confirm(
        &self,
        handle: &ObjectPath<'_>,
        app_id: &str,
        picture: &Picture,
    ) -> std::io::Result<u32> {
        let mut image = File::from(memfd_create("wallpaper", MemfdFlags::CLOEXEC)?);
        image.write_all(&picture.bytes)?;
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

    async fn apply(&self, picture: &Picture) -> std::io::Result<()> {
        let folder = glib::user_data_dir().join("backgrounds");
        std::fs::create_dir_all(&folder)?;
        let stored = folder.join(stored_name(picture));
        std::fs::write(&stored, &picture.bytes)?;
        let uri = glib::filename_to_uri(&stored, None)
            .map_err(std::io::Error::other)?
            .to_string();
        self.context.gio.run(move || use_wallpaper(&uri)).await;
        Ok(())
    }
}

fn stored_name(picture: &Picture) -> PathBuf {
    let digest = Sha256::digest(&picture.bytes);
    let mut name = String::new();
    for byte in &digest[..8] {
        let _ = write!(name, "{byte:02x}");
    }
    let extension = Path::new(&picture.name)
        .extension()
        .map(|extension| extension.to_string_lossy());
    PathBuf::from(match extension {
        Some(extension) => format!("{name}.{extension}"),
        None => name,
    })
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
        let picture = match self.load(uri).await {
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
