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

function assert {
	echo "$1"
	echo "$1" |grep ' => 200' >/dev/null || die "Fail $1"
}

function assertEquals { # json, expected, actual:jq-exp
	actual=$(echo $1 |jq "$3")
	expected=$2
	[ "$actual" == "$expected" ] || [ "$actual" == "\"$expected\"" ] || die \
		"Not equal, expected = '$expected', actual = '$actual' for '$3' in '$1'"
}

cd ..
npm start &>$LOG &
sleep 1
grep 'Listening at' $LOG >/dev/null || die "App does not seem to be started"
grep 'Did not find' $LOG >/dev/null || die "Database must be virgin"
echo "App is started"