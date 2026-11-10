use futures_util::{Stream, StreamExt, stream};
use luft_app::dbus::{self, failed, objects};
use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use serde::Serialize;
use specta::Type;
use zbus::{MatchRule, MessageStream, Proxy};

const KESTREL: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Pens";
const INTERFACE: &str = "com.lantharos.Kestrel.Pens";
const BUS: &str = "org.freedesktop.DBus";
const NOTES: &str = "com.lantharos.heft.desktop";

#[derive(Serialize, Clone, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum PenKind {
    Screen,
    Tablet,
}

#[derive(Serialize, Clone, PartialEq, Eq, Type)]
pub struct PenDevice {
    id: String,
    name: String,
    kind: PenKind,
}

async fn read() -> Result<Vec<PenDevice>, String> {
    let proxy = Proxy::new(dbus::session().await?, KESTREL, PATH, INTERFACE)
        .await
        .map_err(failed)?;
    let rows: Vec<(String, String, String)> =
        proxy.get_property("Devices").await.map_err(failed)?;
    Ok(rows
        .into_iter()
        .map(|(id, name, kind)| PenDevice {
            id,
            name,
            kind: if kind == "tablet" {
                PenKind::Tablet
            } else {
                PenKind::Screen
            },
        })
        .collect())
}

pub async fn present() -> bool {
    read().await.is_ok_and(|devices| !devices.is_empty())
}

pub async fn changes() -> Result<impl Stream<Item = ()>, String> {
    let session = dbus::session().await?;
    let owner = MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .sender(BUS)
        .member("NameOwnerChanged")
        .arg(0, KESTREL)
        .build()
        .map_err(failed)?;
    let owners = MessageStream::for_match_rule(owner, session, None)
        .await
        .map_err(failed)?;
    let devices = objects::signals(session, KESTREL, PATH).await?;
    Ok(stream::select(owners, devices).map(drop))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("pen_devices", |Empty {}| read())
        .command("pen_notes_installed", |Empty {}| {
            Ok(gio_unix::DesktopAppInfo::new(NOTES).is_some())
        })
}
