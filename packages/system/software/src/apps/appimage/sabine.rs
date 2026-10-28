use sabine_service::{SabineService, SabineVersion};
use serde::Deserialize;

#[derive(Deserialize)]
struct Manifest {
    app: AppTable,
}

#[derive(Deserialize)]
struct AppTable {
    id: String,
    version: String,
    sabine: String,
}

/// A Sabine app as its manifest names it, with the Sabine build it was made with.
pub struct SabineApp {
    id: String,
    version: String,
    sabine: SabineVersion,
}

impl SabineApp {
    pub fn read(manifest: &str) -> Option<Self> {
        let app = toml::from_str::<Manifest>(manifest).ok()?.app;
        Some(Self {
            sabine: SabineVersion::parse(&app.sabine)?,
            id: app.id,
            version: app.version,
        })
    }

    /// Tells Sabine this build is installed now, so a Sabine update that
    /// waits for it goes ahead without the app having to start first.
    pub fn record(&self) -> Result<(), String> {
        SabineService::default()
            .record_installed_build(&self.id, &self.version, self.sabine)
            .map_err(|error| error.to_string())
    }
}
