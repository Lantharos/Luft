[ -n "$BASH_VERSION" ] || return 0
[[ $- == *i* ]] || return 0

__luft_package_hint() {
	local manager=$1 action=$2
	if [[ $manager != dnf* ]]; then
		printf 'Luft is based on Fedora, so it uses dnf instead of %s.\n' "$manager" >&2
	fi
	printf 'The system is read-only, so software goes into your account instead:\n' >&2
	printf '  \e[1mschelf install …\e[0m installs apps from Flathub and tools from Fedora,\n' >&2
	printf '  \e[1mschelf install --system …\e[0m adds services such as Tailscale to the system, or\n' >&2
	printf '  run \e[1mtoolbox enter\e[0m first, then \e[1msudo dnf %s …\e[0m inside it.\n' "${action:-install}" >&2
}

__luft_update_hint() {
	printf 'Luft updates itself. Updates are in Settings, under Updates.\n' >&2
	printf 'Apps, AppImages and command-line tools update with \e[1mschelf update\e[0m.\n' >&2
}

__luft_names() {
	local listed=$1
	shift
	while (($# > 1)); do
		listed+=", $1"
		shift
	done
	(($#)) && listed+=" and $1"
	printf '%s' "$listed"
}

__luft_schelf() {
	local verb=$1
	shift
	local -a names=()
	local word present=0
	for word in "$@"; do
		if [[ $word == -* ]]; then
			continue
		elif [[ $verb == install ]] && command rpm --query --quiet --whatprovides "$word" 2>/dev/null; then
			printf '%s is already installed.\n' "$word" >&2
			((++present))
		else
			names+=("$word")
		fi
	done
	((present > 0 && ${#names[@]} == 0)) && return 0
	if ((${#names[@]} == 0)); then
		__luft_package_hint "$__luft_manager" "$verb"
		return 1
	fi
	local listed question
	listed=$(__luft_names "${names[@]}")
	case $verb in
	install) question="Luft installs this with Schelf, into your account. Install $listed?" ;;
	remove) question="Luft removes this with Schelf, from your account. Remove $listed?" ;;
	search) question="Luft finds software with Schelf. Search for $listed?" ;;
	esac
	local reply
	read -r -p "$question [Y/n] " reply || {
		printf '\n' >&2
		return 1
	}
	case ${reply,,} in
	'' | y | yes) ;;
	*) return 1 ;;
	esac
	case $verb in
	install) schelf install "${names[@]}" ;;
	remove) schelf remove --yes "${names[@]}" ;;
	search) schelf search "${names[@]}" ;;
	esac
}

__luft_dnf() {
	local __luft_manager=$1
	shift
	local -a all=("$@")
	local action
	for action in "$@"; do
		shift
		[[ $action == -* ]] || break
	done
	[[ $action == -* ]] && action=
	case $action in
	install | in) __luft_schelf install "$@" ;;
	remove | erase | rm) __luft_schelf remove "$@" ;;
	search | se) __luft_schelf search "$@" ;;
	upgrade | update | up | distro-sync | dsync | upgrade-minimal)
		__luft_update_hint
		return 1
		;;
	info | list | provides | whatprovides | repoquery | rq | repolist | history | check-update | check-upgrade | help | '')
		command "${__luft_manager/yum/dnf}" "${all[@]}"
		;;
	*)
		__luft_package_hint "$__luft_manager" "$action"
		return 1
		;;
	esac
}

__luft_apt() {
	local __luft_manager=$1 action=$2
	shift 2
	case $action in
	install) __luft_schelf install "$@" ;;
	remove | purge) __luft_schelf remove "$@" ;;
	search) __luft_schelf search "$@" ;;
	update | upgrade | full-upgrade | dist-upgrade)
		__luft_update_hint
		return 1
		;;
	*)
		__luft_package_hint "$__luft_manager" install
		return 1
		;;
	esac
}

__luft_pacman() {
	local __luft_manager=pacman operation=$1
	shift
	case $operation in
	-S*u*)
		__luft_update_hint
		return 1
		;;
	-S*s*) __luft_schelf search "$@" ;;
	-S | -Sy)
		if (($#)); then
			__luft_schelf install "$@"
		else
			__luft_update_hint
			return 1
		fi
		;;
	-R*) __luft_schelf remove "$@" ;;
	*)
		__luft_package_hint pacman install
		return 1
		;;
	esac
}

__luft_zypper() {
	local __luft_manager=zypper action=$1
	shift
	case $action in
	in | install) __luft_schelf install "$@" ;;
	rm | remove) __luft_schelf remove "$@" ;;
	se | search) __luft_schelf search "$@" ;;
	up | update | dup | dist-upgrade | patch)
		__luft_update_hint
		return 1
		;;
	*)
		__luft_package_hint zypper install
		return 1
		;;
	esac
}

dnf() { __luft_dnf dnf "$@"; }
dnf5() { __luft_dnf dnf5 "$@"; }
yum() { __luft_dnf yum "$@"; }
apt() { __luft_apt apt "$@"; }
apt-get() { __luft_apt apt-get "$@"; }
pacman() { __luft_pacman "$@"; }
zypper() { __luft_zypper "$@"; }

sudo() {
	case $1 in
	dnf | dnf5 | yum | apt | apt-get | pacman | zypper) "$@" ;;
	*) command sudo "$@" ;;
	esac
}
