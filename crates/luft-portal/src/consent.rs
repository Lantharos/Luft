use std::{
    io,
    os::unix::net::UnixStream,
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicU64, Ordering},
    },
    thread,
    time::{Duration, Instant},
};

use luft_ipc::{
    CaptureConsentRequest, CaptureConsentStatus, CaptureKind, CaptureRequestId, ClientMessage,
    IpcRequest, IpcResponse, PORTAL_CAPABILITY_ENV, ServerMessage, read_frame, socket_path,
    write_frame,
};

const IPC_TIMEOUT: Duration = Duration::from_secs(2);
const CONSENT_TIMEOUT: Duration = Duration::from_secs(62);
const POLL_INTERVAL: Duration = Duration::from_millis(100);
static NEXT_REQUEST: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConsentOutcome {
    Granted(String),
    Denied,
    Cancelled,
    TimedOut,
}

pub struct RequestCancellation {
    cancelled: Arc<AtomicBool>,
    armed: bool,
}

impl RequestCancellation {
    pub fn new() -> Self {
        Self::from_flag(Arc::new(AtomicBool::new(false)))
    }

    pub fn from_flag(cancelled: Arc<AtomicBool>) -> Self {
        Self {
            cancelled,
            armed: true,
        }
    }

    pub fn flag(&self) -> Arc<AtomicBool> {
        Arc::clone(&self.cancelled)
    }

    pub fn disarm(&mut self) {
        self.armed = false;
    }
}

impl Drop for RequestCancellation {
    fn drop(&mut self) {
        if self.armed {
            self.cancelled.store(true, Ordering::Release);
        }
    }
}

pub fn request_consent(
    kind: CaptureKind,
    app_id: Option<String>,
    cancelled: &Arc<AtomicBool>,
) -> io::Result<ConsentOutcome> {
    let capability = std::env::var(PORTAL_CAPABILITY_ENV)
        .map_err(|_| io::Error::other(format!("missing {PORTAL_CAPABILITY_ENV}")))?;
    let mut stream = UnixStream::connect(socket_path())?;
    stream.set_read_timeout(Some(IPC_TIMEOUT))?;
    stream.set_write_timeout(Some(IPC_TIMEOUT))?;
    write_frame(&mut stream, &ClientMessage::Authenticate { capability })?;

    let request_id = CaptureRequestId(
        (u64::from(std::process::id()) << 32)
            | NEXT_REQUEST.fetch_add(1, Ordering::Relaxed) & u64::from(u32::MAX),
    );
    let mut message_id = 1_u64;
    let response = exchange(
        &mut stream,
        message_id,
        IpcRequest::BeginCaptureConsent {
            request: CaptureConsentRequest {
                id: request_id,
                kind,
                app_id,
            },
        },
    )?;
    require_accepted(response)?;

    let deadline = Instant::now() + CONSENT_TIMEOUT;
    loop {
        if cancelled.load(Ordering::Acquire) {
            message_id = message_id.saturating_add(1);
            let _ = exchange(
                &mut stream,
                message_id,
                IpcRequest::CancelCaptureConsent {
                    request: request_id,
                },
            );
            return Ok(ConsentOutcome::Cancelled);
        }
        if Instant::now() >= deadline {
            message_id = message_id.saturating_add(1);
            let _ = exchange(
                &mut stream,
                message_id,
                IpcRequest::CancelCaptureConsent {
                    request: request_id,
                },
            );
            return Ok(ConsentOutcome::TimedOut);
        }

        message_id = message_id.saturating_add(1);
        match exchange(
            &mut stream,
            message_id,
            IpcRequest::PollCaptureConsent {
                request: request_id,
            },
        )? {
            IpcResponse::CaptureConsent {
                status: CaptureConsentStatus::Pending,
            } => thread::sleep(POLL_INTERVAL),
            IpcResponse::CaptureConsent {
                status: CaptureConsentStatus::Granted { output },
            } => return Ok(ConsentOutcome::Granted(output)),
            IpcResponse::CaptureConsent {
                status: CaptureConsentStatus::Denied,
            } => return Ok(ConsentOutcome::Denied),
            IpcResponse::CaptureConsent {
                status: CaptureConsentStatus::TimedOut,
            } => return Ok(ConsentOutcome::TimedOut),
            IpcResponse::Error { message } => return Err(io::Error::other(message)),
            response => {
                return Err(io::Error::new(
                    io::ErrorKind::InvalidData,
                    format!("unexpected capture consent response: {response:?}"),
                ));
            }
        }
    }
}

fn exchange(stream: &mut UnixStream, id: u64, request: IpcRequest) -> io::Result<IpcResponse> {
    write_frame(stream, &ClientMessage::Request { id, request })?;
    loop {
        match read_frame(stream)? {
            ServerMessage::Response {
                id: response_id,
                response,
            } if response_id == id => return Ok(response),
            ServerMessage::Response { .. }
            | ServerMessage::ShellUpdate(_)
            | ServerMessage::ShellCommand(_) => {}
        }
    }
}

fn require_accepted(response: IpcResponse) -> io::Result<()> {
    match response {
        IpcResponse::Accepted { .. } => Ok(()),
        IpcResponse::Error { message } => Err(io::Error::other(message)),
        response => Err(io::Error::new(
            io::ErrorKind::InvalidData,
            format!("unexpected capture consent response: {response:?}"),
        )),
    }
}
