use std::sync::{Mutex, MutexGuard};

use luft_software::apps::updates;
use luft_software::task::Task;
use serde::Serialize;

use super::image;
use super::state;
use super::store::Checked;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Overview {
    checked: Option<u64>,
    apps: Option<usize>,
    pub system: image::Overview,
}

#[derive(PartialEq, Eq)]
enum Reload {
    Idle,
    Running,
    Again,
}

static RELOAD: Mutex<Reload> = Mutex::new(Reload::Idle);

pub fn load(refresh: Option<Task>) -> Result<(), String> {
    let refreshed = refresh.is_some();
    let system = image::load(refresh)?;
    let checked = if refreshed {
        Checked::now()?
    } else {
        Checked::load()
    };
    state::set_overview(Overview {
        checked: checked.at,
        apps: state::overview().and_then(|overview| overview.apps),
        system,
    });
    std::thread::spawn(move || {
        let apps = updates::count();
        state::edit_overview(|overview| overview.apps = Some(apps));
    });
    Ok(())
}

fn reloading() -> MutexGuard<'static, Reload> {
    RELOAD
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

pub fn reload() {
    {
        let mut reload = reloading();
        if *reload != Reload::Idle {
            *reload = Reload::Again;
            return;
        }
        *reload = Reload::Running;
    }
    std::thread::spawn(|| {
        loop {
            if let Err(error) = load(None) {
                state::fail(error);
            }
            let mut reload = reloading();
            if *reload == Reload::Running {
                *reload = Reload::Idle;
                return;
            }
            *reload = Reload::Running;
        }
    });
}
