use gio::prelude::*;
use luft_app::apps::{custom_name, set_custom_name};
use luft_i18n::t;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::l10n::L10N;

#[derive(Deserialize, Type)]
pub struct Named {
    desktop: String,
}

#[derive(Deserialize, Type)]
pub struct Rename {
    desktop: String,
    name: String,
}

#[derive(Serialize, Type)]
pub struct Names {
    own: String,
    custom: Option<String>,
}

pub fn state(Named { desktop }: Named) -> Result<Names, String> {
    let info = gio_unix::DesktopAppInfo::new(&desktop)
        .ok_or_else(|| t!(L10N, "desktop-names-app-gone"))?;
    Ok(Names {
        own: info.name().to_string(),
        custom: custom_name(&desktop),
    })
}

pub fn rename(Rename { desktop, name }: Rename) -> Result<(), String> {
    set_custom_name(&desktop, &name).map_err(|error| error.to_string())
}
