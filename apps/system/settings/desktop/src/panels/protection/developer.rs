use luft_app::dbus::service::absent;
use luft_app::dbus::{self, explain};
use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;
use zbus::Proxy;
use zbus::proxy::MethodFlags;

const GREETER: &str = "com.lantharos.Greeter1";
const GREETER_PATH: &str = "/com/lantharos/Greeter1";

#[derive(Deserialize, Type)]
struct DeveloperTools {
    on: bool,
}

async fn greeter() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, GREETER, GREETER_PATH, GREETER)
        .await
        .map_err(|error| explain(&error))
}

async fn read(Empty {}: Empty) -> Result<Option<bool>, String> {
    match greeter().await?.get_property("DeveloperTools").await {
        Ok(on) => Ok(Some(on)),
        Err(error) if absent(&error) => Ok(None),
        Err(error) => Err(explain(&error)),
    }
}

async fn set(DeveloperTools { on }: DeveloperTools) -> Result<(), String> {
    greeter()
        .await?
        .call_with_flags::<_, _, ()>(
            "SetDeveloperTools",
            MethodFlags::ALLOW_INTERACTIVE_AUTH,
            &(on,),
        )
        .await
        .map(drop)
        .map_err(|error| explain(&error))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("developer_tools", read)
        .command_async("developer_tools_set", set)
}
