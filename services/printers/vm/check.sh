#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Printers1 /com/lantharos/Printers1 com.lantharos.Printers1)
WORK=/run/luft-printers-check
NETWORK_PRINTER=Luft_Test_Printer
USB_OUTPUT="$WORK/usb-received"

report() { echo "luft-printers-check: $*" > /dev/ttyS0; }
failed=0
fail() {
  report "FAIL $*"
  failed=1
  {
    journalctl -b -u luft-printer-setup.service -u luft-printers.service -u avahi-daemon.service --no-pager -n 40
    journalctl -b -u cups.service --no-pager -n 15
    lpstat -t
    ip -br addr
    lpinfo -v
    ls -laR "$WORK"
    lsusb -v -d 04a9:1787 | grep -E "bInterface|bNumConfigurations|iProduct"
    ls /sys/bus/usb/drivers
    dmesg | grep -v audit | tail -30
    ls -la /dev/usb
    timeout 15 /usr/lib/cups/backend/dnssd
    timeout 10 /usr/lib/cups/backend/usb
    timeout 10 avahi-browse -art
    cat "$WORK"/*.log
  } 2>&1 | sed 's/^/luft-printers-check: | /' > /dev/ttyS0
  return 1
}
pass() { report "PASS $*"; }

eventually() {
  local label="$1"
  shift
  for _ in $(seq 90); do
    "$@" > /dev/null 2>&1 && return 0
    sleep 1
  done
  fail "$label"
}

network_printer() {
  nft flush ruleset
  ip link add check0 type dummy
  ip link set check0 multicast on up
  ip addr add 10.77.0.1/24 dev check0
  mkdir -p "$WORK/spool"
  ippeveprinter -k -d "$WORK/spool" -p 8610 -f application/pdf,image/pwg-raster,image/urf -M Luft -m 'Test Printer' 'Luft Test Printer' > "$WORK/ippeveprinter.log" 2>&1 &
  eventually "Avahi doesn't see the network printer" sh -c "avahi-browse -tpr _ipp._tcp | grep -q 'Luft Test Printer'" || return
  pass "the network printer is announced"
}

session() {
  useradd -m checker
  runuser -u checker -- dbus-run-session -- /usr/libexec/luft-printers-check-session "$NETWORK_PRINTER" 2>&1 | sed -u 's/^/luft-printers-check: session: /' > /dev/ttyS0
  ((PIPESTATUS[0] == 0)) || fail "the session check" || return
  eventually "the test page didn't reach the network printer" sh -c "find '$WORK/spool' -type f -size +0 | grep -q ." || return
  pass "the test page reached the network printer"
}

gadget_device() {
  local vendor
  for vendor in /sys/bus/usb/devices/*/idVendor; do
    [[ "$(cat "$vendor")" == 04a9 && "$(cat "${vendor%/*}/idProduct")" == 1787 ]] && { echo "${vendor%/*}"; return 0; }
  done
  return 1
}

gadget_hub() {
  local serial
  for serial in /sys/bus/usb/devices/usb*/serial; do
    [[ "$(cat "$serial")" == dummy_hcd.0 ]] && { echo "${serial%/*}/${serial//[^0-9]/}-0:1.0"; return 0; }
  done
  return 1
}

usb_printer() {
  local hub device interface
  /usr/libexec/luft-printers-check-gadget "$USB_OUTPUT" > "$WORK/gadget.log" 2>&1 &
  eventually "the gadget's USB bus didn't appear" gadget_hub || return
  hub="$(gadget_hub)"
  eventually "the gadget's USB bus has no hub" test -e "$hub/authorized" || return
  echo 1 > "$hub/authorized"
  echo "${hub##*/}" > /sys/bus/usb/drivers_probe
  eventually "no USB printer appeared" gadget_device || return
  device="$(gadget_device)"
  interface="$device/${device##*/}:1.0"
  [[ "$(cat "$device/authorized")" == 0 ]] || fail "the printer was allowed with nobody signed in" || return
  echo 1 > "$device/authorized"
  eventually "the allowed USB printer has no interface" test -e "$interface/authorized" || return
  echo 1 > "$interface/authorized"
  echo "${interface##*/}" > /sys/bus/usb/drivers_probe
  echo add > "$device/uevent"
  eventually "the allowed USB printer has no printer port" test -e /dev/usb/lp0 || return
  pass "the USB printer is plugged in and let in, as USB protection does at an unlock"
  eventually "luft-printer-setup didn't set it up" sh -c "lpstat -v | grep -q 'usb://Canon/MX490%20series'" || return
  queue="$(lpstat -v | sed -n 's/^device for \([^:]*\): usb:\/\/Canon\/MX490%20series.*/\1/p')"
  [[ "$(lpoptions -p "$queue" | grep -o "printer-make-and-model='[^']*'")" == *Gutenprint* ]] || fail "$queue has no Gutenprint driver: $(lpoptions -p "$queue")" || return
  pass "plugging it in set up $queue with Gutenprint"
  lp -d "$queue" /usr/share/cups/data/default-testpage.pdf > /dev/null || fail "lp to $queue" || return
  eventually "the test page didn't reach the USB printer" test -s "$USB_OUTPUT" || return
  pass "a test page printed over USB ($(stat -c %s "$USB_OUTPUT") bytes)"
}

devices() { busctl --timeout=30 call "${BUS[@]}" Devices; }

service() {
  local found drivers added
  found="$(devices)" || fail "Devices" || return
  [[ "$found" != *usb://Canon/MX490* && "$found" != *Luft%20Test%20Printer* ]] || fail "Devices lists printers that are set up: $found" || return
  pass "Devices leaves out printers that are set up"
  drivers="$(busctl call "${BUS[@]}" Drivers ss 'MFG:Canon;MDL:MX490 series;' '')" || fail "Drivers" || return
  [[ "$drivers" =~ ^a\(ssb\)\ [0-9]+\ \"gutenprint\.5\.3://bjc-MX490-series/expert\" ]] || fail "Drivers suggests ${drivers:0:200}" || return
  pass "Drivers suggests Gutenprint's MX490 series driver first"
  added="$(busctl call "${BUS[@]}" Add ssss "ipp://localhost:8610/ipp/print" "" "Kept Printer" "Desk")" || fail "Add" || return
  [[ "$added" == "s \"$NETWORK_PRINTER\"" ]] || fail "adding the network printer by address made $added instead of keeping its queue" || return
  busctl call "${BUS[@]}" Configure 'sa{ss}' "$NETWORK_PRINTER" 2 media iso_a5_148x210mm sides one-sided || fail "Configure" || return
  eventually "the printer and its paper size weren't kept" sh -c "sed -n '/<Printer $NETWORK_PRINTER>/,/<\/Printer>/p' /etc/cups/printers.conf | grep -qx 'Option media iso_a5_148x210mm'" || return
  busctl call "${BUS[@]}" Remove s "$NETWORK_PRINTER" || fail "Remove" || return
  eventually "the printer wasn't removed" sh -c "! grep -q '<Printer $NETWORK_PRINTER>' /etc/cups/printers.conf" || return
  pass "the printer service adds, configures and removes printers"
}

selinux() {
  local denials
  denials="$(journalctl -b -k -g 'avc:  denied' -o cat --no-pager | grep -E 'cups|printer|luft|avahi|ipp' || true)"
  [[ -z "$denials" ]] || fail "SELinux denied: $denials" || return
  [[ "$(getenforce)" == Enforcing ]] || fail "SELinux isn't enforcing" || return
  pass "SELinux denied nothing"
}

mkdir -p "$WORK"
network_printer && session
usb_printer
service
selinux
((failed)) || report "PASS everything"
systemctl poweroff --no-block
