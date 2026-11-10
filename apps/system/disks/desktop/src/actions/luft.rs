use luft_app::Events;
use luft_app::dbus::{self, failed};
use luft_disks::systems::luft::{self, Growth, Route};
use luft_trust::Outcome;
use serde::Serialize;
use specta::Type;

use super::guard::Guard;
use super::mounting;
use super::plan::moving;

#[derive(Serialize, Type)]
#[serde(
    rename = "LuftGiven",
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase"
)]
pub enum Given {
    Grown { bytes: u64 },
    AtStart,
    NeedsKey { message: String },
}

pub async fn give(events: &Events, offset: u64) -> Result<Given, String> {
    let growth = match luft::route(offset).await? {
        Route::Ready(growth) => growth,
        Route::Refused(reason) => return Err(reason),
        Route::Move {
            block, to, growth, ..
        } => {
            let guard = Guard::volume(&block).await?;
            mounting::release(&block).await?;
            moving::shift(events, &block, to, guard.label()).await?;
            growth
        }
    };
    match growth {
        Growth::Now => Ok(match luft::grow("").await? {
            Outcome::Done(bytes) => Given::Grown { bytes },
            Outcome::WrongKey(message) => Given::NeedsKey { message },
        }),
        Growth::AtStart => luft::grow_at_start().await.map(|()| Given::AtStart),
    }
}

pub async fn restart() -> Result<(), String> {
    dbus::session()
        .await?
        .call_method(
            Some("org.gnome.SessionManager"),
            "/org/gnome/SessionManager",
            Some("org.gnome.SessionManager"),
            "Reboot",
            &(),
        )
        .await
        .map(drop)
        .map_err(failed)
}
