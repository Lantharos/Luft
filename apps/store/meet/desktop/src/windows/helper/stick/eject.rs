use windows::Win32::Devices::DeviceAndDriverInstallation::{
    CM_DEVNODE_STATUS_FLAGS, CM_Get_DevNode_Status, CM_Get_Device_Interface_PropertyW,
    CM_Get_Parent, CM_LOCATE_DEVNODE_NORMAL, CM_Locate_DevNodeW, CM_PROB, CM_Request_Device_EjectW,
    CR_SUCCESS, DN_REMOVABLE, PNP_VETO_TYPE,
};
use windows::Win32::Devices::Properties::{DEVPKEY_Device_InstanceId, DEVPROPTYPE};
use windows::core::{HSTRING, PCWSTR};

const INSTANCE_ID: usize = 512;
const ANCESTORS: usize = 8;

fn instance(interface: &str) -> Option<Vec<u16>> {
    let mut kind = DEVPROPTYPE::default();
    let mut id = vec![0u16; INSTANCE_ID];
    let mut size = (id.len() * 2) as u32;
    let found = unsafe {
        CM_Get_Device_Interface_PropertyW(
            &HSTRING::from(interface),
            &DEVPKEY_Device_InstanceId,
            &mut kind,
            Some(id.as_mut_ptr().cast()),
            &mut size,
            0,
        )
    };
    (found == CR_SUCCESS).then_some(id)
}

fn removable(node: u32) -> bool {
    let mut status = CM_DEVNODE_STATUS_FLAGS::default();
    let mut problem = CM_PROB::default();
    let asked = unsafe { CM_Get_DevNode_Status(&mut status, &mut problem, node, 0) };
    asked == CR_SUCCESS && status.contains(DN_REMOVABLE)
}

pub fn eject(interface: &str) -> bool {
    let Some(id) = instance(interface) else {
        return false;
    };
    let mut node = 0u32;
    if unsafe { CM_Locate_DevNodeW(&mut node, PCWSTR(id.as_ptr()), CM_LOCATE_DEVNODE_NORMAL) }
        != CR_SUCCESS
    {
        return false;
    }
    for _ in 0..ANCESTORS {
        if removable(node) {
            let mut veto = PNP_VETO_TYPE::default();
            let ejected = unsafe { CM_Request_Device_EjectW(node, Some(&mut veto), None, 0) };
            return ejected == CR_SUCCESS && veto == PNP_VETO_TYPE::default();
        }
        let mut parent = 0u32;
        if unsafe { CM_Get_Parent(&mut parent, node, 0) } != CR_SUCCESS {
            return false;
        }
        node = parent;
    }
    false
}
