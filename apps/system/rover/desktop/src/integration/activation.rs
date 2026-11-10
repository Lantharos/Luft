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

pub async fn token_for(connection: &Connection, pid: u32) -> Option<String> {
    let token = ActivationProxy::new(connection)
        .await
        .ok()?
        .token(pid)
        .await
        .ok()?;
    (!token.is_empty()).then_some(token)
}

pub fn claim_before_threads() {
    if env::var_os(TOKEN).is_some() || env::var_os("DESKTOP_STARTUP_ID").is_some() {
        return;
    }
    let Ok(runtime) = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    else {
        return;
    };
    let token = runtime
        .block_on(async { token_for(&Connection::session().await.ok()?, process::id()).await });
    drop(runtime);
    if let Some(token) = token {
        unsafe { env::set_var(TOKEN, token) };
    }
}
