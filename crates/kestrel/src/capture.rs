use std::{slice, time::Duration};

use smithay::{
    backend::{
        allocator::Fourcc,
        renderer::{ExportMem, Renderer},
    },
    output::{Output, WeakOutput},
    utils::{Buffer as BufferCoords, Rectangle, Size, Transform},
    wayland::{
        image_copy_capture::{CaptureFailureReason, Frame, SessionRef},
        shm::with_buffer_contents_mut,
    },
};

#[derive(Debug)]
pub struct PendingCapture {
    pub session: SessionRef,
    pub frame: Frame,
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

pub fn copy_framebuffer<R>(
    renderer: &mut R,
    framebuffer: &R::Framebuffer<'_>,
    size: Size<i32, BufferCoords>,
    captures: Vec<PendingCapture>,
    presented: Duration,
) where
    R: Renderer + ExportMem,
{
    if captures.is_empty() {
        return;
    }
    let region = Rectangle::from_size(size);
    let result = renderer
        .copy_framebuffer(framebuffer, region, Fourcc::Argb8888)
        .and_then(|mapping| {
            let pixels = renderer.map_texture(&mapping)?;
            write_frames(pixels, size, captures, presented);
            Ok(())
        });
    if let Err(error) = result {
        tracing::warn!(%error, "failed to read captured output");
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
