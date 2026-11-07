use std::{env, process};

use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

const TOKEN: &str = "XDG_ACTIVATION_TOKEN";

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Activation",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Activation"
)]
trait Activation {
    fn token(&self, pid: u32) -> zbus::Result<String>;
}

/// A token that lets Rover's window come forward for a request from `pid`,
/// which Kestrel only gives when that process, or one that started it, is
/// the app in front.
pub async fn token_for(connection: &Connection, pid: u32) -> Option<String> {
    let token = ActivationProxy::new(connection)
        .await
        .ok()?
        .token(pid)
        .await
        .ok()?;
    (!token.is_empty()).then_some(token)
}

/// When Rover starts without a token, such as from `xdg-open` in another
/// app, asks for one for itself, so the window it opens or the one already
/// open comes forward. Runs before Rover starts any other thread.
pub fn claim_for_launch() {
    if env::var_os(TOKEN).is_some() || env::var_os("DESKTOP_STARTUP_ID").is_some() {
        return;
    }
    let Ok(runtime) = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    else {
        return;
    };
    let token = runtime.block_on(async {
        token_for(&Connection::session().await.ok()?, process::id()).await
    });
    drop(runtime);
    if let Some(token) = token {
        // SAFETY: no other thread exists yet to read the environment.
        unsafe { env::set_var(TOKEN, token) };
    }
}
