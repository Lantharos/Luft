use windows::Win32::Foundation::{CloseHandle, HANDLE, LUID};
use windows::Win32::Security::{
    AdjustTokenPrivileges, LookupPrivilegeValueW, SE_PRIVILEGE_ENABLED, TOKEN_ADJUST_PRIVILEGES,
    TOKEN_PRIVILEGES, TOKEN_QUERY,
};
use windows::Win32::System::Threading::{GetCurrentProcess, OpenProcessToken};
use windows::core::PCWSTR;

pub fn enable(privilege: PCWSTR) -> Result<(), String> {
    unsafe {
        let mut token = HANDLE::default();
        OpenProcessToken(
            GetCurrentProcess(),
            TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY,
            &mut token,
        )
        .map_err(|error| error.to_string())?;
        let mut luid = LUID::default();
        let adjusted = LookupPrivilegeValueW(None, privilege, &mut luid).and_then(|()| {
            let mut privileges = TOKEN_PRIVILEGES {
                PrivilegeCount: 1,
                ..Default::default()
            };
            privileges.Privileges[0].Luid = luid;
            privileges.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;
            AdjustTokenPrivileges(token, false, Some(&privileges), 0, None, None)
        });
        let _ = CloseHandle(token);
        adjusted.map_err(|error| error.to_string())
    }
}
