## Sport

Turn social media data into a sport live stream.

Test deployment: http://sport-floone.rhcloud.com/.

All available calls: http://sport-floone.rhcloud.com/help.

### Installation

* Install NPM
* Install MySQL, create a database - see `db.sql`
* Set environment variables - see `env.sh-template`
* `npm install`
* `npm start`

### Getting started

Call `/help`, all known routes will be exposed:

	curl http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/help

My favourite sport is organized in leagues. Create a league:

	curl -u admin:$ADMIN_PASSWORD -d '{"league_name":"Bundesliga 2014/2015"}' \
		-H "Content-Type: application/json" \
		http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/admin/insert/league

In each season, a couple of events (games) take place. In most cases, the events are organized in rounds; however, there are exceptions to this rule like e.g. friendly games. Create an event:

	curl -u admin:$ADMIN_PASSWORD -d \
		'{"teama":"FCB","teamb":"HSV","datetime":"2015-06-23 21:00:00",\
		"league_id":1,"round":1}' -H "Content-Type: application/json" \
		http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/admin/insert/event

Now we can list the leagues, the (single) event of league 1, and the posts of this event:

	curl http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/leagues
	curl http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/events/1
	curl http://$OPENSHIFT_NODEJS_IP:$OPENSHIFT_NODEJS_PORT/posts/1

A cron job periodically tries to find social media posts related to each current event.

### Debug

Use https://github.com/node-inspector/node-inspector

	npm install -g node-inspector
	node-debug --web-port 8081 main.js

### Openshift environment

#### Bootstrap

	rhc app-create sport nodejs-0.10 mysql-5.5 -s
	rhc cartridge-add cron-1.4 --app sport

#### Management basics:

	rhc ssh sport
	rhc tail -a sport
	rhc app show sport --gears quota
	rhc tail sport -f app-root/logs/cron_minutely.log
	rhc app restart -a sport

### MySQL 5.5

#### Example Mysql queries

Show stats: How many posts have been fetched at what time? Maybe helpful for peak detection.

	select fetched_at, count(*) from post group by fetched_at;

Wipe all data:

	drop table post; drop table event; drop table league; drop table team;

#### Encoding

We had troubles saving certain characters. The error looked like this:

	Incorrect string value: '\xF0\x9D\x8C\x86' for column 'column_name' at row 1

Obviously what MySQL calls UTF8 is only a three-byte UTF8. More information can be found here:
https://mathiasbynens.be/notes/mysql-utf8mb4.
What we want is called utf8mb4. To achieve that, we need to alter the database (which has been created by Openshift):

	ALTER DATABASE sport CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

Also the client must use it as character set. For the command line client:

	SET NAMES utf8mb4

We are using node-orm2 which uses node-mysql under the hood. Fortunately, there is an option called _charset_  that can be passed to set utf8mb4 for the session.

#### Timezone

MySQL internally stores datetime as UTC. When selecting, it will convert to whatever is configured. When inserting, it will assume it to be in whatever is configured and convert to UTC. Thus, we configure UTC and leave conversion to the application. The application is responsible for providing datetimes in UTC format and interpreting the selected values as such as well.

Use case: An event starts at some datetime. Our users are interested in when the event starts in their timezone, not in our servers timezone.

	rhc env set OPENSHIFT_MYSQL_TIMEZONE="+00:00" -a sport
	rhc env set TZ=UTC -a sport

To do that in a local test instance of MySQL:

	SET time_zone = '+00:00';
	SET @@global.time_zone = '+00:00';
	SET GLOBAL time_zone = '+00:00';

To check, use

	SELECT @@global.time_zone, @@session.time_zone;
	SELECT TIMEDIFF(NOW(),CONVERT_TZ(NOW(),@@session.time_zone,'+00:00'));

#### mysqldump

Use the predefined variables to execute:

	mysqldump -h $OPENSHIFT_MYSQL_DB_HOST -P ${OPENSHIFT_MYSQL_DB_PORT:-3306} \
		-u ${OPENSHIFT_MYSQL_DB_USERNAME:-'admin'} \
		--password="$OPENSHIFT_MYSQL_DB_PASSWORD" sport

### Chart library

We use http://www.chartjs.org/ as a custom build -- line charts only.

	git clone https://github.com/nnnick/Chart.js.git
	cd Chart.js
	npm install
	npm install -g gulp
	gulp build --types=Line