use std::path::{Path, PathBuf};

use gio::prelude::*;

use luft_app::apps::{
    custom_icon, has_custom_symbolic, reset_custom_icons, set_custom_icon, set_custom_symbolic,
};
use luft_app::portal::{self, Filter};
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Deserialize, Type)]
pub struct Icon {
    desktop: String,
}

#[derive(Serialize, Type)]
pub struct CustomIcons {
    icon: bool,
    symbolic: bool,
}

pub fn state(Icon { desktop }: Icon) -> Result<CustomIcons, String> {
    Ok(CustomIcons {
        icon: custom_icon(&desktop).is_some(),
        symbolic: has_custom_symbolic(&desktop),
    })
}

async fn choose_image(
    title: &str,
    kind: &str,
    extensions: &[&str],
) -> Result<Option<PathBuf>, String> {
    let patterns = extensions
        .iter()
        .map(|extension| format!("*.{extension}"))
        .collect();
    let chosen = portal::open_files(
        title,
        Filter {
            name: kind,
            patterns,
        },
    )
    .await?;
    Ok(chosen
        .first()
        .and_then(|uri| gio::File::for_uri(uri).path()))
}

async fn replace(
    title: &str,
    kind: &str,
    extensions: &[&str],
    apply: impl FnOnce(&Path) -> std::io::Result<()>,
) -> Result<bool, String> {
    let Some(path) = choose_image(title, kind, extensions).await? else {
        return Ok(false);
    };
    apply(&path).map_err(|error| error.to_string())?;
    Ok(true)
}

pub async fn choose(Icon { desktop }: Icon) -> Result<bool, String> {
    replace("Choose an icon", "Images", &["png", "svg"], |path| {
        set_custom_icon(&desktop, path)
    })
    .await
}

pub async fn choose_symbolic(Icon { desktop }: Icon) -> Result<bool, String> {
    replace("Choose a symbolic icon", "SVG images", &["svg"], |path| {
        set_custom_symbolic(&desktop, path)
    })
    .await
}

pub fn reset(Icon { desktop }: Icon) -> Result<(), String> {
    reset_custom_icons(&desktop).map_err(|error| error.to_string())
}
