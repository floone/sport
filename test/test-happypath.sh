#/bin/bash

. include-before.sh

echo "-- Get leagues (should be empty)"
RESP=$(get $BASE_URL/leagues)
assertEquals "$RESP" "0" ". | length"

echo "-- Insert league"
JSON='{"league_name":"Bundesliga 2014/2015"}'
assertOk "$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/league")"

echo "-- Get leagues (we should find one element)"
RESP=$(get $BASE_URL/leagues)
assertEquals "$RESP" "1" ". | length"
assertEquals "$RESP" "1" ".[] | .id"
assertEquals "$RESP"  "Bundesliga 2014/2015" ".[] | .league_name"

echo "-- Insert event"
JSON='{"teama":"FCB","teamb":"HSV","datetime":"2015-06-23 21:00:00","league_id":1,"round":1}'
assertOk "$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/event")"

echo "-- Get events (we should find one element)"
RESP=$(get $BASE_URL/events/1)
assertEquals "$RESP" "1" ". | length"
assertEquals "$RESP" "1" ".[] | .id"
assertEquals "$RESP"  "FCB" ".[] | .teama"
assertEquals "$RESP"  "HSV" ".[] | .teamb"
assertEquals "$RESP"  "2015-06-23T21:00:00.000Z" ".[] | .datetime"
assertEquals "$RESP"  "1" ".[] | .league_id"
assertEquals "$RESP"  "1" ".[] | .round"

echo "-- Insert posts"
for i in $(seq 1 1 100); do
    JSON='{"username":"tester","text":"This is a test post","fetched_at":"2015-08-06 18:13:47","created_at":"2015-08-06 18:08:10","original_id_str":"C0FFEEBABE","event_id":1}'
    assertOk "$(eval "$ADMIN_POST -d '$JSON' $ADMIN_URL/insert/post")"
done

echo "-- Get posts"
RESP=$(get $BASE_URL/posts/1)
assertEquals "$RESP" "50" ".posts | length"
for i in $(seq 1 1 50); do
    assertEquals "$RESP" "$i" ".posts | .[$(( i-1 ))] | .id"
done

echo "-- Get posts since"
RESP=$(get $BASE_URL/posts/1/since/20)
assertEquals "$RESP" "50" ".posts | length"
for i in $(seq 1 1 50); do
    assertEquals "$RESP" "$(( i + 20 ))" ".posts | .[$(( i-1 ))] | .id"
done

echo "-- Get posts since II"
RESP=$(get $BASE_URL/posts/1/since/90)
assertEquals "$RESP" "10" ".posts | length"
for i in $(seq 1 1 10); do
    assertEquals "$RESP" "$(( i + 90 ))" ".posts | .[$(( i-1 ))] | .id"
done

cd - >/dev/null && . include-after.sh
