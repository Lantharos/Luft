mod admit;
mod error;
mod interface;
mod prompt;

use interface::Changes;

pub const NAME: &str = "com.lantharos.Changes1";
pub const PATH: &str = "/com/lantharos/Changes1";

pub fn run() -> zbus::Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(luft_dbus::idle::serve(NAME, PATH, Changes::new))
}
