use std::collections::HashMap;

use ctap::{Credential, NewCredential, Protection, PublicKey, RelyingParty, Status, User};
use zbus::zvariant::{OwnedValue, Value};
use zbus::{Connection, Proxy};
use zeroize::Zeroizing;

const KEYRING: &str = "com.lantharos.Keyring1";
const PATH: &str = "/com/lantharos/Keyring1";
const PASSKEYS: &str = "com.lantharos.Keyring1.Passkeys";

type Record = HashMap<String, OwnedValue>;

pub struct Passkey {
    pub credential: Credential,
    pub nickname: String,
    pub created: u64,
    pub used: u64,
    pub chip: bool,
}

#[derive(Clone)]
pub struct Vault {
    proxy: Proxy<'static>,
}

fn unavailable(error: zbus::Error) -> Status {
    eprintln!("Luft Keyring refused a passkey request: {error}");
    match error {
        zbus::Error::MethodError(name, ..) if name.ends_with(".NotFound") => Status::NoCredentials,
        _ => Status::OperationDenied,
    }
}

fn field<T: TryFrom<OwnedValue>>(record: &Record, name: &str) -> Result<T, Status> {
    let value = record.get(name).ok_or(Status::Other)?;
    T::try_from(value.try_clone().map_err(|_| Status::Other)?).map_err(|_| Status::Other)
}

fn optional(record: &Record, name: &str) -> Option<String> {
    field::<String>(record, name)
        .ok()
        .filter(|text| !text.is_empty())
}

fn passkey(record: &Record) -> Result<Passkey, Status> {
    let coordinate = |name| -> Result<[u8; 32], Status> {
        field::<Vec<u8>>(record, name)?
            .try_into()
            .map_err(|_| Status::Other)
    };
    let credential = Credential {
        id: field(record, "id")?,
        rp: RelyingParty {
            id: field(record, "rp")?,
            name: optional(record, "rp_name"),
        },
        user: User {
            id: field(record, "user_id")?,
            name: optional(record, "user_name"),
            display_name: optional(record, "display_name"),
        },
        public_key: PublicKey {
            x: coordinate("x")?,
            y: coordinate("y")?,
        },
        discoverable: field(record, "discoverable")?,
        protection: Protection::from_level(i64::from(field::<u8>(record, "protection")?))?,
    };
    Ok(Passkey {
        credential,
        nickname: optional(record, "nickname").unwrap_or_default(),
        created: field(record, "created")?,
        used: field(record, "used")?,
        chip: field(record, "chip")?,
    })
}

fn user_fields(user: &User) -> [(&'static str, Value<'_>); 3] {
    [
        ("user_id", Value::from(user.id.as_slice())),
        (
            "user_name",
            Value::from(user.name.as_deref().unwrap_or_default()),
        ),
        (
            "display_name",
            Value::from(user.display_name.as_deref().unwrap_or_default()),
        ),
    ]
}

impl Vault {
    pub async fn connect(session: &Connection) -> zbus::Result<Self> {
        Ok(Self {
            proxy: Proxy::new(session, KEYRING, PATH, PASSKEYS).await?,
        })
    }

    pub async fn list(&self) -> Result<Vec<Passkey>, Status> {
        let records: Vec<Record> = self.proxy.call("List", &()).await.map_err(unavailable)?;
        records.iter().map(passkey).collect()
    }

    pub async fn create(&self, request: &NewCredential) -> Result<Passkey, Status> {
        let mut fields: HashMap<&str, Value<'_>> = HashMap::from([
            ("rp", Value::from(request.rp.id.as_str())),
            (
                "rp_name",
                Value::from(request.rp.name.as_deref().unwrap_or_default()),
            ),
            ("discoverable", Value::from(request.discoverable)),
            (
                "protection",
                Value::from(u8::try_from(request.protection.level()).expect("levels are 1 to 3")),
            ),
        ]);
        fields.extend(user_fields(&request.user));
        let record: Record = self
            .proxy
            .call("Create", &(fields,))
            .await
            .map_err(unavailable)?;
        passkey(&record)
    }

    pub async fn count(&self, id: &[u8]) -> Result<u32, Status> {
        self.proxy.call("Count", &(id,)).await.map_err(unavailable)
    }

    pub async fn sign(&self, id: &[u8], message: &[u8]) -> Result<Vec<u8>, Status> {
        self.proxy
            .call("Sign", &(id, message))
            .await
            .map_err(unavailable)
    }

    pub async fn hmac_secret(
        &self,
        id: &[u8],
        verified: bool,
        salts: &[u8],
    ) -> Result<Zeroizing<Vec<u8>>, Status> {
        self.proxy
            .call("HmacSecret", &(id, verified, salts))
            .await
            .map(Zeroizing::new)
            .map_err(unavailable)
    }

    pub async fn rename(&self, id: &[u8], nickname: &str) -> Result<(), Status> {
        let changes = HashMap::from([("nickname", Value::from(nickname))]);
        self.proxy
            .call("Update", &(id, changes))
            .await
            .map_err(unavailable)
    }

    pub async fn update_user(&self, id: &[u8], user: &User) -> Result<(), Status> {
        let changes: HashMap<&str, Value<'_>> = user_fields(user).into_iter().collect();
        self.proxy
            .call("Update", &(id, changes))
            .await
            .map_err(unavailable)
    }

    pub async fn delete(&self, id: &[u8]) -> Result<(), Status> {
        self.proxy.call("Delete", &(id,)).await.map_err(unavailable)
    }

    pub async fn chip(&self) -> Result<bool, Status> {
        self.proxy.get_property("Chip").await.map_err(unavailable)
    }
}
