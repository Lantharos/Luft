//! Recovery state tracking and on-screen actions.

use sushi::{SushiVisualState, VisualFlags, VisualMode};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum RecoveryAction {
    #[default]
    TryAgain,
    ViewDetails,
    RecoveryShell,
    Reboot,
}

#[derive(Debug, Default)]
pub struct RecoveryState {
    pub reason: String,
    pub selected: RecoveryAction,
    failure_count: u32,
}

impl RecoveryState {
    pub fn check_failures(&mut self, state: &SushiVisualState) -> bool {
        if state.status_text.to_ascii_lowercase().contains("failed") {
            self.failure_count += 1;
            self.reason = state.status_text.clone();
        }
        self.failure_count >= 5
    }

    pub fn enter(&mut self, reason: impl Into<String>) {
        self.reason = reason.into();
        self.selected = RecoveryAction::TryAgain;
    }

    pub fn select_next(&mut self) {
        self.selected = match self.selected {
            RecoveryAction::TryAgain => RecoveryAction::ViewDetails,
            RecoveryAction::ViewDetails => RecoveryAction::RecoveryShell,
            RecoveryAction::RecoveryShell => RecoveryAction::Reboot,
            RecoveryAction::Reboot => RecoveryAction::TryAgain,
        };
    }

    pub fn status_line(&self) -> String {
        match self.selected {
            RecoveryAction::TryAgain => "Press 1 try again".to_string(),
            RecoveryAction::ViewDetails => "Press 2 view details (F1 log)".to_string(),
            RecoveryAction::RecoveryShell => "Press 3 recovery shell".to_string(),
            RecoveryAction::Reboot => "Press 4 reboot".to_string(),
        }
    }

    pub fn apply_menu_to_state(&self, state: &mut SushiVisualState) {
        state.set_mode(VisualMode::Recovering);
        state.flags |= VisualFlags::RECOVERY;
        state.set_status(format!(
            "{} | > {} <",
            self.reason,
            match self.selected {
                RecoveryAction::TryAgain => "TRY AGAIN",
                RecoveryAction::ViewDetails => "VIEW DETAILS",
                RecoveryAction::RecoveryShell => "RECOVERY SHELL",
                RecoveryAction::Reboot => "REBOOT",
            }
        ));
    }
}