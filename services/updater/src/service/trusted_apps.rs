use std::collections::BTreeSet;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};
use std::path::Path;
use std::sync::Arc;

use anyhow::Context;
use luft_dbus::idle::Idle;
use luft_dbus::trusted_apps::{self, PATH};
use zbus::message::Header;
use zbus::{Connection, interface};

use super::error::Error;

const CHANGE: &str = "com.lantharos.updater.trust-app";

pub struct TrustedApps {
    idle: Arc<Idle>,
}

impl TrustedApps {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self { idle }
    }

    async fn change(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        app_id: &str,
        trusted: bool,
    ) -> Result<(), Error> {
        if !trusted_apps::is_app_id(app_id) {
            return Err(Error::Failed(format!("{app_id} isn't an app ID.")));
        }
        let _activity = self.idle.hold();
        if !luft_dbus::polkit::is_authorized(connection, header, CHANGE).await? {
            return Err(Error::not_authorized());
        }
        let mut apps = trusted_apps::read();
        let changed = if trusted {
            apps.insert(app_id.to_owned())
        } else {
            apps.remove(app_id)
        };
        if changed {
            write(Path::new(PATH), &apps)?;
        }
        Ok(())
    }
}

fn write(path: &Path, apps: &BTreeSet<String>) -> anyhow::Result<()> {
    let folder = path
        .parent()
        .context("The list of trusted apps has no folder")?;
    fs::create_dir_all(folder).context("Creating the folder of trusted apps")?;
    fs::set_permissions(folder, fs::Permissions::from_mode(0o755))?;
    let staged = folder.join(".trusted-apps.new");
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o644)
        .open(&staged)
        .context("Writing the list of trusted apps")?;
    for app in apps {
        writeln!(file, "{app}")?;
    }
    file.sync_all()?;
    fs::rename(&staged, path).context("Replacing the list of trusted apps")?;
    Ok(())
}

#[interface(name = "com.lantharos.Updater1.TrustedApps")]
impl TrustedApps {
    fn list(&self) -> Vec<String> {
        trusted_apps::read().into_iter().collect()
    }

    async fn trust(
        &self,
        app_id: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.change(connection, &header, app_id, true).await
    }

    async fn untrust(
        &self,
        app_id: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.change(connection, &header, app_id, false).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_list_is_replaced_whole_and_readable_by_everyone() {
        let folder = std::env::temp_dir().join(format!("luft-trusted-apps-{}", std::process::id()));
        let path = folder.join("kestrel").join("trusted-apps");
        let apps = BTreeSet::from([
            "org.example.Notes".to_owned(),
            "com.example.Chat".to_owned(),
        ]);
        write(&path, &apps).unwrap();
        assert_eq!(
            fs::read_to_string(&path).unwrap(),
            "com.example.Chat\norg.example.Notes\n"
        );
        assert_eq!(
            fs::metadata(&path).unwrap().permissions().mode() & 0o777,
            0o644
        );
        write(&path, &BTreeSet::new()).unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "");
        fs::remove_dir_all(folder).unwrap();
    }
}
