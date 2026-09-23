//! Minimal TPM 2.0 command marshaller for PCR-policy unseal in UEFI.

mod marshal;
mod unseal;

pub use unseal::try_unseal_sealed_ctx;