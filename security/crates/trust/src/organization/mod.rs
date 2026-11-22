mod file;
mod switch;

use std::path::Path;

use anyhow::{Context, Result};
use luft_variant::Variant;

use crate::disk::unlock::seal;
use crate::keys::{self, mok};
use crate::system::firmware::efi::{self, SecureBoot};
use file::Organization;

pub struct Joined {
    pub image: String,
    pub code: Option<String>,
    pub tpm_linked: bool,
}

/// Switches this computer to an organization's own image, the way `description` says, and
/// asks shim to trust the key the image's startup is signed with.
pub fn join(description: &Path) -> Result<Joined> {
    let organization = Organization::read(description)?;
    let image = Variant::of(&switch::followed()?)
        .reference(&organization.image)
        .context("The organization's image has no tag to follow.")?;
    let trusted_here = keys::certificates().contains(&organization.certificate);
    switch::switch(&organization, &image)?;
    if trusted_here || efi::secure_boot() != SecureBoot::On {
        return Ok(Joined {
            image,
            code: None,
            tpm_linked: false,
        });
    }
    let code = mok::request_for_next_image(&organization.certificate_file)?;
    let tpm_linked =
        seal::link_for_next_image(&organization.certificate, &organization.policy_keys)?;
    Ok(Joined {
        image,
        code: Some(code),
        tpm_linked,
    })
}
