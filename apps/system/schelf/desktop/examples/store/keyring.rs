use std::collections::HashMap;
use std::io::{Read, Write};
use std::os::fd::AsFd;
use std::sync::Mutex;

use luft_dbus_macros::introspect;
use zbus::fdo::{self, RequestNameFlags};
use zbus::{Connection, Fd, interface};

use crate::fixtures::{SESSION, USER_EMAIL, USER_NAME};

const NAME: &str = "com.lantharos.Keyring1";
const PATH: &str = "/com/lantharos/Keyring1";
const APP: &str = "com.lantharos.schelf";
const SECRET: &str = "schelf.store";

/// Luft Keyring's app secrets, holding the stand-in store's session for Schelf.
struct AppSecrets {
    secrets: Mutex<HashMap<(String, String), Vec<u8>>>,
}

fn file(fd: &Fd<'_>) -> fdo::Result<std::fs::File> {
    fd.as_fd()
        .try_clone_to_owned()
        .map(std::fs::File::from)
        .map_err(|error| fdo::Error::Failed(error.to_string()))
}

#[introspect]
#[interface(name = "com.lantharos.Keyring1.AppSecrets")]
impl AppSecrets {
    fn store(&self, app: &str, name: &str, secret: Fd<'_>) -> fdo::Result<()> {
        let mut value = Vec::new();
        file(&secret)?
            .read_to_end(&mut value)
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        self.secrets
            .lock()
            .expect("the secrets lock")
            .insert((app.to_owned(), name.to_owned()), value);
        Ok(())
    }

    fn load(&self, app: &str, name: &str, output: Fd<'_>) -> fdo::Result<bool> {
        let secrets = self.secrets.lock().expect("the secrets lock");
        let Some(secret) = secrets.get(&(app.to_owned(), name.to_owned())) else {
            return Ok(false);
        };
        file(&output)?
            .write_all(secret)
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        Ok(true)
    }

    fn delete(&self, app: &str, name: &str) -> bool {
        self.secrets
            .lock()
            .expect("the secrets lock")
            .remove(&(app.to_owned(), name.to_owned()))
            .is_some()
    }
}

/// Signs Schelf in to the stand-in store: the session in the stand-in keyring,
/// and who it belongs to where Schelf keeps that. It refuses a bus where Luft
/// Keyring already runs, so it never touches a real sign-in.
pub async fn serve() -> Result<Connection, String> {
    let secrets = AppSecrets {
        secrets: Mutex::new(HashMap::from([(
            (APP.to_owned(), SECRET.to_owned()),
            SESSION.as_bytes().to_vec(),
        )])),
    };
    let connection = Connection::session()
        .await
        .map_err(|error| error.to_string())?;
    connection
        .object_server()
        .at(PATH, secrets)
        .await
        .map_err(|error| error.to_string())?;
    connection
        .request_name_with_flags(NAME, RequestNameFlags::DO_NOT_QUEUE)
        .await
        .map_err(|_| "Luft Keyring runs on this bus already; start the stand-in on a bus of its own with dbus-run-session".to_owned())?;
    let folder = dirs::data_dir().ok_or("There's no home folder")?.join(APP);
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let account = serde_json::json!({ "email": USER_EMAIL, "name": USER_NAME });
    std::fs::write(folder.join("account.json"), account.to_string())
        .map_err(|error| error.to_string())?;
    Ok(connection)
}
