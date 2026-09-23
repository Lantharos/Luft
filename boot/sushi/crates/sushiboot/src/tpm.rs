//! Best-effort TPM LUKS key unseal in EFI before the kernel starts.
//!
//! PCR-policy unseal is retried in the initramfs with tpm2-tools. EFI stages
//! sealed blobs from `EFI/sushi/tpm/` into firmware variables for early pickup.

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use uefi::boot::{self, SearchType};
use uefi::proto::media::file::{File, FileAttribute, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::proto::tcg::v2::Tcg;
use uefi::runtime::{VariableAttributes, VariableVendor};
use uefi::{cstr16, Handle, Identify};

const TPM_FILES: &[&str] = &[
    "primary.ctx",
    "sealed.pub",
    "sealed.priv",
    "policy.digest",
    "sealed.ctx",
];

pub struct TpmBlobs {
    pub name: String,
    pub files: Vec<(String, Vec<u8>)>,
}

/// Try to unseal a LUKS passphrase in EFI. Returns plaintext key on success.
pub fn try_unseal_luks_key(device: Handle) -> Option<String> {
    if !tcg2_ready() {
        return None;
    }
    let blobs = read_esp_tpm_blobs(device)?;
    stage_blobs_for_initramfs(&blobs);

    let sealed = blobs.files.iter().find(|(n, _)| n == "sealed.ctx").map(|(_, d)| d.as_slice());
    let policy = blobs
        .files
        .iter()
        .find(|(n, _)| n == "policy.digest")
        .map(|(_, d)| d.as_slice());

    let sealed = sealed?;
    let secret = crate::tpm2::try_unseal_sealed_ctx(sealed, policy)?;
    String::from_utf8(secret).ok()
}

pub fn append_tpm_hint(cmdline: &mut String) {
    if tcg2_ready() {
        cmdline.push_str(" sushi.tpm.efi=1");
    }
}

fn tcg2_ready() -> bool {
    boot::locate_handle_buffer(SearchType::ByProtocol(&Tcg::GUID))
        .ok()
        .map(|h| !h.is_empty())
        .unwrap_or(false)
}

fn read_esp_tpm_blobs(device: Handle) -> Option<TpmBlobs> {
    let mut fs = boot::open_protocol_exclusive::<SimpleFileSystem>(device).ok()?;
    let mut root = fs.open_volume().ok()?;
    let mut files = Vec::new();
    for file in TPM_FILES {
        let path = format!("EFI\\sushi\\tpm\\{file}");
        if let Ok(cpath) = uefi::CString16::try_from(path.as_str()) {
            if let Some(data) = read_file(&mut root, &cpath) {
                files.push((file.to_string(), data));
            }
        }
    }
    if files.is_empty() {
        return None;
    }
    Some(TpmBlobs {
        name: String::from("root"),
        files,
    })
}

fn read_file(
    root: &mut uefi::proto::media::file::Directory,
    path: &uefi::CStr16,
) -> Option<Vec<u8>> {
    let file = root.open(path, FileMode::Read, FileAttribute::empty()).ok()?;
    let FileType::Regular(mut regular) = file.into_type().ok()? else {
        return None;
    };
    let info = regular
        .get_boxed_info::<uefi::proto::media::file::FileInfo>()
        .ok()?;
    let mut data = vec![0u8; info.file_size() as usize];
    regular.read(&mut data).ok()?;
    Some(data)
}

fn stage_blobs_for_initramfs(blobs: &TpmBlobs) {
    let vendor = VariableVendor(super::SUSHI_VENDOR_GUID);
    let attrs = VariableAttributes::BOOTSERVICE_ACCESS | VariableAttributes::RUNTIME_ACCESS;

    for (name, data) in &blobs.files {
        let var_name = format!("SushiTpm{name}");
        let Ok(cname) = uefi::CString16::try_from(var_name.as_str()) else {
            continue;
        };
        let _ = uefi::runtime::set_variable(&cname, &vendor, attrs, data);
    }
    let _ = uefi::runtime::set_variable(
        cstr16!("SushiTpmName"),
        &vendor,
        attrs,
        blobs.name.as_bytes(),
    );
}