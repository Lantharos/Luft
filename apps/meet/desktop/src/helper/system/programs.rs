use std::path::PathBuf;
use std::process::Command;

use windows::Win32::System::SystemInformation::GetSystemDirectoryW;

pub fn windows(name: &str) -> Command {
    let mut directory = [0u16; 260];
    let length = unsafe { GetSystemDirectoryW(Some(&mut directory)) } as usize;
    let mut program = PathBuf::from(String::from_utf16_lossy(&directory[..length]));
    program.push(format!("{name}.exe"));
    Command::new(program)
}
