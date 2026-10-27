# Upstream pull requests

Drafts for [bootc-dev/bootc](https://github.com/bootc-dev/bootc), not submitted yet. Both are against main at e1860b4 (1.17.2), so they differ slightly from `image-version.patch` and `follow-same-root.patch`, which are against 1.17.1. The second builds on the first.

## Boot entry version

### Title

composefs: Give a UKI's boot entry the image's version

### Description

For a sealed image, the Type #1 entry bootc writes takes its `version` from the UKI's os-release. A distribution that promotes a tested build to a release by publishing the same image again with a new `org.opencontainers.image.version` annotation can't change what the boot menu shows without building the UKI again, which means new layers and a new signature for content that hasn't changed.

This uses the manifest's `org.opencontainers.image.version`, the version `bootc status` already shows, for the entry when the image has one, and the UKI's os-release otherwise. Images without the annotation get the same entries as before.

### Patch

```diff
From 0000000000000000000000000000000000000000 Mon Sep 17 00:00:00 2001
From: Kristof Imeri <imeri@lanth.me>
Date: Tue, 27 Oct 2026 19:38:34 +0100
Subject: [PATCH 1/2] composefs: Give a UKI's boot entry the image's version

The Type #1 entry written for a UKI took its version from the UKI's
os-release, so an image could only show its version in the boot menu
by carrying it inside the image. Renaming an image, as promoting a
tested build to a release does by changing only its version
annotation, then can't change what the boot menu shows without
building new layers.

Use the image's org.opencontainers.image.version annotation, the
version bootc status shows, when the image has one, and the UKI's
os-release otherwise.
---
 crates/lib/src/bootc_composefs/boot.rs   | 21 ++++++++++++++++++++-
 crates/lib/src/bootc_composefs/update.rs |  3 ++-
 2 files changed, 22 insertions(+), 2 deletions(-)

diff --git a/crates/lib/src/bootc_composefs/boot.rs b/crates/lib/src/bootc_composefs/boot.rs
index 155bd6dc..9b5dc308 100644
--- a/crates/lib/src/bootc_composefs/boot.rs
+++ b/crates/lib/src/bootc_composefs/boot.rs
@@ -1810,6 +1810,22 @@ fn write_systemd_uki_config(
     Ok(())
 }
 
+/// The version `bootc status` shows for an image: its manifest's
+/// `org.opencontainers.image.version` annotation.
+pub(crate) fn image_version(
+    repo: &crate::store::ComposefsRepository,
+    manifest_digest: &str,
+) -> Option<String> {
+    let digest: composefs_oci::OciDigest = manifest_digest.parse().ok()?;
+    composefs_oci::OciImage::<Sha512HashValue>::open(repo, &digest, None)
+        .ok()?
+        .manifest()
+        .annotations()
+        .as_ref()?
+        .get(ostree_ext::oci_spec::image::ANNOTATION_VERSION)
+        .cloned()
+}
+
 #[context("Setting up UKI boot")]
 pub(crate) fn setup_composefs_uki_boot(
     setup_type: BootSetupType,
@@ -1817,6 +1833,7 @@ pub(crate) fn setup_composefs_uki_boot(
     id: &Sha512HashValue,
     boot_ids: &ExpectedBootImageIds,
     entries: Vec<ComposefsBootEntry<Sha512HashValue>>,
+    version: Option<String>,
 ) -> Result<(String, Sha512HashValue)> {
     let (esp_device, bootloader, missing_fsverity_allowed, uki_addons) = match setup_type {
         BootSetupType::Setup((root_setup, state, postfetch, allow_missing_fsverity)) => {
@@ -1911,8 +1928,9 @@ pub(crate) fn setup_composefs_uki_boot(
         };
     }
 
-    let uki_info =
+    let mut uki_info =
         uki_info.ok_or_else(|| anyhow::anyhow!("Failed to get version and boot label from UKI"))?;
+    uki_info.version = version.or(uki_info.version);
 
     let UKIInfo {
         boot_label,
@@ -2638,6 +2656,7 @@ pub(crate) async fn setup_composefs_boot(
                 &provisional_deploy_id,
                 &boot_ids,
                 entries,
+                image_version(&repo, &pull_result.manifest_digest.to_string()),
             ),
             &repo,
             &fs,
diff --git a/crates/lib/src/bootc_composefs/update.rs b/crates/lib/src/bootc_composefs/update.rs
index 8e42186b..038b744a 100644
--- a/crates/lib/src/bootc_composefs/update.rs
+++ b/crates/lib/src/bootc_composefs/update.rs
@@ -21,7 +21,7 @@ use crate::{
     bootc_composefs::{
         aboot,
         boot::{
-            BootSetupType, BootType, prepare_composefs_aboot_artifacts,
+            BootSetupType, BootType, image_version, prepare_composefs_aboot_artifacts,
             print_uki_dumpfile_diff_on_mismatch, setup_composefs_bls_boot,
             setup_composefs_uki_boot,
         },
@@ -421,6 +421,7 @@ pub(crate) async fn do_upgrade(
                 &provisional_deploy_id,
                 &boot_ids,
                 entries,
+                image_version(&repo, &manifest_digest),
             ),
             &repo,
             &oci_fs,
-- 
2.56.0

```

## Switching to the booted root under another reference

### Title

composefs: Let the booted deployment follow an image with its root

### Description

`bootc switch` to an image whose root filesystem is the booted one fails with "Target image has the same fs-verity digest as the existing Some(Booted) deployment", and so does `bootc upgrade` when the followed reference starts pointing at such an image. That happens whenever a build is published under a second reference, as when a tested nightly is promoted to the release tag: a machine on that nightly can't move to the release channel until the next release, and keeps following the nightly tag.

When the target's root is the booted deployment's, this pulls the target, which only adds its manifest and config to the repository, and points the booted deployment's origin at the new reference and manifest instead of deploying the same root again. `bootc status` then shows the new image and its version. A collision with the staged or rollback deployment is still an error, as before, since their `/etc` came from another image.

I left out the rollback case on purpose: switching to the rollback deployment's root could reasonably mean `bootc rollback`, but that changes which deployment boots, which seems like a decision for the caller.

### Patch

```diff
From 0000000000000000000000000000000000000000 Mon Sep 17 00:00:00 2001
From: Kristof Imeri <kristof@lanth.me>
Date: Tue, 27 Oct 2026 21:06:15 +0100
Subject: [PATCH 2/2] composefs: Let the booted deployment follow an image with
 its root

Publishing the same root filesystem under another reference, as promoting
a tested build to a release does, gives an image with the booted
deployment's fs-verity digest. bootc switch refused it, so a system could
not move to the release channel until a later build there, and an upgrade
to such an image failed the same way.

Pull the target, which only adds its manifest and config, and point the
booted deployment's origin at it instead of deploying the same root again.
A collision with the staged or rollback deployment is still an error.
---
 crates/lib/src/bootc_composefs/state.rs  | 22 ++++++++++++++++++++++
 crates/lib/src/bootc_composefs/switch.rs |  2 +-
 crates/lib/src/bootc_composefs/update.rs | 24 ++++++++++++++++++++----
 3 files changed, 43 insertions(+), 5 deletions(-)

diff --git a/crates/lib/src/bootc_composefs/state.rs b/crates/lib/src/bootc_composefs/state.rs
index 57055a3d..cd44f1fc 100644
--- a/crates/lib/src/bootc_composefs/state.rs
+++ b/crates/lib/src/bootc_composefs/state.rs
@@ -212,6 +212,28 @@ fn add_update_in_origin(
     Ok(())
 }
 
+/// Points the deployment's origin at `imgref`, whose manifest is `manifest_digest`
+pub(crate) fn update_image_in_origin(
+    storage: &Storage,
+    deployment_id: &str,
+    imgref: &ImageReference,
+    manifest_digest: &str,
+) -> Result<()> {
+    let imgref = imgref.to_image_proxy_ref()?;
+    add_update_in_origin(
+        storage,
+        deployment_id,
+        "origin",
+        &[(ORIGIN_CONTAINER, &format!("ostree-unverified-image:{imgref}"))],
+    )?;
+    add_update_in_origin(
+        storage,
+        deployment_id,
+        ORIGIN_KEY_IMAGE,
+        &[(ORIGIN_KEY_MANIFEST_DIGEST, manifest_digest)],
+    )
+}
+
 pub(crate) fn update_boot_digest_in_origin(
     storage: &Storage,
     digest: &str,
diff --git a/crates/lib/src/bootc_composefs/switch.rs b/crates/lib/src/bootc_composefs/switch.rs
index 3a580a62..3e2656ef 100644
--- a/crates/lib/src/bootc_composefs/switch.rs
+++ b/crates/lib/src/bootc_composefs/switch.rs
@@ -132,7 +132,7 @@ pub(crate) async fn switch_composefs(
                 return Ok(());
             }
 
-            UpdateAction::Proceed => {
+            UpdateAction::Proceed | UpdateAction::Retarget => {
                 return do_upgrade(
                     storage,
                     booted_cfs,
diff --git a/crates/lib/src/bootc_composefs/update.rs b/crates/lib/src/bootc_composefs/update.rs
index 038b744a..471b4170 100644
--- a/crates/lib/src/bootc_composefs/update.rs
+++ b/crates/lib/src/bootc_composefs/update.rs
@@ -29,7 +29,7 @@ use crate::{
         repo::pull_composefs_repo,
         service::start_finalize_stated_svc,
         soft_reboot::prepare_soft_reboot_composefs,
-        state::{write_composefs_state, write_staged_deployment},
+        state::{update_image_in_origin, write_composefs_state, write_staged_deployment},
         status::{
             ImgConfigManifest, StagedDeployment, get_bootloader, get_composefs_status,
             get_container_manifest_and_config, get_imginfo,
@@ -126,6 +126,9 @@ pub(crate) enum UpdateAction {
     Skip,
     /// Proceed with the update
     Proceed,
+    /// Follow the target image from the booted deployment, which already has
+    /// the same root filesystem
+    Retarget,
 }
 
 /// Determines what action should be taken for the update
@@ -164,6 +167,7 @@ pub(crate) enum UpdateAction {
 /// # Returns
 /// * UpdateAction::Skip    - Skip the update/switch as we have it as a deployment
 /// * UpdateAction::Proceed - Proceed with the update
+/// * UpdateAction::Retarget - Switch to an image whose root filesystem is the booted one
 pub(crate) fn validate_update(
     storage: &Storage,
     booted_cfs: &BootedComposefs,
@@ -199,6 +203,11 @@ pub(crate) fn validate_update(
     });
 
     if let Some(collision) = found_depl {
+        if is_switch && matches!(collision.ty, Some(crate::status::Slot::Booted)) {
+            // The target is the booted root filesystem published under another
+            // reference; do_upgrade makes the booted deployment follow it.
+            return Ok(UpdateAction::Retarget);
+        }
         if is_switch {
             // For `bootc switch`, any digest collision is an error: two images
             // from different sources can produce identical composefs roots and we
@@ -356,14 +365,21 @@ pub(crate) async fn do_upgrade(
     }
 
     // If the target image produces the same fs-verity digest as any existing
-    // deployment (booted, staged, rollback, or pinned), error out.  Two images
+    // deployment (staged, rollback, or pinned), error out.  Two images
     // from different sources can have identical content; we cannot silently reuse
     // an existing state directory whose /etc was seeded from a different image.
+    // The booted deployment instead follows the target from now on, as when a
+    // tested build is published again as a release.
     let all_deployments = host.all_composefs_deployments()?;
     if let Some(collision) = all_deployments
         .iter()
         .find(|d| d.deployment.verity == id.to_hex())
     {
+        if matches!(collision.ty, Some(crate::status::Slot::Booted)) {
+            update_image_in_origin(storage, &id.to_hex(), imgref, &manifest_digest)?;
+            println!("The booted deployment now follows {imgref:#}");
+            return Ok(());
+        }
         anyhow::bail!(
             "Target image has the same fs-verity digest as the existing {:?} deployment.",
             collision.ty,
@@ -675,7 +691,7 @@ pub(crate) async fn upgrade_composefs(
             )?;
 
             match action {
-                UpdateAction::Skip => {
+                UpdateAction::Skip | UpdateAction::Retarget => {
                     println!("No changes in staged image: {booted_imgref:#}");
                     return Ok(());
                 }
@@ -707,7 +723,7 @@ pub(crate) async fn upgrade_composefs(
         )?;
 
         match action {
-            UpdateAction::Skip => {
+            UpdateAction::Skip | UpdateAction::Retarget => {
                 println!("No changes in: {booted_imgref:#}");
                 return Ok(());
             }
-- 
2.56.0

```
