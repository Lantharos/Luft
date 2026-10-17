#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]
#![cfg_attr(all(test, not(windows)), allow(dead_code))]
mod app;
mod boot;
mod check;
#[cfg(windows)]
mod folders;
#[cfg(windows)]
mod helper;
#[cfg(target_os = "linux")]
mod linux;
mod live;
#[cfg(any(windows, test))]
mod plan;
mod protocol;
mod serving;
mod stick;

fn main() {
    #[cfg(windows)]
    if let Some(link) = helper::requested() {
        helper::serve(link);
        return;
    }
    #[cfg(target_os = "linux")]
    if linux::helper::requested() {
        linux::helper::serve();
        return;
    }
    app::run();
}
