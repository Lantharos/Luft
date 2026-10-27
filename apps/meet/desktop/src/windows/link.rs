use std::fs::{File, OpenOptions};
use std::os::windows::io::FromRawHandle;

use luft_i18n::t;
use serde::de::DeserializeOwned;
use windows::Win32::Foundation::{CloseHandle, ERROR_CANCELLED, ERROR_PIPE_CONNECTED, HANDLE};
use windows::Win32::Storage::FileSystem::{
    FILE_FLAG_FIRST_PIPE_INSTANCE, PIPE_ACCESS_INBOUND, PIPE_ACCESS_OUTBOUND,
};
use windows::Win32::System::Pipes::{
    ConnectNamedPipe, CreateNamedPipeW, GetNamedPipeClientProcessId, PIPE_READMODE_BYTE,
    PIPE_REJECT_REMOTE_CLIENTS, PIPE_TYPE_BYTE, PIPE_WAIT,
};
use windows::Win32::System::Threading::{
    GetCurrentProcessId, GetProcessId, INFINITE, WaitForSingleObject,
};
use windows::Win32::UI::Shell::{
    SEE_MASK_NOASYNC, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOW, ShellExecuteExW,
};
use windows::Win32::UI::WindowsAndMessaging::SW_HIDE;
use windows::core::{HSTRING, PCWSTR, w};

use super::helper::ARGUMENT;
use crate::L10N;
use crate::app::Events;
use crate::app::calls::{self, Helper};
use crate::app::job::Failed;
use crate::language;
use crate::protocol::Call;

const BUFFER: u32 = 1 << 16;

struct OwnedHandle(HANDLE);

// SAFETY: a process handle can be waited on and closed from any thread.
unsafe impl Send for OwnedHandle {}

impl Drop for OwnedHandle {
    fn drop(&mut self) {
        let _ = unsafe { CloseHandle(self.0) };
    }
}

fn pipe(
    name: &str,
    access: windows::Win32::Storage::FileSystem::FILE_FLAGS_AND_ATTRIBUTES,
) -> Result<HANDLE, String> {
    let handle = unsafe {
        CreateNamedPipeW(
            &HSTRING::from(name),
            access | FILE_FLAG_FIRST_PIPE_INSTANCE,
            PIPE_TYPE_BYTE | PIPE_READMODE_BYTE | PIPE_WAIT | PIPE_REJECT_REMOTE_CLIENTS,
            1,
            BUFFER,
            BUFFER,
            0,
            None,
        )
    };
    if handle.is_invalid() {
        return Err(t!(
            L10N,
            "helper-pipe-failed",
            error = windows::core::Error::from_thread().to_string()
        ));
    }
    Ok(handle)
}

fn launch(name: &str) -> Result<OwnedHandle, Failed> {
    let program = std::env::current_exe().map_err(|error| error.to_string())?;
    let parameters = format!(
        "{} {name} {} {}",
        ARGUMENT,
        unsafe { GetCurrentProcessId() },
        language::shown()
    );
    let program = HSTRING::from(program.as_os_str());
    let parameters = HSTRING::from(parameters);
    let mut info = SHELLEXECUTEINFOW {
        cbSize: std::mem::size_of::<SHELLEXECUTEINFOW>() as u32,
        fMask: SEE_MASK_NOCLOSEPROCESS | SEE_MASK_NOASYNC,
        lpVerb: w!("runas"),
        lpFile: PCWSTR(program.as_ptr()),
        lpParameters: PCWSTR(parameters.as_ptr()),
        nShow: SW_HIDE.0,
        ..Default::default()
    };
    match unsafe { ShellExecuteExW(&mut info) } {
        Ok(()) => Ok(OwnedHandle(info.hProcess)),
        Err(error) if error.code() == ERROR_CANCELLED.to_hresult() => {
            Err(Failed::declined(error.to_string()))
        }
        Err(error) => Err(Failed::from(t!(
            L10N,
            "helper-not-started",
            error = error.to_string()
        ))),
    }
}

fn accept(handle: HANDLE, helper: u32, name: &str) -> Result<File, String> {
    match unsafe { ConnectNamedPipe(handle, None) } {
        Ok(()) => {}
        Err(error) if error.code() == ERROR_PIPE_CONNECTED.to_hresult() => {}
        Err(error) => return Err(error.to_string()),
    }
    let mut client = 0u32;
    unsafe { GetNamedPipeClientProcessId(handle, &mut client) }
        .map_err(|error| error.to_string())?;
    let file = unsafe { File::from_raw_handle(handle.0) };
    if client != helper {
        return Err(t!(L10N, "helper-pipe-hijacked", pipe = name));
    }
    Ok(file)
}

fn unblock_when_gone(process: OwnedHandle, names: [String; 2]) {
    std::thread::spawn(move || {
        let process = process;
        unsafe { WaitForSingleObject(process.0, INFINITE) };
        let [calls, replies] = names;
        let _ = OpenOptions::new().read(true).open(calls);
        let _ = OpenOptions::new().write(true).open(replies);
    });
}

fn start(events: &Events) -> Result<Helper, Failed> {
    let name = format!(
        r"\\.\pipe\com.lantharos.meet-{}-{}",
        unsafe { GetCurrentProcessId() },
        calls::next_number()
    );
    let calls_name = format!("{name}-calls");
    let replies_name = format!("{name}-replies");
    let calls = pipe(&calls_name, PIPE_ACCESS_OUTBOUND)?;
    let replies = pipe(&replies_name, PIPE_ACCESS_INBOUND)?;
    let process = match launch(&name) {
        Ok(process) => process,
        Err(error) => {
            unsafe {
                let _ = CloseHandle(calls);
                let _ = CloseHandle(replies);
            }
            return Err(error);
        }
    };
    let helper_id = unsafe { GetProcessId(process.0) };
    unblock_when_gone(process, [calls_name.clone(), replies_name.clone()]);
    let calls = accept(calls, helper_id, &calls_name)?;
    let replies = accept(replies, helper_id, &replies_name)?;
    Ok(Helper::new(calls, replies, events, || {
        Failed::from(t!(L10N, "helper-stopped"))
    }))
}

pub fn call<T: DeserializeOwned>(events: &Events, call: Call) -> Result<T, Failed> {
    calls::call(events, call, start)
}
