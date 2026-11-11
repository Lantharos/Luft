use luft_app::dbus::{self, failed};
use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::Proxy;

const NAME: &str = "com.lantharos.CrashReports1";
const PATH: &str = "/com/lantharos/CrashReports1";

#[derive(Serialize, Type)]
pub struct CrashReportsState {
    available: bool,
    choice: String,
}

#[derive(Deserialize, Type)]
struct CrashReportsChoice {
    choice: String,
}

async fn reports() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, NAME, PATH, NAME)
        .await
        .map_err(failed)
}

async fn state(Empty {}: Empty) -> Result<CrashReportsState, String> {
    let reports = reports().await?;
    Ok(CrashReportsState {
        available: reports.get_property("Available").await.map_err(failed)?,
        choice: reports.get_property("Choice").await.map_err(failed)?,
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("crash_reports_state", state)
        .command_async(
            "crash_reports_choose",
            |CrashReportsChoice { choice }| async move {
                reports()
                    .await?
                    .call::<_, _, ()>("SetChoice", &(choice,))
                    .await
                    .map_err(failed)
            },
        )
        .command_async("crash_reports_reset_install", |Empty {}| async move {
            reports()
                .await?
                .call::<_, _, ()>("ResetInstall", &())
                .await
                .map_err(failed)
        })
}
