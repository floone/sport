#/bin/bash

die() { echo "$@" 1>&2 ; exit 1; }

export SPORT_DB_NAME=sporttest
LOG=/tmp/npm.log

pkill node

[ "$OPENSHIFT_NODEJS_IP" == "" ] && die "OPENSHIFT_NODEJS_IP must be set"
[ "$OPENSHIFT_NODEJS_PORT" == "" ] && die "OPENSHIFT_NODEJS_PORT must be set"
[ "$ADMIN_PASSWORD" == "" ] && die "ADMIN_PASSWORD must be set"

ADMIN_URL="http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/admin"
ADMIN_POST="curl -s -u admin:$ADMIN_PASSWORD -H 'Content-Type: application/json'"

cat db.sql |mysql -u root || die "Could not create database"

function assert {
	echo "   $1"
	echo "$1" |grep ' => 200' >/dev/null || die "Fail"
}

cd ..
npm start &>$LOG &
sleep 1
grep 'Listening at' $LOG >/dev/null || die "App does not seem to be started"
grep 'Did not find' $LOG >/dev/null || die "Database must be virgin"
echo "App is started"

echo "-- Insert league"
JSON='{"league_name":"Bundesliga 2014/2015"}'
RESP=$(eval "$ADMIN_POST -d '$JSON' -w ' => %{http_code}' $ADMIN_URL/insert/league")
assert "$RESP"

echo "-- Insert event"
JSON='{"teama":"FCB","teamb":"HSV","datetime":"2015-06-23 21:00:00","league_id":1,"round":1}'
RESP=$(eval "$ADMIN_POST -d '$JSON' -w ' => %{http_code}' $ADMIN_URL/insert/event")
assert "$RESP"

echo "Stopping..."
pkill node
#cat $LOG
#rm $LOG