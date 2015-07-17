#!/bin/bash

die() { echo "$@" 1>&2 ; exit 1; }

inline() { # filename, regex, prefix, suffix
	local regex=$2
	local prefix=$3
	local suffix=$4
	while IFS='' read -r line || [[ -n $line ]]; do
		if [[ $line =~ $regex ]]; then
			filename="${BASH_REMATCH[1]}"
			[ -f "$filename" ] || die "File does not exist: $filename"
			echo $prefix
			cat $filename
			echo
			echo $suffix
		else
			echo "$line"
		fi
	done < "$1"
}

inline $1 "<script src=\"([^\"]+)\"" '<script type="text/javascript">' '</script>' >/tmp/index
inline /tmp/index "css\" href=\"([^\"]+)\"" '<style type="text/css">' '</style>'
