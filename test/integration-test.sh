#/bin/bash

. include-before.sh

echo "-- Get leagues (should be empty)"
RESP=$(curl -s $BASE_URL/leagues)
assertEquals "$RESP" "0" ". | length"

echo "-- Insert league"
JSON='{"league_name":"Bundesliga 2014/2015"}'
RESP=$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/league")
assert "$RESP"

echo "-- Get leagues (we should find one element)"
RESP=$(curl -s $BASE_URL/leagues)
assertEquals "$RESP" "1" ". | length"
assertEquals "$RESP" "1" ".[] | .id"
assertEquals "$RESP"  "Bundesliga 2014/2015" ".[] | .league_name"

echo "-- Insert event"
JSON='{"teama":"FCB","teamb":"HSV","datetime":"2015-06-23 21:00:00","league_id":1,"round":1}'
RESP=$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/event")
assert "$RESP"

cd - && . include-after.sh