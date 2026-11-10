use luft_software::apps::appimage;
use serde::Serialize;
use specta::Type;

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct SabineWait {
    name: String,
    update: bool,
}

pub fn installed_by_user() -> Vec<SabineWait> {
    sabine_service::held_system_update()
        .map(|held| held.apps)
        .unwrap_or_default()
        .into_iter()
        .filter(|app| !app.system)
        .map(|app| SabineWait {
            update: has_update(&app.id),
            name: app.name,
        })
        .collect()
}

fn has_update(id: &str) -> bool {
    appimage::find(id)
        .ok()
        .and_then(|app| appimage::check(&app).ok().flatten())
        .is_some()
}
