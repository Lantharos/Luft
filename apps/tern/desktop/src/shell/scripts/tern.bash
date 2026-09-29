if [[ -r ~/.bashrc ]]; then
	. ~/.bashrc
fi

__tern_precmd() {
	local status=$?
	printf '\e]133;D;%s\a\e]7;file://%s%s\a' "$status" "$HOSTNAME" "${PWD//%/%25}"
	return $status
}

__tern_postcmd() {
	if [[ $PS1 != *'133;A'* ]]; then
		PS1="\[\e]133;A\a\]$PS1\[\e]133;B\a\]"
	fi
}

if [[ "$(declare -p PROMPT_COMMAND 2>/dev/null)" == "declare -a"* ]]; then
	PROMPT_COMMAND=(__tern_precmd "${PROMPT_COMMAND[@]}" __tern_postcmd)
else
	PROMPT_COMMAND="__tern_precmd${PROMPT_COMMAND:+;$PROMPT_COMMAND};__tern_postcmd"
fi
PS0+=$'\e]133;C\a'
