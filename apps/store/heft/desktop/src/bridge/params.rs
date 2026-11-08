use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize, Type)]
pub struct Rename {
    pub from: String,
    pub to: String,
}

#[derive(Deserialize, Type)]
pub struct Import {
    pub source: String,
    pub to: String,
}

#[derive(Deserialize, Type)]
pub struct Restore {
    pub id: String,
    pub to: String,
}

#[derive(Deserialize, Type)]
pub struct Id {
    pub id: String,
}

#[derive(Deserialize, Type, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub enum Kind {
    Pdf,
    Image,
    Importable,
}

#[derive(Deserialize, Type)]
pub struct Choose {
    pub kind: Kind,
    pub title: String,
    pub filter: String,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChooseSave {
    pub title: String,
    pub filter: String,
    pub name: String,
    pub extension: String,
}

#[derive(Deserialize, Type)]
pub struct Settings {
    pub name: String,
    pub value: serde_json::Value,
}

#[derive(Deserialize, Type)]
pub struct Name {
    pub name: String,
}
