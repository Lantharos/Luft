use gio::prelude::*;

const SCHEMA: &str = "org.gnome.desktop.input-sources";
const SOURCES: &str = "sources";

type Source = (String, String);

fn settings() -> Result<gio::Settings, String> {
    gio::SettingsSchemaSource::default()
        .and_then(|source| source.lookup(SCHEMA, true))
        .map(|_| gio::Settings::new(SCHEMA))
        .ok_or_else(|| "Input sources aren't available here".into())
}

fn read(settings: &gio::Settings) -> Vec<Source> {
    settings.value(SOURCES).get().unwrap_or_default()
}

fn write(settings: &gio::Settings, sources: Vec<Source>) -> Result<(), String> {
    settings
        .set_value(SOURCES, &sources.to_variant())
        .map_err(|error| error.to_string())?;
    gio::Settings::sync();
    Ok(())
}

pub fn list() -> Result<Vec<Source>, String> {
    Ok(read(&settings()?))
}

pub fn add(kind: &str, id: &str) -> Result<(), String> {
    let settings = settings()?;
    let mut sources = read(&settings);
    if sources
        .iter()
        .any(|(existing, name)| existing == kind && name == id)
    {
        return Ok(());
    }
    sources.push((kind.into(), id.into()));
    write(&settings, sources)
}

pub fn remove(kind: &str, id: &str) -> Result<(), String> {
    let settings = settings()?;
    let sources = read(&settings);
    let kept: Vec<Source> = sources
        .iter()
        .filter(|(existing, name)| existing != kind || name != id)
        .cloned()
        .collect();
    if kept.len() == sources.len() {
        return Ok(());
    }
    write(&settings, kept)
}
