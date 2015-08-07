#!/bin/bash

die() { echo "$@" 1>&2 ; exit 1; }

html_file="$OPENSHIFT_TMP_DIR/fixtures.html"
csv_file="$OPENSHIFT_TMP_DIR/fixtures.csv"
league_id=1
adminurl="http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/admin"

[ "$OPENSHIFT_NODEJS_IP" == "" ] && die "OPENSHIFT_NODEJS_IP must be set"
[ "$OPENSHIFT_NODEJS_PORT" == "" ] && die "OPENSHIFT_NODEJS_PORT must be set"
[ "$ADMIN_PASSWORD" == "" ] && die "ADMIN_PASSWORD must be set"

[ -f $html_file ] || die "$html_file must exist"

# Zurich time zone is used in html_file
timezone=$(TZ=Europe/Zurich date +%Z)
[ "$timezone" == "CET" ] || [ "$timezone" == "CEST" ] || \
	die "Timezone in Zurich must be CET or CEST"

getShortName() {
	[ "$1" == "Bayern München" ]      && echo "FCB" && return
	[ "$1" == "Hamburger SV" ]        && echo "HSV" && return
	[ "$1" == "Bayer Leverkusen" ]    && echo "B04" && return
	[ "$1" == "TSG Hoffenheim" ]      && echo "HOF" && return
	[ "$1" == "Darmstadt 98" ]        && echo "D98" && return
	[ "$1" == "Hannover 96" ]         && echo "H96" && return
	[ "$1" == "Borussia Dortmund" ]   && echo "BVB" && return
	[ "$1" == "B.Mönchengladbach" ]   && echo "BMG" && return
	[ "$1" == "Augsburg" ]            && echo "FCA" && return
	[ "$1" == "Hertha BSC Berlin" ]   && echo "BSC" && return
	[ "$1" == "VfL Wolfsburg" ]       && echo "WOB" && return
	[ "$1" == "Eintracht Frankfurt" ] && echo "SGE" && return
	[ "$1" == "Werder Bremen" ]       && echo "BRE" && return
	[ "$1" == "Schalke 04" ]          && echo "S04" && return
	[ "$1" == "VfB Stuttgart" ]       && echo "VFB" && return
	[ "$1" == "1. FC Köln" ]          && echo "KOE" && return
	[ "$1" == "Mainz 05" ]            && echo "M05" && return
	[ "$1" == "Ingolstadt" ]          && echo "FCI" && return
	echo ""
}

# Parse and convert Zurich time to UTC.
# Will not work for hours 00:00 and 01:00 because
# date of OSX is not compatible to GNU date, thus
# I decided to go with the very simple approach.
getTimeStamp() { # $1 = 15.08.2015, $2 = 15:30
	year=${1:6:4}
	month=${1:3:2}
	day=${1:0:2}
	hours=${2:0:2}
	minutes=${2:3:2}
	if [ "$2" == "" ]; then
		hours="00"
		minutes="00"
	else
		(( hours-- ))
		[ "$timezone" == "CEST" ] && (( hours-- ))
	fi
	echo "$year-$month-$day $hours:$minutes:00"
}

# Parse html and write a csv file
cat $html_file \
	|sed -E $'s/<\/(h2|th|td)>/<\/\\1>\\\n/g' \
	|sed -E 's/<[^>]*>//g' |sed -E 's/(\\S*|&nbsp;)//g' \
	|awk '{print $0","}' \
	|grep -v Runde \
	|awk 'NR%10{printf $0"";next;}1' \
	|grep -v ^,$ \
		> $csv_file

# Read round from html file in a separate pass
round=$(awk -F". Runde" '{ print $1 }' $html_file |sed 's/.*>//')

[ $round == "" ] && die "Could not parse round"
echo " -- round $round"

echo "--- csv ---"
cat $csv_file

echo "--- import ---"
while read line; do
	fdate=$(  echo $line |cut -d"," -f1)
	ftime=$(  echo $line |cut -d"," -f2)
	teama=$(  echo $line |cut -d"," -f4)
	result=$( echo $line |cut -d"," -f5)
	teamb=$(  echo $line |cut -d"," -f6)
	shorta=$( getShortName "$teama")
	shortb=$( getShortName "$teamb")
	if [ "$shorta" == "" ] || [ "$shortb" == "" ]; then
		echo " -- Parse error, will skip line $line"
	elif [ "$shorta" == "?" ] || [ "$shortb" == "?" ]; then
		echo " -- Not all shortnames configured, will skip line $line"
	else
		datetime=$(getTimeStamp $fdate $ftime)
		json_search="{\"teama\":\"$shorta\",\"teamb\":\"$shortb\",\"league_id\":$league_id,\"round\":$round}"
		json_full="{\"datetime\":\"$datetime\",\"info\":\"$result\",${json_search:1}"
		existing_id=$(curl -s -u admin:$ADMIN_PASSWORD -H 'Content-Type: application/json' -d "$json_search" $adminurl/findid/event)

		if [ "$existing_id" == "" ]; then
			echo "Existing_id is empty, probably curl call failed. Repeat and exit."
			curl -u admin:$ADMIN_PASSWORD -H 'Content-Type: application/json' -d "$json_search" $adminurl/findid/event
			exit 1
		fi

		if [ "$existing_id" == "NOT_FOUND" ]; then
			action="CREATE"
			curl -s -u admin:$ADMIN_PASSWORD -H 'Content-Type: application/json' -w %{http_code} -d "$json_full" \
				$adminurl/insert/event |grep 200 >/dev/null
		else
			action="UPDATE $existing_id"
			curl -s -u admin:$ADMIN_PASSWORD -H 'Content-Type: application/json' -w %{http_code} -d "$json_full" \
				$adminurl/update/event/$existing_id |grep 200 >/dev/null || die "Update curl failed for id $existing_id"
		fi

		ok="NOK"
		[ $? -eq 0 ] && ok="OK"
		echo "$action $ok: $json_full"
	fi
done < $csv_file
