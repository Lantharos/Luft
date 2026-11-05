use luft_app::{Commands, Empty, dbus};
use sabine::SabineWindow;
use zbus::Proxy;

const KESTREL: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Taskbar";
const INTERFACE: &str = "com.lantharos.Kestrel.Taskbar";

async fn arrange(Empty {}: Empty) -> Result<(), String> {
    Proxy::new(dbus::session().await?, KESTREL, PATH, INTERFACE)
        .await
        .map_err(dbus::failed)?
        .call::<_, _, ()>("Arrange", &())
        .await
        .map_err(dbus::failed)
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command_async("taskbar_arrange", arrange)
}
