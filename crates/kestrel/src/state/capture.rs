use super::KestrelState;
use smithay::{
    backend::renderer::{ExportMem, Texture, TextureMapping, gles::GlesRenderer},
    reexports::wayland_server::protocol::wl_shm::Format,
    utils::{Clock, Monotonic, Transform},
    wayland::{
        image_copy_capture::{CaptureFailureReason, Frame},
        shm::with_buffer_contents_mut,
    },
};
#[cfg(feature = "session-backend")]
use smithay::{
    backend::{allocator::Fourcc, renderer::ImportDma},
    utils::{Buffer, Rectangle},
};

pub struct CaptureRequest {
    pub output_name: String,
    pub draw_cursor: bool,
    pub frame: Frame,
}

impl KestrelState {
    #[cfg(feature = "session-backend")]
    pub fn has_pending_capture_for_output(&self, output_name: &str) -> bool {
        self.pending_captures
            .iter()
            .any(|request| request.output_name == output_name)
    }

    pub fn has_pending_capture_for_output_mode(
        &self,
        output_name: &str,
        draw_cursor: bool,
    ) -> bool {
        self.pending_captures
            .iter()
            .any(|request| request.output_name == output_name && request.draw_cursor == draw_cursor)
    }

    #[cfg(feature = "session-backend")]
    pub fn fail_captures_for_output(&mut self, output_name: &str) {
        let mut remaining = Vec::new();
        for request in self.pending_captures.drain(..) {
            if request.output_name == output_name {
                request.frame.fail(CaptureFailureReason::Unknown);
            } else {
                remaining.push(request);
            }
        }
        self.pending_captures = remaining;
    }

    #[cfg(feature = "session-backend")]
    pub fn capture_dmabuf(
        &mut self,
        output_name: &str,
        draw_cursor: bool,
        renderer: &mut GlesRenderer,
        dmabuf: &smithay::backend::allocator::dmabuf::Dmabuf,
    ) {
        let mapping = renderer.import_dmabuf(dmabuf, None).and_then(|texture| {
            let size = texture.size();
            renderer.copy_texture(
                &texture,
                Rectangle::<i32, Buffer>::from_size(size),
                Fourcc::Argb8888,
            )
        });
        self.finish_captures(output_name, draw_cursor, renderer, mapping);
    }

    pub fn finish_captures(
        &mut self,
        output_name: &str,
        draw_cursor: bool,
        renderer: &mut GlesRenderer,
        mapping: Result<
            <GlesRenderer as ExportMem>::TextureMapping,
            smithay::backend::renderer::gles::GlesError,
        >,
    ) {
        let mut matching = Vec::new();
        let mut remaining = Vec::new();
        for request in self.pending_captures.drain(..) {
            if request.output_name == output_name && request.draw_cursor == draw_cursor {
                matching.push(request.frame);
            } else {
                remaining.push(request);
            }
        }
        self.pending_captures = remaining;
        if matching.is_empty() {
            return;
        }

        let Ok(mapping) = mapping else {
            fail_frames(matching);
            return;
        };
        let Ok(pixels) = renderer.map_texture(&mapping) else {
            fail_frames(matching);
            return;
        };
        let width = mapping.width() as usize;
        let height = mapping.height() as usize;
        let flipped = mapping.flipped();
        let presented: std::time::Duration = Clock::<Monotonic>::new().now().into();

        for frame in matching {
            let buffer = frame.buffer();
            let copied = with_buffer_contents_mut(&buffer, |ptr, len, data| {
                if !matches!(data.format, Format::Argb8888 | Format::Xrgb8888) {
                    return false;
                }
                let Some((offset, stride)) = usize::try_from(data.offset)
                    .ok()
                    .zip(usize::try_from(data.stride).ok())
                else {
                    return false;
                };
                let row_bytes = width * 4;
                if stride < row_bytes
                    || offset
                        .checked_add(stride.saturating_mul(height))
                        .is_none_or(|end| end > len)
                    || pixels.len() < row_bytes.saturating_mul(height)
                {
                    return false;
                }
                for y in 0..height {
                    let source_y = if flipped { height - 1 - y } else { y };
                    unsafe {
                        std::ptr::copy_nonoverlapping(
                            pixels.as_ptr().add(source_y * row_bytes),
                            ptr.add(offset + y * stride),
                            row_bytes,
                        );
                    }
                }
                true
            })
            .unwrap_or(false);
            if copied {
                frame.success(Transform::Normal, None, presented);
            } else {
                frame.fail(CaptureFailureReason::Unknown);
            }
        }
    }
}

fn fail_frames(frames: Vec<Frame>) {
    for frame in frames {
        frame.fail(CaptureFailureReason::Unknown);
    }
}
