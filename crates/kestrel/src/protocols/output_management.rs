use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Mutex,
};

use luft_config::OutputTransform;
#[cfg(feature = "session-backend")]
use luft_config::{DisplayConfig, OutputConfig};
use smithay::reexports::wayland_server::{
    Client, DataInit, Dispatch, DisplayHandle, GlobalDispatch, New, Resource, WEnum,
    backend::GlobalId,
};
use wayland_protocols_wlr::output_management::v1::server::{
    zwlr_output_configuration_head_v1::{self, ZwlrOutputConfigurationHeadV1},
    zwlr_output_configuration_v1::{self, ZwlrOutputConfigurationV1},
    zwlr_output_head_v1::{self, ZwlrOutputHeadV1},
    zwlr_output_manager_v1::{self, ZwlrOutputManagerV1},
    zwlr_output_mode_v1::{self, ZwlrOutputModeV1},
};

use crate::{output::OutputModeDescriptor, state::KestrelState};

mod advertise;
mod configuration_head;
mod state;
mod transforms;

use advertise::advertise_outputs;
#[cfg(feature = "session-backend")]
use advertise::{create_head, create_modes, send_head_state};
use state::OutputSnapshot;
use transforms::transform_from_wl;

pub struct OutputManagementState {
    _global: GlobalId,
    serial: u32,
    managers: Vec<ManagerInstance>,
    #[cfg(feature = "session-backend")]
    pending_apply: Option<PendingOutputApply>,
}

struct ManagerInstance {
    manager: ZwlrOutputManagerV1,
    _heads: BTreeMap<String, AdvertisedHead>,
}

struct AdvertisedHead {
    _resource: ZwlrOutputHeadV1,
    _modes: Vec<(OutputModeDescriptor, ZwlrOutputModeV1)>,
}

#[cfg(feature = "session-backend")]
pub struct PendingOutputApply {
    pub config: DisplayConfig,
    response: ZwlrOutputConfigurationV1,
}

#[derive(Debug, Clone)]
struct HeadData {
    name: String,
}

#[derive(Debug, Clone)]
struct ModeData {
    head_name: String,
    mode: OutputModeDescriptor,
}

#[derive(Debug)]
struct ConfigurationData {
    serial: u32,
    heads: Mutex<BTreeMap<String, RequestedHead>>,
    used: Mutex<bool>,
}

#[derive(Debug, Clone)]
struct ConfigurationHeadData {
    configuration: ZwlrOutputConfigurationV1,
    name: String,
}

#[derive(Debug, Clone)]
struct RequestedHead {
    enabled: bool,
    width: i32,
    height: i32,
    refresh_millihertz: i32,
    x: i32,
    y: i32,
    scale: f64,
    transform: OutputTransform,
    adaptive_sync: bool,
    set: HeadProperties,
}

bitflags::bitflags! {
    #[derive(Debug, Clone, Copy)]
    struct HeadProperties: u8 {
        const MODE = 1 << 0;
        const POSITION = 1 << 1;
        const TRANSFORM = 1 << 2;
        const SCALE = 1 << 3;
        const ADAPTIVE_SYNC = 1 << 4;
    }
}

impl OutputManagementState {
    pub fn new(display: &DisplayHandle) -> Self {
        Self {
            _global: display.create_global::<KestrelState, ZwlrOutputManagerV1, _>(4, ()),
            serial: 1,
            managers: Vec::new(),
            #[cfg(feature = "session-backend")]
            pending_apply: None,
        }
    }

    #[cfg(feature = "session-backend")]
    pub fn take_pending_apply(&mut self) -> Option<PendingOutputApply> {
        self.pending_apply.take()
    }

    #[cfg(feature = "session-backend")]
    fn refresh_clients(&mut self, display: &DisplayHandle, outputs: &[OutputSnapshot]) {
        self.managers.retain(|instance| instance.manager.is_alive());
        for instance in &mut self.managers {
            let Ok(client) = display.get_client(instance.manager.id()) else {
                continue;
            };
            let current_names = outputs
                .iter()
                .map(|output| output.descriptor.name.as_str())
                .collect::<BTreeSet<_>>();
            instance._heads.retain(|name, advertised| {
                if current_names.contains(name.as_str()) {
                    true
                } else {
                    for (_, mode) in &advertised._modes {
                        mode.finished();
                    }
                    advertised._resource.finished();
                    false
                }
            });
            for output in outputs {
                if !instance._heads.contains_key(&output.descriptor.name)
                    && let Some(head) =
                        create_head::<KestrelState>(display, &client, &instance.manager, output)
                {
                    instance._heads.insert(output.descriptor.name.clone(), head);
                }
                let Some(advertised) = instance._heads.get_mut(&output.descriptor.name) else {
                    continue;
                };
                if advertised
                    ._modes
                    .iter()
                    .map(|(mode, _)| *mode)
                    .collect::<Vec<_>>()
                    != output.descriptor.modes
                {
                    for (_, mode) in advertised._modes.drain(..) {
                        mode.finished();
                    }
                    advertised._modes = create_modes::<KestrelState>(
                        display,
                        &client,
                        &instance.manager,
                        &advertised._resource,
                        output,
                    );
                }
                send_head_state(&advertised._resource, &advertised._modes, output);
            }
            instance.manager.done(self.serial);
        }
    }
}

impl GlobalDispatch<ZwlrOutputManagerV1, ()> for KestrelState {
    fn bind(
        state: &mut Self,
        display: &DisplayHandle,
        client: &Client,
        resource: New<ZwlrOutputManagerV1>,
        _: &(),
        data_init: &mut DataInit<'_, Self>,
    ) {
        let manager = data_init.init(resource, ());
        let outputs = state.output_management_snapshots();
        let heads = advertise_outputs::<Self>(display, client, &manager, &outputs);
        manager.done(state.protocol_state.output_management.serial);
        state
            .protocol_state
            .output_management
            .managers
            .push(ManagerInstance {
                manager,
                _heads: heads,
            });
    }
}

impl Dispatch<ZwlrOutputManagerV1, ()> for KestrelState {
    fn request(
        state: &mut Self,
        _: &Client,
        manager: &ZwlrOutputManagerV1,
        request: zwlr_output_manager_v1::Request,
        _: &(),
        _: &DisplayHandle,
        data_init: &mut DataInit<'_, Self>,
    ) {
        match request {
            zwlr_output_manager_v1::Request::CreateConfiguration { id, serial } => {
                data_init.init(
                    id,
                    ConfigurationData {
                        serial,
                        heads: Mutex::new(BTreeMap::new()),
                        used: Mutex::new(false),
                    },
                );
            }
            zwlr_output_manager_v1::Request::Stop => {
                manager.finished();
                state
                    .protocol_state
                    .output_management
                    .managers
                    .retain(|known| &known.manager != manager);
            }
            _ => {}
        }
    }
}

impl Dispatch<ZwlrOutputHeadV1, HeadData> for KestrelState {
    fn request(
        _: &mut Self,
        _: &Client,
        _: &ZwlrOutputHeadV1,
        _: zwlr_output_head_v1::Request,
        _: &HeadData,
        _: &DisplayHandle,
        _: &mut DataInit<'_, Self>,
    ) {
    }
}

impl Dispatch<ZwlrOutputModeV1, ModeData> for KestrelState {
    fn request(
        _: &mut Self,
        _: &Client,
        _: &ZwlrOutputModeV1,
        _: zwlr_output_mode_v1::Request,
        _: &ModeData,
        _: &DisplayHandle,
        _: &mut DataInit<'_, Self>,
    ) {
    }
}

impl Dispatch<ZwlrOutputConfigurationV1, ConfigurationData> for KestrelState {
    fn request(
        state: &mut Self,
        _: &Client,
        configuration: &ZwlrOutputConfigurationV1,
        request: zwlr_output_configuration_v1::Request,
        data: &ConfigurationData,
        display: &DisplayHandle,
        data_init: &mut DataInit<'_, Self>,
    ) {
        if !matches!(request, zwlr_output_configuration_v1::Request::Destroy)
            && *data.used.lock().unwrap()
        {
            display.post_error(
                configuration,
                zwlr_output_configuration_v1::Error::AlreadyUsed as u32,
                "output configuration has already been used".into(),
            );
            return;
        }
        match request {
            zwlr_output_configuration_v1::Request::EnableHead { id, head } => {
                let Some(head_data) = head.data::<HeadData>() else {
                    configuration.failed();
                    return;
                };
                let Some(requested) = requested_head(state, &head_data.name, true) else {
                    configuration.failed();
                    return;
                };
                let mut heads = data.heads.lock().unwrap();
                if heads.contains_key(&head_data.name) {
                    display.post_error(
                        configuration,
                        zwlr_output_configuration_v1::Error::AlreadyConfiguredHead as u32,
                        "output head was configured twice".into(),
                    );
                    return;
                }
                heads.insert(head_data.name.clone(), requested);
                drop(heads);
                data_init.init(
                    id,
                    ConfigurationHeadData {
                        configuration: configuration.clone(),
                        name: head_data.name.clone(),
                    },
                );
            }
            zwlr_output_configuration_v1::Request::DisableHead { head } => {
                let Some(head_data) = head.data::<HeadData>() else {
                    configuration.failed();
                    return;
                };
                let Some(requested) = requested_head(state, &head_data.name, false) else {
                    configuration.failed();
                    return;
                };
                let mut heads = data.heads.lock().unwrap();
                if heads.contains_key(&head_data.name) {
                    display.post_error(
                        configuration,
                        zwlr_output_configuration_v1::Error::AlreadyConfiguredHead as u32,
                        "output head was configured twice".into(),
                    );
                    return;
                }
                heads.insert(head_data.name.clone(), requested);
            }
            zwlr_output_configuration_v1::Request::Apply => {
                use_configuration(state, configuration, data, true);
            }
            zwlr_output_configuration_v1::Request::Test => {
                use_configuration(state, configuration, data, false);
            }
            zwlr_output_configuration_v1::Request::Destroy => {}
            _ => {}
        }
    }
}

fn use_configuration(
    state: &mut KestrelState,
    resource: &ZwlrOutputConfigurationV1,
    data: &ConfigurationData,
    apply: bool,
) {
    let mut used = data.used.lock().unwrap();
    if *used {
        resource.failed();
        return;
    }
    *used = true;
    if data.serial != state.protocol_state.output_management.serial {
        resource.cancelled();
        return;
    }
    let heads = data.heads.lock().unwrap();
    let known = state
        .outputs
        .managed_outputs()
        .map(|output| output.descriptor.name.clone())
        .collect::<BTreeSet<_>>();
    if heads.keys().cloned().collect::<BTreeSet<_>>() != known {
        resource.post_error(
            zwlr_output_configuration_v1::Error::UnconfiguredHead as u32,
            "configuration must include every output head",
        );
        return;
    }
    if !heads.values().any(|head| head.enabled) {
        resource.failed();
        return;
    }
    if apply {
        #[cfg(feature = "session-backend")]
        {
            let mut config = state.config.display.clone();
            for (name, head) in heads.iter() {
                config.outputs.insert(
                    name.clone(),
                    OutputConfig {
                        enabled: head.enabled,
                        scale: Some(head.scale),
                        x: head.x,
                        y: head.y,
                        width: Some(head.width),
                        height: Some(head.height),
                        refresh_millihertz: Some(head.refresh_millihertz),
                        transform: head.transform,
                        adaptive_sync: head.adaptive_sync,
                    },
                );
            }
            state.protocol_state.output_management.pending_apply = Some(PendingOutputApply {
                config,
                response: resource.clone(),
            });
        }
        #[cfg(not(feature = "session-backend"))]
        resource.failed();
    } else {
        resource.succeeded();
    }
}

fn requested_head(state: &KestrelState, name: &str, enabled: bool) -> Option<RequestedHead> {
    let output = state.outputs.managed(name)?;
    let configured = state.config.display.outputs.get(name);
    Some(RequestedHead {
        enabled,
        width: output.descriptor.size.w,
        height: output.descriptor.size.h,
        refresh_millihertz: output.descriptor.refresh_millihertz,
        x: output.location.x,
        y: output.location.y,
        scale: output.output.current_scale().fractional_scale(),
        transform: configured
            .map(|config| config.transform)
            .unwrap_or_default(),
        adaptive_sync: configured.is_some_and(|config| config.adaptive_sync),
        set: HeadProperties::empty(),
    })
}
