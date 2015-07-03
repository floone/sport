[ "$OPENSHIFT_TMP_DIR" == "" ] && echo "OPENSHIFT_TMP_DIR must be set" && exit 1
[ "$OPENSHIFT_HOMEDIR" == "" ] && echo "OPENSHIFT_HOMEDIR must be set" && exit 1
[ "$GRAB_EVENTS_URL " == "" ] && echo "GRAB_EVENTS_URL must be set" && exit 1
curl -s $GRAB_EVENTS_URL >$OPENSHIFT_TMP_DIR/fixtures.html || exit 2
$OPENSHIFT_HOMEDIR/scripts/import-events.sh || exit 4
