use std::{slice, time::Duration};

use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{ExportMem, Renderer},
    },
    output::{Output, WeakOutput},
    utils::{Buffer as BufferCoords, Rectangle, Size, Transform},
    wayland::{
        image_copy_capture::{CaptureFailureReason, Frame, Session, SessionRef},
        shm::with_buffer_contents_mut,
    },
};

#[derive(Debug)]
pub struct PendingCapture {
    pub session: SessionRef,
    pub frame: Frame,
}

pub struct FramebufferCopy<M> {
    mapping: M,
    size: Size<i32, BufferCoords>,
    captures: Vec<PendingCapture>,
    presented: Duration,
}

pub fn take_for_output(queue: &mut Vec<PendingCapture>, output: &Output) -> Vec<PendingCapture> {
    let mut selected = Vec::new();
    let mut remaining = Vec::new();
    for capture in queue.drain(..) {
        let matches = capture
            .session
            .source()
            .user_data()
            .get::<WeakOutput>()
            .and_then(WeakOutput::upgrade)
            .is_some_and(|source| source == *output);
        if matches {
            selected.push(capture);
        } else {
            remaining.push(capture);
        }
    }
    *queue = remaining;
    selected
}

pub fn stop_for_output(
    sessions: &mut Vec<Session>,
    pending: &mut Vec<PendingCapture>,
    output: &Output,
) {
    let mut retained = Vec::with_capacity(sessions.len());
    for session in sessions.drain(..) {
        if session_targets_output(&session, output) {
            session.stop();
        } else {
            retained.push(session);
        }
    }
    *sessions = retained;
    pending.retain(|capture| !session_targets_output(&capture.session, output));
}

fn session_targets_output(session: &SessionRef, output: &Output) -> bool {
    session
        .source()
        .user_data()
        .get::<WeakOutput>()
        .and_then(WeakOutput::upgrade)
        .is_some_and(|source| source == *output)
}

pub fn copy_framebuffer<R>(
    renderer: &mut R,
    framebuffer: &R::Framebuffer<'_>,
    size: Size<i32, BufferCoords>,
    captures: Vec<PendingCapture>,
    presented: Duration,
) -> Option<FramebufferCopy<R::TextureMapping>>
where
    R: Renderer + ExportMem,
{
    if captures.is_empty() {
        return None;
    }
    let region = Rectangle::from_size(size);
    match renderer.copy_framebuffer(framebuffer, region, Fourcc::Argb8888) {
        Ok(mapping) => Some(FramebufferCopy {
            mapping,
            size,
            captures,
            presented,
        }),
        Err(error) => {
            tracing::warn!(%error, "failed to copy captured output");
            fail_frames(captures, CaptureFailureReason::Unknown);
            None
        }
    }
}

pub fn finish_framebuffer_copy<R>(renderer: &mut R, copy: FramebufferCopy<R::TextureMapping>)
where
    R: Renderer + ExportMem,
{
    match renderer.map_texture(&copy.mapping) {
        Ok(pixels) => write_frames(pixels, copy.size, copy.captures, copy.presented),
        Err(error) => {
            tracing::warn!(%error, "failed to map captured output");
            fail_frames(copy.captures, CaptureFailureReason::Unknown);
        }
    }
}

fn fail_frames(captures: Vec<PendingCapture>, reason: CaptureFailureReason) {
    for capture in captures {
        capture.frame.fail(reason);
    }
}

fn write_frames(
    pixels: &[u8],
    size: Size<i32, BufferCoords>,
    captures: Vec<PendingCapture>,
    presented: Duration,
) {
    let width = size.w.max(0) as usize;
    let height = size.h.max(0) as usize;
    let row_bytes = width.saturating_mul(4);
    if pixels.len() < row_bytes.saturating_mul(height) {
        for capture in captures {
            capture.frame.fail(CaptureFailureReason::Unknown);
        }
        return;
    }

    for capture in captures {
        let buffer = capture.frame.buffer();
        let copied = with_buffer_contents_mut(&buffer, |pointer, length, data| {
            let offset = usize::try_from(data.offset).ok()?;
            let stride = usize::try_from(data.stride).ok()?;
            let required = offset.checked_add(stride.checked_mul(height)?)?;
            if data.width != size.w
                || data.height != size.h
                || required > length
                || stride < row_bytes
            {
                return None;
            }
            let target = unsafe { slice::from_raw_parts_mut(pointer.add(offset), length - offset) };
            for row in 0..height {
                let source_start = (height - row - 1) * row_bytes;
                let target_start = row * stride;
                target[target_start..target_start + row_bytes]
                    .copy_from_slice(&pixels[source_start..source_start + row_bytes]);
            }
            Some(())
        })
        .ok()
        .flatten()
        .is_some();

        if copied {
            capture.frame.success(Transform::Normal, None, presented);
        } else {
            capture.frame.fail(CaptureFailureReason::BufferConstraints);
        }
    }
}
