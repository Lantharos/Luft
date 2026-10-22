#!/usr/bin/env bash
# Tries known fixes for silent Realtek analog outputs, one at a time, and writes a report.
# Nothing is kept: every change is undone at the end, and a restart undoes it too.
set -euo pipefail

[[ $EUID -eq 0 ]] || exec sudo bash "$0" "$@"

for dev in /sys/class/sound/hwC*D*; do
	[[ $(<"$dev/vendor_id") == 0x10ec* ]] && break
done
[[ $(<"$dev/vendor_id") == 0x10ec* ]] || { echo "No Realtek sound chip found."; exit 1; }
[[ -w $dev/reconfig ]] || { echo "This kernel can't reconfigure the sound chip."; exit 1; }

name=${dev##*/hwC}
card=${name%D*}
codec=${name#*D}
proc="/proc/asound/card$card/codec#$codec"
user=${SUDO_USER:-$(ps -o user= -C pipewire | head -n1)}
home=$(getent passwd "$user" | cut -d: -f6)
report="$home/hda-fixups.txt"
work=$(mktemp -d)
power_save=/sys/module/snd_hda_intel/parameters/power_save
dump_coef=/sys/module/snd_hda_codec/parameters/dump_coef
saved_power_save=$(<"$power_save")
saved_dump_coef=$(<"$dump_coef")
saved_hints=$(<"$dev/hints")
saved_pins=$(<"$dev/user_pin_configs")
saved_verbs=$(<"$dev/init_verbs")
results=()

session() { systemctl --user -M "$user@" "$@"; }

write_lines() {
	local line
	while IFS= read -r line; do
		[[ -n $line ]] && echo "$line" >"$dev/$1"
	done <<<"$2"
}

gpio_register() {
	awk -v want=" $1=1" '/^  IO\[/ { n = $1; gsub(/[^0-9]/, "", n); if (index($0, want)) v += 2 ^ n } END { printf "0x%02x", v }' "$work/before.txt"
}

coef() {
	awk -v key="$(printf 'Coeff 0x%02x:' "$1")" 'index($0, key) { print $3; exit }' "$work/before.txt"
}

busy() {
	echo "The sound chip is still in use, so it can't be changed. These programs have it open:"
	find /proc/[0-9]*/fd -lname "/dev/snd/*C$card*" -printf '%h\n' 2>/dev/null | cut -d/ -f3 | sort -u | xargs -r ps -o pid=,comm= -p
	exit 1
}

reload_codec() {
	echo 1 2>/dev/null >"$dev/clear" || busy
	write_lines hints "$saved_hints"
	write_lines user_pin_configs "$saved_pins"
	write_lines init_verbs "$saved_verbs"
	write_lines init_verbs "$1"
	write_lines hints "${2:-}"
	echo 1 2>/dev/null >"$dev/reconfig" || busy
	udevadm settle
}

gpio_verbs() { printf '0x01 0x716 %s\n0x01 0x717 %s\n0x01 0x715 %s\n' "$1" "$2" "$3"; }

apply() {
	local verbs hints=$'jack_detect = yes\n' action kind a b c
	verbs=$(gpio_verbs "$(gpio_register enable)" "$(gpio_register dir)" "$(gpio_register data)")
	IFS=';' read -ra actions <<<"$1"
	for action in "${actions[@]}"; do
		read -r kind a b c <<<"$action"
		case $kind in
		verb) verbs+=$'\n'"$a $b $c" ;;
		gpio) verbs+=$'\n'"$(gpio_verbs "$a" "$b" "$c")" ;;
		coef) verbs+=$'\n'"0x20 0x500 $a"$'\n'"0x20 0x400 $(printf '0x%04x' $(($(coef "$a") | b)))" ;;
		hint) hints+="$a $b $c"$'\n' ;;
		esac
	done
	reload_codec "$verbs" "$hints"
}

unmute_outputs() {
	amixer -c "$card" -q sset 'Auto-Mute Mode' Disabled 2>/dev/null || true
	amixer -c "$card" -q sset Master 50% unmute 2>/dev/null || true
	for control in Headphone Front PCM; do
		amixer -c "$card" -q sset "$control" 100% unmute 2>/dev/null || true
	done
}

heard() {
	local answer
	while true; do
		timeout 4 speaker-test -D "plughw:$card,0" -c 2 -t sine -f 440 >"$work/tone.log" 2>&1 || true
		if grep -qi "open error" "$work/tone.log"; then
			echo "error: $(grep -i -m1 "open error" "$work/tone.log")"
			return
		fi
		read -rp "  Did you hear a tone? [y]es, [n]o, [r]eplay: " answer </dev/tty
		case $answer in
		y | Y) echo yes; return ;;
		n | N) echo no; return ;;
		esac
	done
}

try() {
	echo
	echo "$1"
	apply "$2"
	unmute_outputs
	local answer
	answer=$(heard)
	results+=("$answer  $1")
	[[ $answer == yes ]]
}

restore() {
	set +e
	(reload_codec "$(gpio_verbs "$(gpio_register enable)" "$(gpio_register dir)" "$(gpio_register data)")" "jack_detect = yes")
	(reload_codec "")
	alsactl -f "$work/mixer.state" restore "$card" 2>/dev/null
	echo "$saved_power_save" >"$power_save"
	echo "$saved_dump_coef" >"$dump_coef"
	resume
	rm -rf "$work"
}

cat <<EOF
This plays a short tone after each of a few changes to the sound chip and asks
whether you heard it. Put the headset in the front jack and, if you have
speakers or a second headset, the green jack at the back too. Hold the headset
a little away from your ears. Sound stops working for other apps until the end.

EOF
read -rp "Press Enter to start. " </dev/tty

alsa_daemons=$(systemctl list-units --state=active --plain --no-legend 'alsa-*.service' | cut -d' ' -f1)
resume() {
	[[ -z $alsa_daemons ]] || systemctl start $alsa_daemons
	session start pipewire.socket pipewire-pulse.socket pipewire wireplumber pipewire-pulse
}
trap resume EXIT
session stop pipewire.socket pipewire-pulse.socket wireplumber pipewire pipewire-pulse
[[ -z $alsa_daemons ]] || systemctl stop $alsa_daemons
holders=$({ find /proc/[0-9]*/fd -lname "/dev/snd/*C$card*" -printf '%h\n' 2>/dev/null || true; } | cut -d/ -f3 | sort -u)
if [[ -n $holders ]]; then
	echo "These programs still use the sound card. Close them and run this again:"
	ps -o pid=,comm= -p "${holders//$'\n'/,}"
	exit 1
fi

alsactl -f "$work/mixer.state" store "$card"
echo 0 >"$power_save"
echo 1 >"$dump_coef"
cat "$proc" >"$work/before.txt"
trap restore EXIT

try "1. Nothing changed, with every output unmuted" "" || true
if try "2. GPIO 0-4 driven high (external amplifier enable)" "gpio 0x1f 0x1f 0x1f"; then
	for line in 0 1 2 3 4; do
		bit=$(printf '0x%02x' $((1 << line)))
		try "   GPIO $line high on its own" "gpio $bit $bit $bit" || true
	done
fi
try "3. EAPD turned off on both jacks (amplifier with inverted enable)" "verb 0x14 0x70c 0x00; verb 0x1b 0x70c 0x00" || true
try "4. EAPD control bit kept (coef 0x07 bit 5)" "coef 0x07 0x0020" || true
try "5. GPIO 0-4 driven low (amplifier with inverted enable)" "gpio 0x1f 0x1f 0x00" || true
try "6. PLL gating bit kept (coef 0x04 bit 15)" "coef 0x04 0x8000" || true
try "7. Jack detection off" "hint jack_detect = no" || true
try "8. Front jack fed through the rear jack's mixer (0x0c)" "verb 0x1b 0x701 0x00" || true
try "9. Loopback mixer left out of the output paths" "hint mixer_nid = 0" || true

{
	echo "Sound fixups tried on $(date -R)"
	echo "Computer: $(</sys/class/dmi/id/sys_vendor) $(</sys/class/dmi/id/product_name), board $(</sys/class/dmi/id/board_name)"
	echo "Kernel: $(uname -r)"
	echo "Codec: $(<"$dev/chip_name") $(<"$dev/vendor_id"), subsystem $(<"$dev/subsystem_id"), card $card codec $codec"
	echo
	printf '%s\n' "${results[@]}"
	echo
	echo "== Kernel messages"
	journalctl -k -b --no-pager -o cat | grep -iE 'snd_hda|hda.codec|hda.intel|alc8' || true
	echo
	echo "== Codec before the changes"
	cat "$work/before.txt"
} >"$report"
chown "$user:" "$report"

echo
printf '%s\n' "${results[@]}"
echo
echo "Everything is back to how it was. Please send $report"
