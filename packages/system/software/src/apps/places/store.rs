use std::collections::HashMap;

use luft_identity::permissions::{self, DRIVES, NO, READ_ONLY, READ_WRITE, StoreProxy};
use zbus::{Connection, OwnedVariant, Variant};

use super::Access;
use super::drives::Drive;

const UUID: &str = "uuid";
const LABEL: &str = "label";
const SIZE: &str = "size";
const DRIVE: &str = "drive";

/// A drive as it was when an app was given or refused it, kept beside the
/// answers so it can be named while it isn't plugged in. Its entry is named
/// after both the filesystem and the drive, so a copy of the filesystem on
/// another drive never shares its answers.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Known {
    pub uuid: String,
    pub drive: String,
    pub label: String,
    pub size: u64,
}

impl Known {
    /// Whether `drive` is this drive: the same filesystem, on the same drive
    /// when the drive could be told apart when it was given.
    pub fn is(&self, drive: &Drive) -> bool {
        self.uuid == drive.uuid && (self.drive.is_empty() || self.drive == drive.drive)
    }

    pub fn entry(&self) -> String {
        if self.drive.is_empty() {
            self.uuid.clone()
        } else {
            format!("{} {}", self.uuid, self.drive)
        }
    }

    fn of(drive: &Drive) -> Self {
        Self {
            uuid: drive.uuid.clone(),
            drive: drive.drive.clone(),
            label: drive.label.clone(),
            size: drive.size,
        }
    }

    fn read(entry: String, data: OwnedVariant) -> Self {
        let fields = HashMap::<String, OwnedVariant>::try_from(data).unwrap_or_default();
        let text = |key: &str| {
            fields
                .get(key)
                .and_then(|value| String::try_from(value.try_clone().ok()?).ok())
                .unwrap_or_default()
        };
        Self {
            label: text(LABEL),
            drive: text(DRIVE),
            size: fields
                .get(SIZE)
                .and_then(|value| u64::try_from(value).ok())
                .unwrap_or(0),
            uuid: Some(text(UUID))
                .filter(|uuid| !uuid.is_empty())
                .unwrap_or(entry),
        }
    }

    fn data(&self) -> Variant<'_> {
        Variant::from(HashMap::from([
            (UUID, Variant::from(self.uuid.as_str())),
            (LABEL, Variant::from(self.label.as_str())),
            (SIZE, Variant::from(self.size)),
            (DRIVE, Variant::from(self.drive.as_str())),
        ]))
    }
}

/// What an app was told about a drive.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Answer {
    Given(Access),
    Refused,
}

impl Answer {
    fn parse(values: &[String]) -> Option<Self> {
        match values.first()?.as_str() {
            READ_WRITE => Some(Self::Given(Access::ReadWrite)),
            READ_ONLY => Some(Self::Given(Access::ReadOnly)),
            NO => Some(Self::Refused),
            _ => None,
        }
    }

    fn value(self) -> &'static str {
        match self {
            Self::Given(Access::ReadWrite) => READ_WRITE,
            Self::Given(Access::ReadOnly) => READ_ONLY,
            Self::Refused => NO,
        }
    }
}

/// Every drive any app was told about, with each app's answer.
pub async fn everything(
    connection: &Connection,
) -> zbus::Result<Vec<(Known, HashMap<String, Answer>)>> {
    Ok(permissions::described_entries(connection, DRIVES)
        .await?
        .into_iter()
        .map(|(entry, apps, data)| {
            let answers = apps
                .into_iter()
                .filter_map(|(app, values)| Some((app, Answer::parse(&values)?)))
                .collect();
            (Known::read(entry, data), answers)
        })
        .collect())
}

/// The drives `app` was told about, with what it was told.
pub async fn of(connection: &Connection, app: &str) -> zbus::Result<Vec<(Known, Answer)>> {
    Ok(everything(connection)
        .await?
        .into_iter()
        .filter_map(|(known, mut answers)| Some((known, answers.remove(app)?)))
        .collect())
}

pub async fn answer(
    connection: &Connection,
    app: &str,
    drive: &Drive,
    answer: Answer,
) -> zbus::Result<()> {
    let known = Known::of(drive);
    let entry = known.entry();
    permissions::describe(connection, DRIVES, &entry, &known.data()).await?;
    StoreProxy::new(connection)
        .await?
        .set_permission(DRIVES, true, &entry, app, &[answer.value()])
        .await
}

/// Forgets what `app` was told about the drive, and the drive once no app
/// was told anything about it.
pub async fn forget(connection: &Connection, app: &str, known: &Known) -> zbus::Result<()> {
    let entry = known.entry();
    permissions::forget(connection, DRIVES, &entry, app).await?;
    if permissions::lookup(connection, DRIVES, &entry)
        .await?
        .is_empty()
    {
        permissions::remove(connection, DRIVES, &entry).await?;
    }
    Ok(())
}
