#/bin/bash

. include-before.sh

echo "-- Get leagues (should be empty)"
RESP=$(get $BASE_URL/leagues)
assertEquals "$RESP" "0" ". | length"

echo "-- Insert league"
JSON='{"league_name":"Bundesliga 2014/2015"}'
assert "$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/league")"

echo "-- Get leagues (we should find one element)"
RESP=$(get $BASE_URL/leagues)
assertEquals "$RESP" "1" ". | length"
assertEquals "$RESP" "1" ".[] | .id"
assertEquals "$RESP"  "Bundesliga 2014/2015" ".[] | .league_name"

echo "-- Insert event"
JSON='{"teama":"FCB","teamb":"HSV","datetime":"2015-06-23 21:00:00","league_id":1,"round":1}'
assert "$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/event")"

echo "-- Get events (we should find one element)"
RESP=$(get $BASE_URL/events/1)
assertEquals "$RESP" "1" ". | length"
assertEquals "$RESP" "1" ".[] | .id"
assertEquals "$RESP"  "FCB" ".[] | .teama"
assertEquals "$RESP"  "HSV" ".[] | .teamb"
assertEquals "$RESP"  "2015-06-23T21:00:00.000Z" ".[] | .datetime"
assertEquals "$RESP"  "1" ".[] | .league_id"
assertEquals "$RESP"  "1" ".[] | .round"

echo "-- Insert post"
JSON='{"username":"tester","text":"This is a test.","fetched_at":"2015-08-06 18:13:47","created_at":"2015-08-06 18:08:10","original_id_str":"C0FFEEBABE","event_id":1}'
assert "$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/post")"

cd - >/dev/null && . include-after.sh