# native/drm-buffer: Remove cursor framebuffers instead of closing them

Based on main at b48811767.

## Description

Since framebuffers are closed with `drmModeCloseFB()` instead of removed, the last frame stays on screen when Mutter exits, so the next DRM master can take over without a modeset. Cursor framebuffers were closed the same way, which leaves the pointer of the exited compositor on the cursor plane. It then floats over the last frame, and over whatever the next DRM master shows if that only sets the primary plane, such as a boot splash or a greeter that draws its own cursor.

This adds `META_DRM_BUFFER_FLAG_CURSOR` and removes framebuffers that carry it, which turns the cursor plane off and leaves the primary plane and CRTC as they were. Other framebuffers are still closed.
