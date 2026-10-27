# native/drm-buffer: Remove cursor framebuffers instead of closing them

Based on main at b48811767.

## Description

Since !3659, framebuffers are closed with `drmModeCloseFB()` instead of removed, so the last frame stays on screen when Mutter exits and the next DRM master can take over without flicker. Cursor framebuffers are closed the same way, which leaves the pointer of the exited compositor on the cursor plane. It floats over the last frame, and over whatever the next DRM master shows if that only sets the primary plane, such as Plymouth's shutdown splash.

To reproduce: on an atomic KMS driver, reboot from a session while the pointer is visible. The pointer stays on screen over Plymouth's shutdown splash.

This adds `META_DRM_BUFFER_FLAG_CURSOR` and removes framebuffers that carry it, which turns the cursor plane off and leaves the primary plane and the CRTC as they were. Cursor buffers are kept alive while they're on screen, so during normal use only buffers that are no longer shown are removed, as before !3659. Other framebuffers are still closed.
