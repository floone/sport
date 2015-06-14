## Sport

Turn social media data into a sport live stream.

### General

#### Example REST calls

```
    curl -s http://localhost:8080/posts/1 |jq '.[] | .username'
	curl -s http://localhost:8080/posts/1/since/97 |jq '.[] | .id'
```

#### Example MySQL queries

```
    select fetched_at, count(*) from post group by fetched_at;
```

### Openshift environment

#### Bootstrap

```
    rhc app-create sport nodejs-0.10 mysql-5.5 -s
	rhc cartridge-add cron-1.4 --app sport
```

#### Management basics:

```
    rhc ssh sport
    rhc tail -a sport
    rhc app show sport --gears quota
```

#### Twitter environment variables

In order to be able to fetch data from Twitter, following environment variables need to be set:

```
	rhc env set TW_CONSUMER_KEY=... -a sport
	rhc env set TW_CONSUMER_SECRET=... -a sport
	rhc env set TW_ACCESS_TOKEN=... -a sport
	rhc env set TW_ACCESS_TOKEN_SECRET=... -a sport
	rhc env set MYSQL_USERNAME=... -a sport
	rhc env set MYSQL_PASSWORD=... -a sport
```

### MySQL 5.5


#### Encoding

We had troubles saving certain characters. The error looked like this:

```
    Incorrect string value: '\xF0\x9D\x8C\x86' for column 'column_name' at row 1
```

Obviously what MySQL calls UTF8 is only a three-byte UTF8. More information can be found here:
https://mathiasbynens.be/notes/mysql-utf8mb4.
What we want is called utf8mb4. To achieve that, we need to alter the database (which has been created by Openshift):

```
    ALTER DATABASE sport CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

Also the client must use it as character set. For the command line client:

```
    SET NAMES utf8mb4
```

We are using node-orm2 which uses node-mysql under the hood. Fortunately, there is an option called _charset_  that can be passed to set utf8mb4 for the session.

#### Timezone

MySQL internally stores datetime as UTC. When selecting, it will convert to whatever is configured. When inserting, it will assume it to be in whatever is configured and convert to UTC. Thus, we configure UTC and leave conversion to the application. The application is responsible for providing datetimes in UTC format and interpreting them selected values as such as well.

Use case: An event starts at some datetime. Our users are interested in when the event starts in their timezone, not in our servers timezone.

```
    rhc env set OPENSHIFT_MYSQL_TIMEZONE="+00:00" -a sport
```

To do that in a local test instance of MySQL:

```
    SET @@global.time_zone='+00:00';
```
