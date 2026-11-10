use std::net::{TcpListener, TcpStream};
use std::process::Command;

use convertible_lib::worker::stay_offline;

const ADDRESS: &str = "CONVERTIBLE_TEST_ADDRESS";

#[test]
fn workers_cannot_reach_the_network() {
    if let Ok(address) = std::env::var(ADDRESS) {
        assert!(TcpStream::connect(&address).is_ok());
        assert!(stay_offline());
        assert!(TcpStream::connect(&address).is_err());
        return;
    }
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let status = Command::new(std::env::current_exe().unwrap())
        .arg("workers_cannot_reach_the_network")
        .env(ADDRESS, listener.local_addr().unwrap().to_string())
        .status()
        .unwrap();
    assert!(status.success());
}
