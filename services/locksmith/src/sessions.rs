use anyhow::Result;
use zbus::Connection;

use crate::dconf::LOCKABLE;

const WRITER: &str = "ca.desrt.dconf.Writer";
const PATH: &str = "/ca/desrt/dconf/Writer/luft-policy";

/// Has every running session read the locked settings again and hear that each key that can be
/// locked may have changed, the way `dconf update` tells them about a new system database.
pub fn tell() -> Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async {
            let bus = Connection::system().await?;
            let changed: Vec<String> = LOCKABLE
                .iter()
                .map(|(folder, key)| format!("{folder}/{key}"))
                .collect();
            bus.emit_signal(None::<()>, PATH, WRITER, "WritabilityNotify", &("/",))
                .await?;
            bus.emit_signal(None::<()>, PATH, WRITER, "Notify", &("/", changed, ""))
                .await?;
            Ok(())
        })
}
