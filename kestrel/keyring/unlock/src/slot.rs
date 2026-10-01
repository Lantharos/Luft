use std::sync::Mutex;

use luft_keyring_wire::{Chip as ChipState, Problem};

use crate::chip::Chip;

pub struct ChipSlot {
    tcti: String,
    chip: Mutex<Option<Chip>>,
}

impl ChipSlot {
    pub fn new(tcti: String) -> Self {
        Self {
            tcti,
            chip: Mutex::new(None),
        }
    }

    pub fn state(&self) -> ChipState {
        match self.with(|_| Ok(())) {
            Err(Problem::NoChip(state)) => state,
            _ => ChipState::Ready,
        }
    }

    pub fn with<T>(
        &self,
        operation: impl FnOnce(&mut Chip) -> Result<T, Problem>,
    ) -> Result<T, Problem> {
        let mut slot = self
            .chip
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        if slot.is_none() {
            *slot = Some(Chip::open(&self.tcti).map_err(Problem::NoChip)?);
        }
        let result = operation(slot.as_mut().expect("the chip was just opened"));
        if matches!(result, Err(Problem::Failed(_))) {
            *slot = None;
        }
        result
    }
}
