use std::path::PathBuf;

use luft_app::dbus;

use super::store::Schedule;

const SERVICE: &str = "com.lantharos.settings.updates.service";
const TIMER: &str = "com.lantharos.settings.updates.timer";
const SYSTEMD: &str = "org.freedesktop.systemd1";
const SYSTEMD_PATH: &str = "/org/freedesktop/systemd1";
const MANAGER: &str = "org.freedesktop.systemd1.Manager";
pub const CHECK_ARGUMENT: &str = "--check-updates";

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn units() -> PathBuf {
    dirs::config_dir().unwrap_or_default().join("systemd/user")
}

fn call<B>(method: &str, body: &B) -> Result<(), String>
where
    B: serde::Serialize + zbus::zvariant::DynamicType,
{
    dbus::session()?
        .call_method(Some(SYSTEMD), SYSTEMD_PATH, Some(MANAGER), method, body)
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

pub fn apply(schedule: Schedule) -> Result<(), String> {
    let folder = units();
    let calendar = match schedule {
        Schedule::Daily => "daily",
        Schedule::Weekly => "weekly",
        Schedule::Never => {
            let _ = call("StopUnit", &(TIMER, "replace"));
            let _ = call("DisableUnitFiles", &(vec![TIMER], false));
            for unit in [TIMER, SERVICE] {
                let _ = std::fs::remove_file(folder.join(unit));
            }
            return call("Reload", &());
        }
    };
    let executable = std::env::current_exe().map_err(failed)?;
    std::fs::create_dir_all(&folder).map_err(failed)?;
    std::fs::write(folder.join(SERVICE), service(&executable.to_string_lossy())).map_err(failed)?;
    std::fs::write(folder.join(TIMER), timer(calendar)).map_err(failed)?;
    call("Reload", &())?;
    call("EnableUnitFiles", &(vec![TIMER], false, true))?;
    call("RestartUnit", &(TIMER, "replace"))
}
