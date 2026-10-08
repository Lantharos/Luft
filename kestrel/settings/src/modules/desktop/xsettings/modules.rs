use std::path::Path;

use crate::shared::settings::Schemas;

const DIRECTORIES: [&str; 2] = [
    "/usr/lib64/gnome-settings-daemon-3.0/gtk-modules",
    "/usr/lib/gnome-settings-daemon-3.0/gtk-modules",
];
const GROUP: &str = "GTK Module";

pub struct GtkModule {
    name: String,
    switch: Option<(&'static str, String)>,
}

impl GtkModule {
    pub fn schema(&self) -> Option<&'static str> {
        self.switch.as_ref().map(|(schema, _)| *schema)
    }
}

pub fn installed() -> Vec<GtkModule> {
    let mut modules: Vec<GtkModule> = DIRECTORIES
        .iter()
        .filter_map(|directory| std::fs::read_dir(directory).ok())
        .flat_map(|entries| entries.flatten())
        .filter_map(|entry| read(&entry.path()))
        .collect();
    modules.sort_by(|first, second| first.name.cmp(&second.name));
    modules.dedup_by(|first, second| first.name == second.name);
    modules
}

fn read(path: &Path) -> Option<GtkModule> {
    let file = glib::KeyFile::new();
    file.load_from_file(path, glib::KeyFileFlags::NONE).ok()?;
    let name = file.string(GROUP, "X-GTK-Module-Name").ok()?.to_string();
    let schema = file.string(GROUP, "X-GTK-Module-Enabled-Schema").ok();
    let key = file.string(GROUP, "X-GTK-Module-Enabled-Key").ok();
    let switch = schema.zip(key).map(|(schema, key)| {
        let schema: &'static str = Box::leak(schema.to_string().into_boxed_str());
        (schema, key.to_string())
    });
    Some(GtkModule { name, switch })
}

pub fn enabled(modules: &[GtkModule], settings: &Schemas) -> String {
    modules
        .iter()
        .filter(|module| match &module.switch {
            Some((schema, key)) => settings.get::<bool>(schema, key),
            None => true,
        })
        .map(|module| module.name.as_str())
        .collect::<Vec<_>>()
        .join(":")
}
