use std::path::PathBuf;

use luft_app::dbus::{self, failed};
use zbus::DynamicType;

use super::store::Schedule;

const SERVICE: &str = "com.lantharos.settings.updates.service";
const TIMER: &str = "com.lantharos.settings.updates.timer";
const SYSTEMD: &str = "org.freedesktop.systemd1";
const SYSTEMD_PATH: &str = "/org/freedesktop/systemd1";
const MANAGER: &str = "org.freedesktop.systemd1.Manager";
pub const CHECK_ARGUMENT: &str = "--check-updates";

fn units() -> PathBuf {
    dirs::config_dir().unwrap_or_default().join("systemd/user")
}

pub async fn call<B>(method: &str, body: &B) -> Result<(), String>
where
    B: serde::Serialize + DynamicType,
{
    dbus::session()
        .await?
        .call_method(Some(SYSTEMD), SYSTEMD_PATH, Some(MANAGER), method, body)
        .await
        .map(|_| ())
        .map_err(failed)
}

fn service(executable: &str) -> String {
    format!(
        "[Unit]\nDescription=Check for system updates\n\n[Service]\nType=exec\nExecStart=\"{executable}\" {CHECK_ARGUMENT}\nNice=19\nIOSchedulingClass=idle\n"
    )
}

fn timer(calendar: &str) -> String {
    format!(
        "[Unit]\nDescription=Check for system updates regularly\n\n[Timer]\nOnCalendar={calendar}\nRandomizedDelaySec=1h\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n"
    )
}

pub async fn apply(schedule: Schedule) -> Result<(), String> {
    let folder = units();
    let calendar = match schedule {
        Schedule::Daily => "daily",
        Schedule::Weekly => "weekly",
        Schedule::Never => {
            let _ = call("StopUnit", &(TIMER, "replace")).await;
            let _ = call("DisableUnitFiles", &(vec![TIMER], false)).await;
            for unit in [TIMER, SERVICE] {
                let _ = std::fs::remove_file(folder.join(unit));
            }
            call("MaskUnitFiles", &(vec![TIMER], false, true)).await?;
            return call("Reload", &()).await;
        }
    };
    let executable = std::env::current_exe().map_err(failed)?;
    std::fs::create_dir_all(&folder).map_err(failed)?;
    call("UnmaskUnitFiles", &(vec![TIMER], false)).await?;
    std::fs::write(folder.join(SERVICE), service(&executable.to_string_lossy())).map_err(failed)?;
    std::fs::write(folder.join(TIMER), timer(calendar)).map_err(failed)?;
    call("Reload", &()).await?;
    call("EnableUnitFiles", &(vec![TIMER], false, true)).await?;
    call("RestartUnit", &(TIMER, "replace")).await
}
