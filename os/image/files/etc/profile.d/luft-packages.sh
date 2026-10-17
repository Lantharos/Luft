[ -n "$BASH_VERSION" ] || return 0

__luft_package_hint() {
	local manager=$1 action=$2
	if [[ $manager != dnf* ]]; then
		printf 'Luft is based on Fedora, so it uses dnf instead of %s.\n' "$manager" >&2
	fi
	case $action in
	upgrade | update | distro-sync | dist-upgrade | full-upgrade | -Syu | -Su | dup)
		printf 'Luft updates itself. Updates are in Settings, under Updates.\n' >&2
		return
		;;
	esac
	printf 'The system is read-only, so packages go next to it instead:\n' >&2
	printf '  find command-line tools and apps in Schelf, or\n' >&2
	printf '  run \e[1mtoolbox enter\e[0m first, then \e[1msudo dnf install …\e[0m inside it.\n' >&2
}

__luft_dnf() {
	local manager=$1
	shift
	local action
	for action in "$@"; do
		[[ $action == -* ]] || break
	done
	[[ $action == -* ]] && action=
	case $action in
	search | info | list | provides | repoquery | repolist | history | check-update | check-upgrade | help | '')
		command "$manager" "$@"
		;;
	*)
		__luft_package_hint "$manager" "$action"
		return 1
		;;
	esac
}

dnf() { __luft_dnf dnf "$@"; }
dnf5() { __luft_dnf dnf5 "$@"; }
yum() { __luft_package_hint yum "$1"; return 1; }
apt() { __luft_package_hint apt "$1"; return 1; }
apt-get() { __luft_package_hint apt-get "$1"; return 1; }
pacman() { __luft_package_hint pacman "$1"; return 1; }
zypper() { __luft_package_hint zypper "$1"; return 1; }

sudo() {
	case $1 in
	dnf | dnf5 | yum | apt | apt-get | pacman | zypper) "$@" ;;
	*) command sudo "$@" ;;
	esac
}
