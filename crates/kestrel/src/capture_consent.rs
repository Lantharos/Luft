use std::{
    collections::BTreeMap,
    fs::File,
    io::{self, Read},
    time::{Duration, Instant},
};

use luft_ipc::{
    CaptureConsentDecision, CaptureConsentPrompt, CaptureConsentRequest, CaptureConsentStatus,
    CaptureRequestId, OutputSummary,
};

const CONSENT_TIMEOUT: Duration = Duration::from_secs(60);
const RESULT_TTL: Duration = Duration::from_secs(15);
const MAX_PENDING_REQUESTS: usize = 8;
const MAX_APP_ID_BYTES: usize = 512;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum IpcAccess {
    Public,
    Shell,
    Portal,
}

#[derive(Debug)]
struct PendingConsent {
    prompt: CaptureConsentPrompt,
    deadline: Instant,
}

#[derive(Debug)]
struct ConsentResult {
    status: CaptureConsentStatus,
    expires_at: Instant,
}

pub(crate) struct CaptureConsentBroker {
    shell_capability: String,
    portal_capability: String,
    pending: BTreeMap<CaptureRequestId, PendingConsent>,
    results: BTreeMap<CaptureRequestId, ConsentResult>,
}

impl std::fmt::Debug for CaptureConsentBroker {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("CaptureConsentBroker")
            .field("shell_capability", &"[redacted]")
            .field("portal_capability", &"[redacted]")
            .field("pending", &self.pending)
            .field("results", &self.results)
            .finish()
    }
}

impl CaptureConsentBroker {
    pub(crate) fn new() -> io::Result<Self> {
        Ok(Self {
            shell_capability: random_capability()?,
            portal_capability: random_capability()?,
            pending: BTreeMap::new(),
            results: BTreeMap::new(),
        })
    }

    pub(crate) fn shell_capability(&self) -> &str {
        &self.shell_capability
    }

    pub(crate) fn portal_capability(&self) -> &str {
        &self.portal_capability
    }

    pub(crate) fn begin(
        &mut self,
        access: IpcAccess,
        mut request: CaptureConsentRequest,
        outputs: Vec<OutputSummary>,
    ) -> Result<(), String> {
        require_access(access, IpcAccess::Portal)?;
        self.expire();
        if self.pending.len() >= MAX_PENDING_REQUESTS {
            return Err("too many capture consent requests are pending".to_string());
        }
        if self.pending.contains_key(&request.id) || self.results.contains_key(&request.id) {
            return Err("capture consent request already exists".to_string());
        }
        let app_id = request
            .app_id
            .take()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());
        if app_id
            .as_ref()
            .is_some_and(|value| value.len() > MAX_APP_ID_BYTES)
        {
            return Err("capture requester identity is too long".to_string());
        }
        let outputs = outputs
            .into_iter()
            .filter(|output| output.enabled)
            .collect::<Vec<_>>();
        if outputs.is_empty() {
            return Err("there are no enabled outputs to capture".to_string());
        }
        let prompt = CaptureConsentPrompt {
            id: request.id,
            kind: request.kind,
            app_id,
            outputs,
        };
        self.pending.insert(
            request.id,
            PendingConsent {
                prompt,
                deadline: Instant::now() + CONSENT_TIMEOUT,
            },
        );
        Ok(())
    }

    pub(crate) fn poll(
        &mut self,
        access: IpcAccess,
        request: CaptureRequestId,
    ) -> Result<CaptureConsentStatus, String> {
        require_access(access, IpcAccess::Portal)?;
        self.expire();
        if self.pending.contains_key(&request) {
            return Ok(CaptureConsentStatus::Pending);
        }
        self.results
            .get(&request)
            .map(|result| result.status.clone())
            .ok_or_else(|| "unknown capture consent request".to_string())
    }

    pub(crate) fn resolve(
        &mut self,
        access: IpcAccess,
        request: CaptureRequestId,
        decision: CaptureConsentDecision,
    ) -> Result<(), String> {
        require_access(access, IpcAccess::Shell)?;
        self.expire();
        let pending = self
            .pending
            .remove(&request)
            .ok_or_else(|| "capture consent request is no longer pending".to_string())?;
        let status = match decision {
            CaptureConsentDecision::Allow { output } => {
                if !pending
                    .prompt
                    .outputs
                    .iter()
                    .any(|candidate| candidate.enabled && candidate.name == output)
                {
                    self.pending.insert(request, pending);
                    return Err("selected capture output is unavailable".to_string());
                }
                CaptureConsentStatus::Granted { output }
            }
            CaptureConsentDecision::Deny => CaptureConsentStatus::Denied,
        };
        self.store_result(request, status);
        Ok(())
    }

    pub(crate) fn cancel(
        &mut self,
        access: IpcAccess,
        request: CaptureRequestId,
    ) -> Result<(), String> {
        require_access(access, IpcAccess::Portal)?;
        self.pending.remove(&request);
        self.results.remove(&request);
        Ok(())
    }

    pub(crate) fn prompts(&self) -> Vec<CaptureConsentPrompt> {
        self.pending
            .values()
            .map(|pending| pending.prompt.clone())
            .collect()
    }

    pub(crate) fn expire(&mut self) -> bool {
        let now = Instant::now();
        let expired = self
            .pending
            .iter()
            .filter_map(|(id, pending)| (pending.deadline <= now).then_some(*id))
            .collect::<Vec<_>>();
        let changed = !expired.is_empty();
        for id in expired {
            self.pending.remove(&id);
            self.store_result(id, CaptureConsentStatus::TimedOut);
        }
        self.results.retain(|_, result| result.expires_at > now);
        changed
    }

    fn store_result(&mut self, request: CaptureRequestId, status: CaptureConsentStatus) {
        self.results.insert(
            request,
            ConsentResult {
                status,
                expires_at: Instant::now() + RESULT_TTL,
            },
        );
    }
}

fn require_access(actual: IpcAccess, required: IpcAccess) -> Result<(), String> {
    if actual == required {
        Ok(())
    } else {
        Err("capture consent IPC access denied".to_string())
    }
}

fn random_capability() -> io::Result<String> {
    let mut bytes = [0_u8; 32];
    File::open("/dev/urandom")?.read_exact(&mut bytes)?;
    let mut value = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        use std::fmt::Write as _;
        write!(&mut value, "{byte:02x}").expect("writing to a String cannot fail");
    }
    Ok(value)
}
