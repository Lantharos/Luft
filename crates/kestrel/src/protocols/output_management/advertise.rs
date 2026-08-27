use super::*;
use crate::output::OutputModeDescriptor;
use smithay::{
    reexports::wayland_server::{Client, Dispatch, DisplayHandle, Resource, protocol::wl_output},
    utils::Transform,
};

pub(super) fn advertise_outputs<D>(
    display: &DisplayHandle,
    client: &Client,
    manager: &ZwlrOutputManagerV1,
    outputs: &[OutputSnapshot],
) -> BTreeMap<String, AdvertisedHead>
where
    D: Dispatch<ZwlrOutputHeadV1, HeadData> + Dispatch<ZwlrOutputModeV1, ModeData> + 'static,
{
    outputs
        .iter()
        .filter_map(|output| {
            Some((
                output.descriptor.name.clone(),
                create_head::<D>(display, client, manager, output)?,
            ))
        })
        .collect()
}

pub(super) fn create_head<D>(
    display: &DisplayHandle,
    client: &Client,
    manager: &ZwlrOutputManagerV1,
    output: &OutputSnapshot,
) -> Option<AdvertisedHead>
where
    D: Dispatch<ZwlrOutputHeadV1, HeadData> + Dispatch<ZwlrOutputModeV1, ModeData> + 'static,
{
    let head = client
        .create_resource::<ZwlrOutputHeadV1, _, D>(
            display,
            manager.version(),
            HeadData {
                name: output.descriptor.name.clone(),
            },
        )
        .ok()?;
    manager.head(&head);
    head.name(output.descriptor.name.clone());
    head.description(format!(
        "{} {}",
        output.descriptor.make, output.descriptor.model
    ));
    if output.descriptor.physical_size.w > 0 && output.descriptor.physical_size.h > 0 {
        head.physical_size(
            output.descriptor.physical_size.w,
            output.descriptor.physical_size.h,
        );
    }
    if head.version() >= 2 {
        head.make(output.descriptor.make.clone());
        head.model(output.descriptor.model.clone());
        head.serial_number(String::new());
    }
    let modes = create_modes::<D>(display, client, manager, &head, output);
    send_head_state(&head, &modes, output);
    Some(AdvertisedHead {
        _resource: head,
        _modes: modes,
    })
}

pub(super) fn create_modes<D>(
    display: &DisplayHandle,
    client: &Client,
    manager: &ZwlrOutputManagerV1,
    head: &ZwlrOutputHeadV1,
    output: &OutputSnapshot,
) -> Vec<(OutputModeDescriptor, ZwlrOutputModeV1)>
where
    D: Dispatch<ZwlrOutputModeV1, ModeData> + 'static,
{
    output
        .descriptor
        .modes
        .iter()
        .filter_map(|mode| {
            let resource = client
                .create_resource::<ZwlrOutputModeV1, _, D>(
                    display,
                    manager.version().min(3),
                    ModeData {
                        head_name: output.descriptor.name.clone(),
                        mode: *mode,
                    },
                )
                .ok()?;
            head.mode(&resource);
            resource.size(mode.size.w, mode.size.h);
            resource.refresh(mode.refresh_millihertz);
            if mode.preferred {
                resource.preferred();
            }
            Some((*mode, resource))
        })
        .collect()
}

pub(super) fn send_head_state(
    head: &ZwlrOutputHeadV1,
    modes: &[(OutputModeDescriptor, ZwlrOutputModeV1)],
    output: &OutputSnapshot,
) {
    head.enabled(i32::from(output.enabled));
    if output.enabled {
        if let Some((_, current)) = modes.iter().find(|(mode, _)| {
            mode.size == output.descriptor.size
                && mode.refresh_millihertz == output.descriptor.refresh_millihertz
        }) {
            head.current_mode(current);
        }
        head.position(output.x, output.y);
        head.transform(transform_to_wl(output.descriptor.transform));
        head.scale(output.descriptor.scale);
    }
    if head.version() >= 4 {
        head.adaptive_sync(if output.adaptive_sync {
            zwlr_output_head_v1::AdaptiveSyncState::Enabled
        } else {
            zwlr_output_head_v1::AdaptiveSyncState::Disabled
        });
    }
}

fn transform_to_wl(transform: Transform) -> wl_output::Transform {
    match transform {
        Transform::Normal => wl_output::Transform::Normal,
        Transform::_90 => wl_output::Transform::_90,
        Transform::_180 => wl_output::Transform::_180,
        Transform::_270 => wl_output::Transform::_270,
        Transform::Flipped => wl_output::Transform::Flipped,
        Transform::Flipped90 => wl_output::Transform::Flipped90,
        Transform::Flipped180 => wl_output::Transform::Flipped180,
        Transform::Flipped270 => wl_output::Transform::Flipped270,
    }
}
