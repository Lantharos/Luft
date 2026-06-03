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
    let args = std::env::args().collect::<Vec<_>>();
    if args.iter().any(|arg| arg == "--portal-backend") {
        if let Err(error) = rover_lib::run_portal_backend() {
            eprintln!("rover portal backend failed: {}", error);
            std::process::exit(1);
        }
        return;
    }
    if args
        .iter()
        .any(|arg| arg == "--install-file-chooser-portal")
    {
        if let Err(error) = rover_lib::install_file_chooser_portal() {
            eprintln!("failed to install Rover file chooser portal: {}", error);
            std::process::exit(1);
        }
        println!("Rover file chooser portal installed for this user.");
        return;
    }

    apply_webkit_nvidia_quirk();
    rover_lib::run();
}
