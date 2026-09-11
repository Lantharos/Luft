use std::process::Child;
use tracing::warn;

pub(crate) struct LaunchedProcess {
    pub(super) command: String,
    pub(super) child: Child,
}

impl LaunchedProcess {
    pub(super) fn new(command: String, child: Child) -> Self {
        Self { command, child }
    }

    pub(super) fn is_running_or_report_exit(&mut self) -> bool {
        match self.child.try_wait() {
            Ok(Some(status)) => {
                if !status.success() {
                    warn!(
                        command = %self.command,
                        %status,
                        "launched app exited"
                    );
                }
                false
            }
            Ok(None) => true,
            Err(error) => {
                warn!(command = %self.command, %error, "failed to poll launched app");
                true
            }
        }
    }
}
