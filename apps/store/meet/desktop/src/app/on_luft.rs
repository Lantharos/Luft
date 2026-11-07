use super::Empty;
use super::job::Jobs;

pub trait OnLuft {
    fn on_luft(self) -> Self;
}

#[cfg(target_os = "linux")]
#[derive(serde::Deserialize, specta::Type)]
struct Opening {
    page: crate::linux::luft::Page,
}

#[cfg(target_os = "linux")]
impl OnLuft for Jobs {
    fn on_luft(self) -> Self {
        use crate::linux::luft;
        self.job("meet_on_luft", |_, Empty {}| Ok(luft::running()))
            .job("meet_open_on_luft", |_, Opening { page }| luft::open(page))
    }
}

#[cfg(windows)]
impl OnLuft for Jobs {
    fn on_luft(self) -> Self {
        self.job("meet_on_luft", |_, Empty {}| Ok(false))
    }
}
