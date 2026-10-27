use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};
use zbus::{Fd, Variant as Value};

use crate::portals::Options;

#[proxy(
    interface = "com.lantharos.Kestrel.PortalDialogs",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/PortalDialogs"
)]
pub trait Dialogs {
    fn share_account(
        &self,
        handle: &str,
        app_id: &str,
        reason: &str,
    ) -> zbus::Result<(u32, Options)>;

    fn choose_application(
        &self,
        handle: &str,
        choices: &[String],
        options: &Options,
    ) -> zbus::Result<(u32, String)>;

    fn update_choices(&self, handle: &str, choices: &[String]) -> zbus::Result<()>;

    fn add_launcher(
        &self,
        handle: &str,
        app_id: &str,
        name: &str,
        icon: &Value<'_>,
        options: &Options,
    ) -> zbus::Result<(u32, String)>;

    fn choose_devices(
        &self,
        handle: &str,
        app_id: &str,
        devices: &[(String, Options)],
    ) -> zbus::Result<(u32, Vec<String>)>;

    fn confirm_wallpaper(&self, handle: &str, app_id: &str, image: Fd<'_>) -> zbus::Result<u32>;

    fn choose_print(
        &self,
        handle: &str,
        app_id: &str,
        printers: &[Options],
        preferences: &Options,
        options: &Options,
    ) -> zbus::Result<(u32, Options)>;

    fn launch(&self, desktop_id: &str, uris: &[&str]) -> zbus::Result<()>;

    fn dismiss(&self, handle: &str) -> zbus::Result<()>;
}

#[derive(Clone)]
pub struct Shell {
    connection: Connection,
}

impl Shell {
    pub fn new(connection: Connection) -> Self {
        Self { connection }
    }

    pub async fn answer<T, F>(&self, question: impl FnOnce(DialogsProxy<'static>) -> F) -> Option<T>
    where
        F: Future<Output = zbus::Result<T>>,
    {
        let dialogs = DialogsProxy::builder(&self.connection)
            .cache_properties(CacheProperties::No)
            .build()
            .await;
        let answered = match dialogs {
            Ok(dialogs) => question(dialogs).await,
            Err(error) => Err(error),
        };
        answered
            .inspect_err(|error| eprintln!("Kestrel couldn't answer: {error}"))
            .ok()
    }

    pub async fn dismiss(&self, handle: &str) {
        self.answer(|dialogs| async move { dialogs.dismiss(handle).await })
            .await;
    }
}
