[ -n "$BASH_VERSION" ] || return 0
[[ $- == *i* ]] || return 0

__luft_repository() {
	local folder=$PWD
	while [[ -n $folder && ! -e $folder/.git ]]; do
		folder=${folder%/*}
	done
	[[ -e $folder/.git ]] || return 1
	__luft_root=${folder:-/}
	local git=$folder/.git head
	if [[ -f $git ]]; then
		read -r head <"$git"
		git=${head#gitdir: }
		[[ $git == /* ]] || git=$folder/$git
	fi
	read -r head 2>/dev/null <"$git/HEAD" || return 0
	case $head in
	'ref: refs/heads/'*) __luft_branch=${head#ref: refs/heads/} ;;
	*) __luft_branch=${head:0:7} ;;
	esac
}

__luft_place() {
	local place=${PWD/#"$HOME"/\~}
	__luft_root='' __luft_branch=''
	if __luft_repository && [[ $__luft_root != "$HOME" && $__luft_root != / ]]; then
		place=${__luft_root##*/}${PWD#"$__luft_root"}
	fi
	local slashes=${place//[!\/]/}
	if ((${#slashes} > 4)); then
		local parent=${place%/*}
		place="${place%%/*}/…/${parent##*/}/${place##*/}"
	fi
	__luft_where=${place:-/}
}

__luft_prompt() {
	local status=$?
	__luft_place
	if [[ -n $__luft_who ]]; then
		printf '\001\e[%sm\002%s\001\e[0m\002 ' "$__luft_who_color" "$__luft_who"
	fi
	printf '\001\e[1m\002%s\001\e[0m\002' "$__luft_where"
	if [[ -n $__luft_branch ]]; then
		printf ' \001\e[90m\002%s\001\e[0m\002' "$__luft_branch"
	fi
	if ((status)); then
		printf ' \001\e[31m\002%s\001\e[0m\002 ' "$__luft_mark"
	else
		printf ' %s ' "$__luft_mark"
	fi
}

__luft_title() {
	local folder=${PWD##*/}
	[[ $PWD == "$HOME" ]] && folder='~'
	printf '\e]0;%s%s\a' "$__luft_title_host" "${folder:-/}"
}

__luft_running_title() {
	local command
	command=${ fc -ln -0 2>/dev/null; }
	command=${command#"${command%%[![:space:]]*}"}
	printf '\e]0;%s%s\a' "$__luft_title_host" "${command%%$'\n'*}"
}

case $PS1 in
'\s-\v\$ ' | '[\u@\h \W]\$ ')
	__luft_who='' __luft_who_color=32 __luft_mark=›
	[[ $TERM == linux ]] && __luft_mark='>'
	if ((EUID == 0)); then
		__luft_who=root __luft_who_color=31
	fi
	if [[ -n $SSH_CONNECTION ]]; then
		__luft_who=${__luft_who:-$USER}@${HOSTNAME%%.*}
	fi
	PS1='${ __luft_prompt; }'
	;;
esac

case $TERM in
linux | dumb | vt*) ;;
*)
	__luft_title_host=''
	[[ -n $SSH_CONNECTION ]] && __luft_title_host="${HOSTNAME%%.*}: "
	# shellcheck disable=SC2016
	case ${PROMPT_COMMAND[0]-} in
	'' | 'printf "\033]0;%s@%s:%s\007" "${USER}" "${HOSTNAME%%.*}" "${PWD/#$HOME/\~}"')
		PROMPT_COMMAND[0]=__luft_title
		PS0+="\${ __luft_running_title; }"
		;;
	esac
	;;
esac
