struct Command {
    flag: &'static str,
    run: fn() -> Result<(), String>,
    success: Option<&'static str>,
    failure: &'static str,
}

const COMMANDS: [Command; 4] = [
    Command {
        flag: "--portal-backend",
        run: rover_lib::run_portal_backend,
        success: None,
        failure: "Rover file chooser portal failed",
    },
    Command {
        flag: "--install-file-chooser-portal",
        run: rover_lib::install_file_chooser_portal,
        success: Some("Rover file chooser portal installed for this user."),
        failure: "Could not install the Rover file chooser portal",
    },
    Command {
        flag: "--file-manager-bus",
        run: rover_lib::run_file_manager_bus,
        success: None,
        failure: "Rover file manager bus failed",
    },
    Command {
        flag: "--install-file-manager-bus",
        run: rover_lib::install_file_manager_bus,
        success: Some("Rover file manager bus installed for this user."),
        failure: "Could not install the Rover file manager bus",
    },
];

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let Some(command) = COMMANDS
        .iter()
        .find(|command| args.iter().any(|arg| arg == command.flag))
    else {
        rover_lib::run_app();
    };
    match (command.run)() {
        Ok(()) => {
            if let Some(success) = command.success {
                println!("{success}");
            }
        }
        Err(error) => {
            eprintln!("{}: {error}", command.failure);
            std::process::exit(1);
        }
    }
}
