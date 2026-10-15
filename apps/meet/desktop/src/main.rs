#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]
#![cfg_attr(not(windows), allow(dead_code))]

mod app;
mod boot;
mod check;
#[cfg(windows)]
mod folders;
#[cfg(windows)]
mod helper;
mod live;
mod plan;
mod protocol;

fn main() {
    #[cfg(windows)]
    if let Some(link) = helper::requested() {
        helper::serve(link);
        return;
    }
    app::run();
}
