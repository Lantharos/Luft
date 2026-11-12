use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

#[introspect]
#[proxy(
    interface = "com.lantharos.Greeter1",
    default_service = "com.lantharos.Greeter1",
    default_path = "/com/lantharos/Greeter1"
)]
trait Greeter {
    fn set_developer_tools(&self, on: bool) -> zbus::Result<()>;

    #[zbus(property)]
    fn developer_tools(&self) -> zbus::Result<bool>;
}

pub async fn developer_tools(system: &Connection) -> zbus::Result<bool> {
    GreeterProxy::new(system).await?.developer_tools().await
}

pub async fn set_developer_tools(system: &Connection, on: bool) -> zbus::Result<()> {
    GreeterProxy::new(system)
        .await?
        .set_developer_tools(on)
        .await
}
