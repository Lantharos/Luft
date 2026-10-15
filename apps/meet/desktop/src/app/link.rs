use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::os::windows::io::FromRawHandle;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{Sender, channel};
use std::sync::{Arc, Mutex};

use serde_json::Value;
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

use super::job::Failed;
use super::{Events, PROGRESS};
use crate::protocol::{Call, Reply, Request};

const BUFFER: u32 = 1 << 16;

type Waiting = Arc<Mutex<HashMap<u64, Sender<Result<Value, String>>>>>;

struct Helper {
    calls: File,
    waiting: Waiting,
}

static HELPER: Mutex<Option<Helper>> = Mutex::new(None);
static NEXT: AtomicU64 = AtomicU64::new(1);

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
        return Err(format!(
            "Meet Luft couldn't talk to its helper: {}",
            windows::core::Error::from_thread()
        ));
    }
    Ok(handle)
}

fn launch(name: &str) -> Result<OwnedHandle, Failed> {
    let program = std::env::current_exe().map_err(|error| error.to_string())?;
    let parameters = format!("{} {name} {}", crate::helper::ARGUMENT, unsafe {
        GetCurrentProcessId()
    });
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
        Err(error) => Err(Failed::from(format!(
            "Meet Luft's helper didn't start: {error}"
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
        return Err(format!(
            "Something other than Meet Luft's helper opened {name}"
        ));
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

fn read_replies(replies: File, waiting: Waiting, events: Events) {
    std::thread::spawn(move || {
        for line in BufReader::new(replies).lines() {
            let Ok(line) = line else { break };
            match serde_json::from_str::<Reply>(&line) {
                Ok(Reply::Progress(progress)) => events.emit(PROGRESS, progress),
                Ok(Reply::Done { id, value }) => answer(&waiting, id, Ok(value)),
                Ok(Reply::Failed { id, error }) => answer(&waiting, id, Err(error)),
                Err(_) => {}
            }
        }
        *HELPER.lock().expect("helper lock") = None;
        for (_, waiter) in waiting.lock().expect("waiting lock").drain() {
            let _ = waiter.send(Err("Meet Luft's helper stopped".to_owned()));
        }
    });
}

fn answer(waiting: &Waiting, id: u64, result: Result<Value, String>) {
    if let Some(waiter) = waiting.lock().expect("waiting lock").remove(&id) {
        let _ = waiter.send(result);
    }
}

fn start(events: &Events) -> Result<Helper, Failed> {
    let name = format!(
        r"\\.\pipe\com.lantharos.meet-{}-{}",
        unsafe { GetCurrentProcessId() },
        NEXT.fetch_add(1, Ordering::Relaxed)
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
    let waiting = Waiting::default();
    read_replies(replies, waiting.clone(), events.clone());
    Ok(Helper { calls, waiting })
}

pub fn call(events: &Events, call: Call) -> Result<Value, Failed> {
    let id = NEXT.fetch_add(1, Ordering::Relaxed);
    let (sender, receiver) = channel();
    {
        let mut helper = HELPER.lock().expect("helper lock");
        if helper.is_none() {
            *helper = Some(start(events)?);
        }
        let helper = helper.as_mut().expect("helper just started");
        helper
            .waiting
            .lock()
            .expect("waiting lock")
            .insert(id, sender);
        let mut line =
            serde_json::to_vec(&Request { id, call }).map_err(|error| error.to_string())?;
        line.push(b'\n');
        helper
            .calls
            .write_all(&line)
            .map_err(|error| format!("Meet Luft's helper stopped: {error}"))?;
    }
    receiver
        .recv()
        .map_err(|_| "Meet Luft's helper stopped".to_owned())?
        .map_err(Failed::from)
}
