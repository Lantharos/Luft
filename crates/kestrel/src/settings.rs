use crate::state::{Backend, KestrelState};
use luft_config::{DisplayConfig, LuftConfig, load_config, save_config};
use luft_ipc::{IpcResponse, SettingsConfirmation};
use std::time::{Duration, Instant};

#[derive(Debug)]
pub(crate) struct PendingSettings {
    id: u64,
    original: LuftConfig,
    candidate: LuftConfig,
    previous_outputs: DisplayConfig,
    pub deadline: Instant,
}

impl<B: Backend> KestrelState<B> {
    pub(crate) fn settings_state(&self) -> Result<IpcResponse, String> {
        let (config, confirmation) = if let Some(pending) = &self.pending_settings {
            (
                pending.candidate.clone(),
                Some(SettingsConfirmation {
                    id: pending.id,
                    remaining_ms: pending
                        .deadline
                        .saturating_duration_since(Instant::now())
                        .as_millis() as u64,
                }),
            )
        } else {
            (
                load_config().map_err(|error| error.to_string())?.config,
                None,
            )
        };
        Ok(IpcResponse::Settings {
            config: Box::new(config),
            confirmation,
        })
    }

    pub(crate) fn apply_settings(
        &mut self,
        original: LuftConfig,
        config: LuftConfig,
    ) -> Result<IpcResponse, String> {
        if self.session_lock.is_active() {
            return Err("Unlock the session before applying settings".into());
        }
        if self.pending_settings.is_some() {
            return Err("Confirm or revert the pending display changes first".into());
        }
        config.validate().map_err(|error| error.to_string())?;
        let current = load_config().map_err(|error| error.to_string())?.config;
        if current != original {
            return Err("Settings changed elsewhere. Reload before saving your changes.".into());
        }
        let previous_outputs = B::output_configuration(self);
        if let Err(error) = self.apply_config(&config) {
            return Err(self
                .restore_config(&original, &previous_outputs)
                .err()
                .map_or(error.clone(), |rollback| {
                    format!("{error}; restoration failed: {rollback}")
                }));
        }
        if original.display != config.display {
            self.next_settings_id += 1;
            self.pending_settings = Some(PendingSettings {
                id: self.next_settings_id,
                original,
                candidate: config,
                previous_outputs,
                deadline: Instant::now() + Duration::from_secs(15),
            });
        } else if let Err(error) = save_config(&config) {
            let rollback = self.restore_config(&original, &previous_outputs);
            return Err(match rollback {
                Ok(()) => error.to_string(),
                Err(rollback) => format!("{error}; restoration failed: {rollback}"),
            });
        }
        self.settings_state()
    }

    pub(crate) fn confirm_settings(&mut self, id: u64) -> Result<IpcResponse, String> {
        let pending = self
            .pending_settings
            .as_ref()
            .filter(|pending| pending.id == id)
            .ok_or("These display changes are no longer pending")?;
        if Instant::now() >= pending.deadline {
            self.revert_settings(id)?;
            return Err("Display confirmation expired; the previous settings were restored".into());
        }
        if load_config().map_err(|error| error.to_string())?.config != pending.original {
            self.revert_settings(id)?;
            return Err("Settings changed elsewhere; the display changes were reverted".into());
        }
        save_config(&pending.candidate).map_err(|error| error.to_string())?;
        self.pending_settings = None;
        self.settings_state()
    }

    pub(crate) fn revert_settings(&mut self, id: u64) -> Result<(), String> {
        if self
            .pending_settings
            .as_ref()
            .is_none_or(|pending| pending.id != id)
        {
            return Err("These display changes are no longer pending".into());
        }
        let mut pending = self.pending_settings.take().unwrap();
        if let Err(error) = self.restore_config(&pending.original, &pending.previous_outputs) {
            pending.deadline = Instant::now() + Duration::from_secs(2);
            self.pending_settings = Some(pending);
            return Err(error);
        }
        Ok(())
    }

    fn restore_config(
        &mut self,
        original: &LuftConfig,
        outputs: &DisplayConfig,
    ) -> Result<(), String> {
        let mut restored = original.clone();
        restored.display = outputs.clone();
        self.apply_config(&restored)?;
        self.display_config = original.display.clone();
        Ok(())
    }

    pub(crate) fn expire_settings(&mut self) {
        if let Some(id) = self
            .pending_settings
            .as_ref()
            .filter(|pending| Instant::now() >= pending.deadline)
            .map(|pending| pending.id)
            && let Err(error) = self.revert_settings(id)
        {
            tracing::error!(%error, "could not restore expired display changes");
        }
    }
}
