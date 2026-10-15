use windows::Win32::Storage::FileSystem::GetVolumeNameForVolumeMountPointW;
use windows::Win32::System::SystemInformation::GetWindowsDirectoryW;
use windows::core::HSTRING;

pub struct WindowsDrive {
    pub letter: String,
    pub volume: String,
}

pub fn find() -> Result<WindowsDrive, String> {
    let mut directory = [0u16; 260];
    let length = unsafe { GetWindowsDirectoryW(Some(&mut directory)) } as usize;
    let directory = String::from_utf16_lossy(&directory[..length]);
    let letter = directory
        .get(..2)
        .ok_or("Windows' folder wasn't found")?
        .to_owned();
    let mut volume = [0u16; 64];
    unsafe {
        GetVolumeNameForVolumeMountPointW(&HSTRING::from(format!(r"{letter}\")), &mut volume)
    }
    .map_err(|error| format!("Windows' drive wasn't found: {error}"))?;
    let end = volume
        .iter()
        .position(|unit| *unit == 0)
        .unwrap_or(volume.len());
    Ok(WindowsDrive {
        letter,
        volume: String::from_utf16_lossy(&volume[..end]),
    })
}
