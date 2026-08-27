use luft_config::OutputTransform;
use smithay::reexports::wayland_server::protocol::wl_output;

pub(super) fn transform_from_wl(transform: wl_output::Transform) -> Option<OutputTransform> {
    Some(match transform {
        wl_output::Transform::Normal => OutputTransform::Normal,
        wl_output::Transform::_90 => OutputTransform::Rotate90,
        wl_output::Transform::_180 => OutputTransform::Rotate180,
        wl_output::Transform::_270 => OutputTransform::Rotate270,
        wl_output::Transform::Flipped => OutputTransform::Flipped,
        wl_output::Transform::Flipped90 => OutputTransform::Flipped90,
        wl_output::Transform::Flipped180 => OutputTransform::Flipped180,
        wl_output::Transform::Flipped270 => OutputTransform::Flipped270,
        _ => return None,
    })
}
