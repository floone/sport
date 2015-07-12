die() { echo "$@" 1>&2 ; exit 1; }

export SPORT_DB_NAME=sporttest
LOG=/tmp/npm.log

pkill node

[ "$OPENSHIFT_NODEJS_IP" == "" ] && die "OPENSHIFT_NODEJS_IP must be set"
[ "$OPENSHIFT_NODEJS_PORT" == "" ] && die "OPENSHIFT_NODEJS_PORT must be set"
[ "$ADMIN_PASSWORD" == "" ] && die "ADMIN_PASSWORD must be set"

BASE_URL="http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT"
ADMIN_URL="$BASE_URL/admin"
ADMIN_POST="curl -s -u admin:$ADMIN_PASSWORD -H 'Content-Type: application/json' -w ' => %{http_code}' "

cat db.sql |mysql -u root || die "Could not create database"

function get {
	local RESP=$(curl -s -w " http_code=%{http_code}" $1)
	local JSON=$(echo $RESP |awk -F"http_code=" '{ print $1 }')
	local CODE=$(echo $RESP |awk -F"http_code=" '{ print $2 }')
	if [ "$CODE" != "200" ]; then
		die "Fail, HTTP response code: $CODE, body = $JSON"
	fi
	echo $JSON
}

function assert {
	#echo "$1"
	echo "$1" |grep ' => 200' >/dev/null
	if [ "0" -ne "$?" ]; then
		die "Fail (no HTTP 200 response): $1"
	fi
}

function assertEquals { # json, expected, actual:jq-exp
	echo $1 |jq "$3" >/dev/null || die "JSON can not be parsed '$1' with jq expression '$3'"
	local actual=$(echo $1 |jq "$3")
	local expected=$2
	[ "$actual" == "$expected" ] || [ "$actual" == "\"$expected\"" ] || die \
		"Not equal, expected = '$expected', actual = '$actual' for '$3' in '$1'"
}

cd ..
npm start &>$LOG &
sleep 1
grep 'Listening at' $LOG >/dev/null || die "App does not seem to be started"
grep 'Did not find' $LOG >/dev/null || die "Database must be virgin"
echo "App is running, ready for tests"