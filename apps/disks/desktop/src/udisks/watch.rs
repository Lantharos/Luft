use luft_app::Events;
use luft_app::dbus::{self, objects};

use super::{ROOT, SERVICE, snapshot};
use crate::events::DISKS_CHANGED;

pub fn start(events: Events) {
    luft_app::spawn(async move {
        if let Err(error) = follow(&events).await {
            eprintln!("disks: {error}");
        }
    });
}

async fn follow(events: &Events) -> Result<(), String> {
    let mut changes = objects::signals(dbus::system().await?, SERVICE, ROOT).await?;
    while objects::settle(&mut changes).await {
        if let Ok(objects) = super::objects().await {
            events.emit(DISKS_CHANGED, snapshot::build(&objects));
        }
    }
    Ok(())
}
