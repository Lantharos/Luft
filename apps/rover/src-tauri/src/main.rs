// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
fn apply_webkit_nvidia_quirk() {
    webkit2gtk_nvidia_quirk::apply_workaround_with_options(
        webkit2gtk_nvidia_quirk::ApplyWorkaroundOptions::default(),
    );
}

#[cfg(not(target_os = "linux"))]
fn apply_webkit_nvidia_quirk() {}

fn main() {
    apply_webkit_nvidia_quirk();
    rover_lib::run();
}
