use luft_software::system::System;
use luft_software::task::Task;

use super::image::Image;
use super::overview::Loaded;
use super::packages::Packages;

pub struct Notice {
    pub summary: &'static str,
    pub body: &'static str,
}

pub const AVAILABLE: Notice = Notice {
    summary: "desktop-updates-available-summary",
    body: "desktop-updates-available-body",
};

pub const READY: Notice = Notice {
    summary: "desktop-updates-ready-summary",
    body: "desktop-updates-ready-body",
};

pub trait Backend: Sync {
    fn load(&self, refresh: Option<Task>) -> Result<Loaded, String>;
    fn download(&self, task: Task) -> Result<(), String>;
    fn downloaded(&self);
    fn rollback(&self, task: Task) -> Result<(), String>;
    fn check_in_background(&self, download: bool) -> Result<Option<Notice>, String>;
    fn watch(&self);
    fn scan(&self);
}

pub fn current() -> &'static dyn Backend {
    match System::current() {
        System::Packages => &Packages,
        System::Image => &Image,
    }
}
