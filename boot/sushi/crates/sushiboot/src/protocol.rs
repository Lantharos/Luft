use uefi::Handle;
use uefi::boot::{self, OpenProtocolAttributes, OpenProtocolParams, ScopedProtocol};
use uefi::proto::ProtocolPointer;

pub fn shared<P: ProtocolPointer + ?Sized>(handle: Handle) -> uefi::Result<ScopedProtocol<P>> {
    let params = OpenProtocolParams {
        handle,
        agent: boot::image_handle(),
        controller: None,
    };
    unsafe { boot::open_protocol::<P>(params, OpenProtocolAttributes::GetProtocol) }
}
