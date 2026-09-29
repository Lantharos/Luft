use std::fs;

use crate::APP_ID;

pub fn install() -> Result<(), String> {
    let executable = std::env::current_exe().map_err(|error| error.to_string())?;
    let folder = dirs::data_dir()
        .ok_or("Could not find the applications folder")?
        .join("applications");
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let entry = format!(
        "[Desktop Entry]\n\
         Type=Application\n\
         Name=Tern\n\
         GenericName=Terminal\n\
         Comment=Use the command line\n\
         Keywords=shell;prompt;command;commandline;cmd;console;\n\
         Exec=\"{}\"\n\
         Icon={APP_ID}\n\
         Terminal=false\n\
         Categories=System;TerminalEmulator;\n\
         StartupNotify=true\n\
         StartupWMClass={APP_ID}\n\
         X-TerminalArgExec=-e\n\
         X-TerminalArgDir=--working-directory=\n",
        executable.display()
    );
    fs::write(folder.join(format!("{APP_ID}.desktop")), entry).map_err(|error| error.to_string())
}
